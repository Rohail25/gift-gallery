import nodemailer from "nodemailer";

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

/**
 * Send an email using nodemailer
 */
export async function sendMail(options: EmailOptions): Promise<void> {
  try {
    await transporter.sendMail({
      from: `"Gift Gallery" <${process.env.SMTP_USER}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    });
  } catch (error) {
    console.error("Email sending failed:", error);
    throw new Error("Failed to send email");
  }
}

/**
 * Email Templates
 */

export const emailTemplates = {
  verificationOtp: (otp: string, name: string) => ({
    subject: "Gift Gallery – Email Verification OTP",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: 'Georgia', serif; background-color: #FAF5EF; margin: 0; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; background: #FFFDFC; border-radius: 12px; padding: 40px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
            .header { text-align: center; border-bottom: 2px solid #B8864A; padding-bottom: 20px; margin-bottom: 30px; }
            .logo { font-size: 32px; color: #B8864A; font-weight: bold; }
            .content { color: #6B4A32; line-height: 1.6; }
            .otp-box { background: #F3E7DB; border: 2px dashed #B8864A; border-radius: 8px; padding: 20px; text-align: center; margin: 30px 0; }
            .otp { font-size: 36px; font-weight: bold; color: #B8864A; letter-spacing: 8px; }
            .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #E6D5C7; color: #8D7463; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">Gift Gallery</div>
            </div>
            <div class="content">
              <h2 style="color: #6B4A32;">Welcome, ${name}!</h2>
              <p>Thank you for registering with Gift Gallery. To complete your registration, please verify your email address using the OTP below:</p>
              <div class="otp-box">
                <div style="color: #8D7463; font-size: 14px; margin-bottom: 10px;">Your Verification Code</div>
                <div class="otp">${otp}</div>
                <div style="color: #8D7463; font-size: 14px; margin-top: 10px;">Valid for 10 minutes</div>
              </div>
              <p>If you didn't create an account with Gift Gallery, please ignore this email.</p>
            </div>
            <div class="footer">
              <p>Gift Gallery – Your Premium Boutique</p>
              <p style="font-size: 12px;">This is an automated message, please do not reply.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  }),

  forgotPasswordOtp: (otp: string, name: string) => ({
    subject: "Gift Gallery – Password Reset OTP",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: 'Georgia', serif; background-color: #FAF5EF; margin: 0; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; background: #FFFDFC; border-radius: 12px; padding: 40px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
            .header { text-align: center; border-bottom: 2px solid #B8864A; padding-bottom: 20px; margin-bottom: 30px; }
            .logo { font-size: 32px; color: #B8864A; font-weight: bold; }
            .content { color: #6B4A32; line-height: 1.6; }
            .otp-box { background: #F3E7DB; border: 2px dashed #B8864A; border-radius: 8px; padding: 20px; text-align: center; margin: 30px 0; }
            .otp { font-size: 36px; font-weight: bold; color: #B8864A; letter-spacing: 8px; }
            .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; color: #856404; }
            .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #E6D5C7; color: #8D7463; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">Gift Gallery</div>
            </div>
            <div class="content">
              <h2 style="color: #6B4A32;">Password Reset Request</h2>
              <p>Hello ${name},</p>
              <p>We received a request to reset your password. Use the OTP below to proceed:</p>
              <div class="otp-box">
                <div style="color: #8D7463; font-size: 14px; margin-bottom: 10px;">Your Reset Code</div>
                <div class="otp">${otp}</div>
                <div style="color: #8D7463; font-size: 14px; margin-top: 10px;">Valid for 10 minutes</div>
              </div>
              <div class="warning">
                <strong>Security Alert:</strong> If you didn't request a password reset, please ignore this email and secure your account.
              </div>
            </div>
            <div class="footer">
              <p>Gift Gallery – Your Premium Boutique</p>
              <p style="font-size: 12px;">This is an automated message, please do not reply.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  }),

  inviteUser: (name: string, email: string, otp: string) => ({
    subject: "Gift Gallery – You've Been Invited to the Admin Panel",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: 'Georgia', serif; background-color: #FAF5EF; margin: 0; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; background: #FFFDFC; border-radius: 12px; padding: 40px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
            .header { text-align: center; border-bottom: 2px solid #B8864A; padding-bottom: 20px; margin-bottom: 30px; }
            .logo { font-size: 32px; color: #B8864A; font-weight: bold; }
            .content { color: #6B4A32; line-height: 1.6; }
            .otp-box { background: #F3E7DB; border: 2px dashed #B8864A; border-radius: 8px; padding: 20px; text-align: center; margin: 30px 0; }
            .otp { font-size: 36px; font-weight: bold; color: #B8864A; letter-spacing: 8px; }
            .cta-button { display: inline-block; background: #B8864A; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; margin-top: 20px; font-weight: bold; }
            .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #E6D5C7; color: #8D7463; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">Gift Gallery</div>
            </div>
            <div class="content">
              <h2 style="color: #6B4A32;">You've Been Invited!</h2>
              <p>Hello ${name},</p>
              <p>An administrator has created an account for you on Gift Gallery. To activate your account, please set your password using the OTP below:</p>
              <div class="otp-box">
                <div style="color: #8D7463; font-size: 14px; margin-bottom: 10px;">Your Setup Code</div>
                <div class="otp">${otp}</div>
                <div style="color: #8D7463; font-size: 14px; margin-top: 10px;">Valid for 10 minutes</div>
              </div>
              <p style="text-align: center;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?email=${encodeURIComponent(email)}" class="cta-button">
                  Set My Password
                </a>
              </p>
              <p>If you didn't expect this invitation, please ignore this email.</p>
            </div>
            <div class="footer">
              <p>Gift Gallery – Your Premium Boutique</p>
              <p style="font-size: 12px;">This is an automated message, please do not reply.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  }),

  orderConfirmation: (orderNumber: string, customerName: string, total: string) => ({
    subject: `Gift Gallery – Order Confirmation #${orderNumber}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: 'Georgia', serif; background-color: #FAF5EF; margin: 0; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; background: #FFFDFC; border-radius: 12px; padding: 40px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
            .header { text-align: center; border-bottom: 2px solid #B8864A; padding-bottom: 20px; margin-bottom: 30px; }
            .logo { font-size: 32px; color: #B8864A; font-weight: bold; }
            .content { color: #6B4A32; line-height: 1.6; }
            .order-box { background: #F3E7DB; border-radius: 8px; padding: 20px; margin: 20px 0; }
            .order-number { font-size: 24px; font-weight: bold; color: #B8864A; text-align: center; }
            .total { font-size: 28px; font-weight: bold; color: #6B4A32; text-align: center; margin-top: 15px; }
            .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #E6D5C7; color: #8D7463; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">Gift Gallery</div>
            </div>
            <div class="content">
              <h2 style="color: #6B4A32;">Order Confirmed!</h2>
              <p>Dear ${customerName},</p>
              <p>Thank you for your order. We're excited to prepare your luxury items.</p>
              <div class="order-box">
                <div style="color: #8D7463; text-align: center; margin-bottom: 10px;">Order Number</div>
                <div class="order-number">${orderNumber}</div>
                <div class="total">Rs. ${total}</div>
              </div>
              <p>You will receive updates about your order status via email and notifications.</p>
              <p>Payment Method: Cash on Delivery</p>
            </div>
            <div class="footer">
              <p>Gift Gallery – Your Premium Boutique</p>
              <p style="font-size: 12px;">Track your order in your account dashboard</p>
            </div>
          </div>
        </body>
      </html>
    `,
  }),

  deliveryOtp: (otp: string, orderNumber: string, customerName: string, codAmount: string) => ({
    subject: `Gift Gallery – Your Order is On The Way! #${orderNumber}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: 'Georgia', serif; background-color: #FAF5EF; margin: 0; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; background: #FFFDFC; border-radius: 12px; padding: 40px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
            .header { text-align: center; border-bottom: 2px solid #B8864A; padding-bottom: 20px; margin-bottom: 30px; }
            .logo { font-size: 32px; color: #B8864A; font-weight: bold; }
            .content { color: #6B4A32; line-height: 1.6; }
            .otp-box { background: #F3E7DB; border: 2px solid #B8864A; border-radius: 8px; padding: 20px; text-align: center; margin: 30px 0; }
            .otp { font-size: 42px; font-weight: bold; color: #B8864A; letter-spacing: 10px; }
            .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; color: #856404; }
            .amount { background: #e8f5e9; border-left: 4px solid #4caf50; padding: 15px; margin: 20px 0; color: #2e7d32; font-size: 18px; font-weight: bold; }
            .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #E6D5C7; color: #8D7463; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">Gift Gallery</div>
            </div>
            <div class="content">
              <h2 style="color: #6B4A32;">🚚 Your Order is On The Way!</h2>
              <p>Dear ${customerName},</p>
              <p>Great news! Your order <strong>#${orderNumber}</strong> has been picked up by our delivery partner and is on its way to you.</p>
              <div class="otp-box">
                <div style="color: #8D7463; font-size: 14px; margin-bottom: 10px;">Delivery Verification Code</div>
                <div class="otp">${otp}</div>
                <div style="color: #8D7463; font-size: 14px; margin-top: 10px;">No expiry - valid until delivery</div>
              </div>
              <div class="warning">
                <strong>⚠️ Important:</strong> Only share this OTP with the delivery rider AFTER you have received and inspected your order. Do not share this code with anyone before delivery.
              </div>
              <div class="amount">
                💰 Cash on Delivery Amount: Rs. ${codAmount}
              </div>
              <p>Please keep the exact amount ready for a smooth delivery experience.</p>
            </div>
            <div class="footer">
              <p>Gift Gallery – Your Premium Boutique</p>
              <p style="font-size: 12px;">For any queries, contact our support team</p>
            </div>
          </div>
        </body>
      </html>
    `,
  }),

  orderDelivered: (orderNumber: string, customerName: string) => ({
    subject: `Gift Gallery – Order Delivered Successfully #${orderNumber}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: 'Georgia', serif; background-color: #FAF5EF; margin: 0; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; background: #FFFDFC; border-radius: 12px; padding: 40px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
            .header { text-align: center; border-bottom: 2px solid #B8864A; padding-bottom: 20px; margin-bottom: 30px; }
            .logo { font-size: 32px; color: #B8864A; font-weight: bold; }
            .content { color: #6B4A32; line-height: 1.6; }
            .success-box { background: #e8f5e9; border-radius: 8px; padding: 30px; text-align: center; margin: 20px 0; }
            .checkmark { font-size: 64px; color: #4caf50; }
            .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #E6D5C7; color: #8D7463; font-size: 14px; }
            .cta-button { display: inline-block; background: #B8864A; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; margin-top: 20px; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">Gift Gallery</div>
            </div>
            <div class="content">
              <div class="success-box">
                <div class="checkmark">✓</div>
                <h2 style="color: #2e7d32; margin: 10px 0;">Order Delivered Successfully!</h2>
              </div>
              <p>Dear ${customerName},</p>
              <p>We're delighted to confirm that your order <strong>#${orderNumber}</strong> has been delivered successfully.</p>
              <p>We hope you love your luxury items from Gift Gallery!</p>
              <p style="text-align: center;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/account/orders/${orderNumber}/review" class="cta-button">
                  Leave a Review
                </a>
              </p>
              <p style="text-align: center; margin-top: 20px; color: #8D7463; font-size: 14px;">
                Your feedback helps us serve you better
              </p>
            </div>
            <div class="footer">
              <p>Gift Gallery – Your Premium Boutique</p>
              <p style="font-size: 12px;">Thank you for choosing Gift Gallery</p>
            </div>
          </div>
        </body>
      </html>
    `,
  }),

  quotationSent: (bookingNumber: string, customerName: string, quotationAmount: string, eventType: string, eventDate: string) => ({
    subject: `Gift Gallery Decor – Quotation Ready #${bookingNumber}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: 'Georgia', serif; background-color: #FAF5EF; margin: 0; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; background: #FFFDFC; border-radius: 12px; padding: 40px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
            .header { text-align: center; border-bottom: 2px solid #B8864A; padding-bottom: 20px; margin-bottom: 30px; }
            .logo { font-size: 32px; color: #B8864A; font-weight: bold; }
            .content { color: #6B4A32; line-height: 1.6; }
            .quotation-box { background: #F3E7DB; border-radius: 8px; padding: 25px; margin: 20px 0; }
            .amount { font-size: 32px; font-weight: bold; color: #B8864A; text-align: center; margin: 15px 0; }
            .event-details { background: white; border-radius: 6px; padding: 15px; margin: 15px 0; }
            .cta-button { display: inline-block; background: #B8864A; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; margin: 10px 5px; font-weight: bold; }
            .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #E6D5C7; color: #8D7463; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">Gift Gallery Decor</div>
            </div>
            <div class="content">
              <h2 style="color: #6B4A32;">Your Quotation is Ready!</h2>
              <p>Dear ${customerName},</p>
              <p>We've prepared a custom quotation for your ${eventType} decor booking.</p>
              <div class="quotation-box">
                <div style="color: #8D7463; text-align: center; margin-bottom: 10px;">Booking Number</div>
                <div style="font-size: 20px; font-weight: bold; color: #6B4A32; text-align: center;">${bookingNumber}</div>
                <div class="event-details">
                  <strong>Event Type:</strong> ${eventType}<br>
                  <strong>Event Date:</strong> ${eventDate}
                </div>
                <div style="color: #8D7463; text-align: center; margin-top: 20px;">Total Quotation Amount</div>
                <div class="amount">Rs. ${quotationAmount}</div>
              </div>
              <p style="text-align: center;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/account/bookings/${bookingNumber}" class="cta-button">
                  View & Accept Quotation
                </a>
              </p>
              <p style="text-align: center; margin-top: 20px; color: #8D7463; font-size: 14px;">
                Please review and respond to the quotation at your earliest convenience
              </p>
            </div>
            <div class="footer">
              <p>Gift Gallery Decor – Making Your Events Memorable</p>
              <p style="font-size: 12px;">Questions? Contact our team for assistance</p>
            </div>
          </div>
        </body>
      </html>
    `,
  }),
};
