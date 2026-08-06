import prisma from "@/lib/prisma";
import { generateOtp, hashOtp, getNoExpiryOtpExpiry } from "@/lib/otp";
import { sendMail, emailTemplates } from "@/lib/email";

/**
 * Invalidates any previous unverified delivery OTP for the order and
 * issues a fresh one. Delivery OTPs have no expiry and remain valid
 * until verified or replaced. Returns the plaintext OTP.
 */
export async function issueDeliveryOtp(orderId: number, userId: number): Promise<string> {
  const otp = generateOtp();
  const otpHash = await hashOtp(otp);

  await prisma.$transaction([
    prisma.deliveryOtp.updateMany({
      where: { order_id: orderId, verified_at: null, invalidated_at: null },
      data: { invalidated_at: new Date() },
    }),
    prisma.deliveryOtp.create({
      data: {
        order_id: orderId,
        user_id: userId,
        otp_hash: otpHash,
        expires_at: getNoExpiryOtpExpiry(),
      },
    }),
  ]);

  return otp;
}

/**
 * Sends (or re-sends) the delivery OTP email to the customer.
 * The OTP never expires; a new code replaces any previous unverified one.
 */
export async function sendDeliveryOtpEmail(
  order: {
    id: number;
    user_id: number;
    order_number: string;
    grand_total: { toString: () => string };
    user: { email: string; full_name: string };
  }
): Promise<{ otp: string }> {
  const otp = await issueDeliveryOtp(order.id, order.user_id);

  const template = emailTemplates.deliveryOtp(
    otp,
    order.order_number,
    order.user.full_name,
    order.grand_total.toString()
  );

  await sendMail({
    to: order.user.email,
    subject: template.subject,
    html: template.html,
  });

  return { otp };
}
