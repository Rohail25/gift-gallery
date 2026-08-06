import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { compare } from "bcryptjs";
import prisma from "./prisma";
import { sendMail, emailTemplates } from "./email";
import { generateOtp, hashOtp } from "./otp";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: string;
      emailVerified?: Date | null;
      status: string;
    };
  }

  interface User {
    role: string;
    status: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
    status: string;
  }
}

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/auth/login",
    signOut: "/auth/logout",
    error: "/auth/error",
    verifyRequest: "/auth/verify-email",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      allowDangerousEmailAccountLinking: true,
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          role: "CUSTOMER",
          status: "active",
        };
      },
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) {
          throw new Error("Invalid email or password");
        }

        if (user.status !== "active") {
          throw new Error("Account is blocked or suspended");
        }

        if (!user.email_verified_at) {
          throw new Error("Please verify your email first");
        }

        if (!user.password_hash) {
          throw new Error("Please use Google login or reset your password");
        }

        const isValidPassword = await compare(
          credentials.password,
          user.password_hash
        );

        if (!isValidPassword) {
          throw new Error("Invalid email or password");
        }

        // Update last login time
        await prisma.user.update({
          where: { id: user.id },
          data: { last_login_at: new Date() },
        });

        return {
          id: user.id.toString(),
          email: user.email,
          name: user.full_name,
          role: user.role,
          status: user.status,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account, trigger, session }) {
      if (user) {
        // Without an adapter, OAuth user.id is the provider sub.
        // Resolve the real DB user so id/role/status stay correct.
        if (account?.provider === "google") {
          const dbUser = await prisma.user.findUnique({
            where: { email: user.email || "" },
          });
          if (dbUser) {
            token.id = dbUser.id.toString();
            token.role = dbUser.role;
            token.status = dbUser.status;
          } else {
            token.id = user.id;
            token.role = user.role || "CUSTOMER";
            token.status = user.status || "active";
          }
        } else {
          token.id = user.id;
          token.role = user.role;
          token.status = user.status;
        }
      }

      // Update session if user data is updated
      if (trigger === "update" && session) {
        token.name = session.name;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role as string;
        session.user.status = token.status as string;
      }
      return session;
    },
    async signIn({ user, account, profile, email }) {
      try {
        // Handle Google OAuth
        if (account?.provider === "google" && profile?.email) {
          const existingUser = await prisma.user.findUnique({
            where: { email: profile.email },
          });

          if (existingUser) {
            // Link Google account if not already linked
            if (!existingUser.google_id) {
              await prisma.user.update({
                where: { id: existingUser.id },
                data: {
                  google_id: profile.sub,
                  email_verified_at: existingUser.email_verified_at || new Date(),
                  last_login_at: new Date(),
                },
              });
            }
            return true;
          } else {
            // Create new user for Google OAuth
            await prisma.user.create({
              data: {
                full_name: profile.name || profile.email,
                email: profile.email,
                google_id: profile.sub,
                auth_provider: "google",
                role: "CUSTOMER",
                status: "active",
                email_verified_at: new Date(),
                last_login_at: new Date(),
              },
            });
            return true;
          }
        }

        return true;
      } catch (error) {
        console.error("SignIn callback error:", error);
        return false;
      }
    },
  },
  events: {
    async createUser({ user }) {
      // Send welcome email when user is created
      if (user.email) {
        try {
          const otp = generateOtp();
          const otpHash = await hashOtp(otp);
          const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

          // Store OTP
          await prisma.verificationOtp.create({
            data: {
              user_id: parseInt(user.id),
              email: user.email,
              purpose: "email_verification",
              otp_hash: otpHash,
              expires_at: expiresAt,
            },
          });

          // Send email
          const template = emailTemplates.verificationOtp(otp, user.name || "Guest");
          await sendMail({
            to: user.email,
            subject: template.subject,
            html: template.html,
          });
        } catch (error) {
          console.error("Failed to send welcome email:", error);
        }
      }
    },
  },
  debug: process.env.NODE_ENV === "development",
  secret: process.env.NEXTAUTH_SECRET,
};
