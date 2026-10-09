import nodemailer from "nodemailer";

export interface OrderItemEmailData {
  productName: string;
  quantity: number;
  price: number;
  total: number;
}

export interface SendOrderEmailParams {
  toEmail: string;
  userName: string;
  orderId: string;
  items: OrderItemEmailData[];
  grandTotal: number;
}

export interface EmailResult {
  success: boolean;
  messageId?: string;
  previewUrl?: string | false;
  error?: string;
}

/**
 * Creates and returns a nodemailer transporter configured with environment variables
 * or falls back to an Ethereal test account if credentials are not configured.
 */
async function getTransporter() {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (host && user && pass) {
    return nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      connectionTimeout: 5000,
      greetingTimeout: 5000,
      socketTimeout: 10000,
      auth: { user, pass },
    });
  }

  // When SMTP is not configured in .env, return null to use fast local logger
  return null;
}

/**
 * Sends order summary email to the user's registered email address.
 * Matches the format specified in the AMEX Technology Assessment Brief.
 */
export async function sendOrderSummaryEmail({
  toEmail,
  userName,
  orderId,
  items,
  grandTotal,
}: SendOrderEmailParams): Promise<EmailResult> {
  const fromAddress = process.env.SMTP_FROM || '"AMEX Technology Store" <orders@amexstore.com>';

  // Text version exact table layout from AMEX brief
  const itemsText = items
    .map(
      (item) =>
        `${item.productName.padEnd(20)} ${item.quantity.toString().padEnd(5)} Rs. ${item.price
          .toLocaleString()
          .padEnd(9)} Rs. ${item.total.toLocaleString()}`
    )
    .join("\n");

  const plainText = `Hi ${userName}, thanks for your order. Here is your bill:\n\n` +
    `Product              Qty   Price       Total\n` +
    `${"-".repeat(50)}\n` +
    `${itemsText}\n` +
    `${"-".repeat(50)}\n` +
    `Grand total                            Rs. ${grandTotal.toLocaleString()}\n\n` +
    `Order Reference: ${orderId}\n` +
    `Thank you for shopping with AMEX Technology Store.`;

  // Rich HTML version matching AMEX branding
  const itemsHtml = items
    .map(
      (item) => `
      <tr style="border-bottom: 1px solid #e5e7eb;">
        <td style="padding: 12px 16px; font-weight: 500; color: #111827;">${item.productName}</td>
        <td style="padding: 12px 16px; text-align: center; color: #374151;">${item.quantity}</td>
        <td style="padding: 12px 16px; text-align: right; color: #374151;">Rs. ${item.price.toLocaleString()}</td>
        <td style="padding: 12px 16px; text-align: right; font-weight: 600; color: #111827;">Rs. ${item.total.toLocaleString()}</td>
      </tr>`
    )
    .join("");

  const htmlContent = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <title>Your order summary</title>
  </head>
  <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f9fafb; margin: 0; padding: 24px; color: #1f2937;">
    <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e5e7eb; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
      <!-- Header -->
      <div style="background-color: #002663; padding: 24px; color: #ffffff; text-align: left;">
        <div style="display: inline-block; background-color: #006fcf; color: #ffffff; font-weight: bold; font-size: 14px; padding: 4px 10px; border-radius: 4px; margin-bottom: 12px;">AMEX TECHNOLOGY</div>
        <h1 style="margin: 0; font-size: 22px; font-weight: 700;">Order Confirmation</h1>
        <p style="margin: 6px 0 0 0; color: #93c5fd; font-size: 14px;">Order ID: ${orderId}</p>
      </div>

      <!-- Body Content -->
      <div style="padding: 24px;">
        <p style="font-size: 16px; margin: 0 0 20px 0; color: #374151;">
          Hi <strong>${userName}</strong>, thanks for your order. Here is your bill:
        </p>

        <!-- Bill Table -->
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 14px;">
          <thead>
            <tr style="background-color: #f3f4f6; color: #374151; font-weight: 600;">
              <th style="padding: 10px 16px; text-align: left; border-radius: 6px 0 0 6px;">Product</th>
              <th style="padding: 10px 16px; text-align: center;">Qty</th>
              <th style="padding: 10px 16px; text-align: right;">Price</th>
              <th style="padding: 10px 16px; text-align: right; border-radius: 0 6px 6px 0;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
          <tfoot>
            <tr style="background-color: #f8fafc; font-weight: bold;">
              <td colspan="3" style="padding: 14px 16px; text-align: right; color: #111827; font-size: 15px;">Grand total</td>
              <td style="padding: 14px 16px; text-align: right; color: #006fcf; font-size: 17px;">Rs. ${grandTotal.toLocaleString()}</td>
            </tr>
          </tfoot>
        </table>

        <div style="background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 12px 16px; margin-top: 16px;">
          <p style="margin: 0; font-size: 13px; color: #1e40af;">
            ✓ Your order has been placed and is being processed for delivery. AMEX Express Delivery is free for all orders.
          </p>
        </div>
      </div>

      <!-- Footer -->
      <div style="background-color: #f9fafb; border-top: 1px solid #e5e7eb; padding: 16px 24px; font-size: 12px; color: #6b7280; text-align: center;">
        <p style="margin: 0;">This email was sent to ${toEmail} as part of your AMEX Technology order confirmation.</p>
        <p style="margin: 4px 0 0 0;">© ${new Date().getFullYear()} AMEX Technology Store. All rights reserved.</p>
      </div>
    </div>
  </body>
  </html>
  `;

  try {
    const transporter = await getTransporter();

    if (!transporter) {
      console.log("📨 [MOCK EMAIL DISPATCHED TO CONSOLE]\n" + plainText);
      return {
        success: true,
        messageId: "mock-" + Date.now(),
        previewUrl: false,
      };
    }

    const info = await transporter.sendMail({
      from: fromAddress,
      to: toEmail,
      subject: "Your order summary",
      text: plainText,
      html: htmlContent,
    });

    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log("📬 Order Summary Email Preview URL (Ethereal):", previewUrl);
    }

    return {
      success: true,
      messageId: info.messageId,
      previewUrl: previewUrl || false,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error sending email";
    console.error("❌ Failed to send order email:", errorMessage);
    // Never crash the application on email failure as specified in AMEX brief
    return {
      success: false,
      error: errorMessage,
    };
  }
}
