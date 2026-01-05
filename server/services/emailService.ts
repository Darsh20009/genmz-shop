import nodemailer from "nodemailer";
import path from "path";
import fs from "fs";

// Initialize SMTP transporter - only if credentials are configured
const hasSmtpConfig = process.env.SMTP_USERNAME && process.env.SMTP_PASSWORD;

const transporter = hasSmtpConfig ? nodemailer.createTransport({
  host: process.env.SMTP_HOST || "pro.turbo-smtp.com",
  port: parseInt(process.env.SMTP_PORT || "465"),
  secure: process.env.SMTP_PORT === "465", // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USERNAME,
    pass: process.env.SMTP_PASSWORD,
  },
}) : null;

export interface OrderEmailData {
  customerName: string;
  customerEmail: string;
  orderId: string;
  orderTotal: string;
  items: Array<{
    title: string;
    quantity: number;
    price: number;
  }>;
  status?: string;
}

export async function sendOrderConfirmationEmail(data: OrderEmailData): Promise<void> {
  if (!data.customerEmail) {
    console.warn(`[EMAIL] Skipping email - no customer email provided`);
    return;
  }

  if (!transporter) {
    console.warn(`[EMAIL] Skipping email - SMTP not configured`);
    return;
  }

  try {
    const itemsHtml = data.items
      .map(
        (item) => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #ddd;">${item.title}</td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: center;">${item.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">${item.price.toFixed(2)} ر.س</td>
      </tr>
    `
      )
      .join("");

    const htmlContent = `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; direction: rtl; text-align: right; max-width: 700px; margin: 0 auto; background: white; padding: 0;">
        
        <!-- Header with Logo -->
        <div style="background: #1f1f1f; padding: 40px 20px; text-align: center; color: white; position: relative; overflow: hidden; border-bottom: 3px solid #d4af37;">
          <div style="position: absolute; top: 0; right: 0; width: 300px; height: 300px; background: rgba(255,255,255,0.03); border-radius: 50%; transform: translate(100px, -100px);"></div>
          <div style="position: relative; z-index: 1;">
            <img src="cid:logo" alt="GenMZ Shop Logo" style="max-width: 120px; height: auto; margin-bottom: 15px; display: block; margin-right: auto; margin-left: auto;">
            <div style="font-size: 32px; font-weight: bold; margin-bottom: 5px; color: white;">GenMZ Shop</div>
            <div style="font-size: 13px; opacity: 0.8; letter-spacing: 1px; border-top: 1px solid rgba(255,255,255,0.2); padding-top: 10px; color: #cccccc;">متجرك المفضل للتسوق الذكي</div>
          </div>
        </div>

        <!-- Main Content -->
        <div style="background: white; padding: 50px 30px;">
          <p style="font-size: 16px; color: #555; margin-bottom: 8px; line-height: 1.6;">السلام عليكم ورحمة الله وبركاته</p>
          <p style="font-size: 24px; font-weight: bold; color: #333; margin-bottom: 30px;">${data.customerName}</p>
          
          <div style="background: #f8f8f8; padding: 30px; border-radius: 12px; border-right: 5px solid #5a5a5a; margin-bottom: 30px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);">
            <p style="margin: 0; color: #4a4a4a; font-size: 13px; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 10px; font-weight: bold;">✓ تم تأكيد طلبك بنجاح</p>
            <p style="margin: 0; font-size: 32px; font-weight: bold; color: #1f1f1f;">رقم الطلب: <span style="color: #5a5a5a;">#${data.orderId.slice(-6).toUpperCase()}</span></p>
            <p style="margin: 10px 0 0 0; font-size: 12px; color: #7a7a7a;">تاريخ الطلب: ${new Date().toLocaleDateString('ar-SA')}</p>
          </div>

          <div style="background: #f5f5f5; padding: 20px 20px; border-radius: 8px; margin-bottom: 30px; border-right: 4px solid #7a7a7a;">
            <p style="margin: 0; color: #4a4a4a; font-size: 14px; line-height: 1.8;">
              نشكرك على اختيارك لمتجر GenMZ Shop. تم معالجة طلبك بنجاح وسيتم البدء في تجهيزه فوراً. سنرسل لك تحديثات مستمرة عبر البريد الإلكتروني في كل خطوة من خطوات الشحن والتوصيل.
            </p>
          </div>

          <h3 style="color: #1f1f1f; margin: 30px 0 20px 0; font-size: 18px; font-weight: bold; border-bottom: 2px solid #b8b8b8; padding-bottom: 10px;">📦 تفاصيل المنتجات</h3>
          
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <thead>
              <tr style="background: #3a3a3a; color: white;">
                <th style="padding: 15px; text-align: right; font-weight: bold;">المنتج</th>
                <th style="padding: 15px; text-align: center; font-weight: bold;">الكمية</th>
                <th style="padding: 15px; text-align: left; font-weight: bold;">السعر</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml.replace(/<tr>/g, '<tr style="border-bottom: 1px solid #eee; transition: background 0.2s;">').replace(/<td/g, '<td style="padding: 15px; color: #555;"')}
            </tbody>
          </table>

          <div style="background: #2a2a2a; padding: 30px; margin: 30px 0; border-radius: 12px; color: white; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15); border-left: 5px solid #d4af37;">
            <div style="display: flex; justify-content: space-between; align-items: center; text-align: center;">
              <div style="flex: 1;">
                <div style="font-size: 14px; opacity: 0.85; margin-bottom: 8px; color: #b8b8b8;">الإجمالي النهائي</div>
                <div style="font-size: 32px; font-weight: bold; color: white;">${data.orderTotal}</div>
              </div>
              <div style="font-size: 28px; opacity: 0.7; color: #b8b8b8;">ر.س</div>
            </div>
          </div>

          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 25px 0; border-right: 4px solid #5a5a5a;">
            <p style="margin: 0; color: #4a4a4a; font-size: 14px; line-height: 1.6;">
              <strong style="color: #5a5a5a;">📍 ماذا بعد؟</strong><br>
              سيتم تجهيز طلبك خلال 24-48 ساعة. ستصل إليك رسائل تحديث عند كل خطوة (التجهيز، الشحن، التوصيل).
            </p>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="https://www.genmz.store/orders" style="display: inline-block; background: #2a2a2a; color: white; padding: 15px 40px; border-radius: 30px; text-decoration: none; font-weight: bold; font-size: 16px; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15); transition: transform 0.2s; border: 2px solid #d4af37;">
              تتبع طلبك
            </a>
          </div>

          <div style="text-align: center; margin: 20px 0;">
            <a href="https://www.genmz.store" style="color: #5a5a5a; text-decoration: none; font-size: 14px; font-weight: bold;">
              العودة إلى المتجر →
            </a>
          </div>
        </div>

        <!-- Footer -->
        <div style="background: #1f1f1f; padding: 40px 20px; text-align: center; color: white; border-top: 3px solid #d4af37;">
          <div style="border-bottom: 1px solid rgba(212, 175, 55, 0.2); padding-bottom: 20px; margin-bottom: 20px;">
            <p style="margin: 0 0 15px 0; font-size: 14px; opacity: 1; color: white;">
              <strong style="font-size: 16px;">GenMZ Shop</strong><br>
              <span style="opacity: 0.85; font-size: 12px; color: #b8b8b8;">متجرك المفضل للتسوق الذكي</span>
            </p>
            <p style="margin: 12px 0; font-size: 12px; opacity: 0.9; color: #b8b8b8;">
              📧 البريد الرسمي: genmz@genmz.store<br>
              💬 الدعم الفني: <a href="mailto:genmz.sa@gmail.com" style="color: #d4af37; text-decoration: none; font-weight: bold;">genmz.sa@gmail.com</a><br>
              🌐 <a href="https://www.genmz.store" style="color: #d4af37; text-decoration: none; font-weight: bold;">www.genmz.store</a>
            </p>
          </div>
          <p style="margin: 0; color: #7a7a7a; font-size: 11px; line-height: 1.6;">
            © 2024-2025 GenMZ Shop | جميع الحقوق محفوظة<br>
            <span style="opacity: 0.7;">شكراً لتعاملك معنا</span>
          </p>
        </div>
      </div>
    `;

    // Get logo path
    const logoPath = path.join(process.cwd(), "attached_assets", "Gen_M&Z_LOGO_1766644527859.png");
    const attachments = fs.existsSync(logoPath) ? [{ filename: "logo.png", path: logoPath, cid: "logo" }] : [];

    await transporter.sendMail({
      from: process.env.SMTP_FROM_EMAIL || process.env.SMTP_USERNAME || "noreply@genmz.store",
      to: data.customerEmail,
      subject: `تأكيد الطلب #${data.orderId.slice(-6).toUpperCase()} - GenMZ Shop`,
      html: htmlContent,
      attachments,
    });

    console.log(`[EMAIL] Order confirmation sent to ${data.customerEmail}`);
  } catch (error) {
    console.error(`[EMAIL] Failed to send order confirmation:`, error);
  }
}

export async function sendOrderStatusUpdateEmail(
  data: OrderEmailData & { previousStatus?: string }
): Promise<void> {
  if (!data.customerEmail) {
    console.warn(`[EMAIL] Skipping email - no customer email provided`);
    return;
  }

  if (!transporter) {
    console.warn(`[EMAIL] Skipping email - SMTP not configured`);
    return;
  }

  try {
    const statusMessages: Record<string, string> = {
      new: "تم استقبال الطلب بنجاح",
      processing: "جاري معالجة الطلب",
      shipped: "تم شحن الطلب",
      completed: "تم استكمال الطلب بنجاح",
      cancelled: "تم إلغاء الطلب",
      returned: "تم استرجاع الطلب",
    };

    const statusColors: Record<string, string> = {
      new: "#667eea",
      processing: "#f39c12",
      shipped: "#3498db",
      completed: "#27ae60",
      cancelled: "#e74c3c",
      returned: "#95a5a6",
    };

    const statusColor = statusColors[data.status || "processing"] || "#667eea";

    const htmlContent = `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; direction: rtl; text-align: right; max-width: 700px; margin: 0 auto; background: white; padding: 0;">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, ${statusColor} 0%, ${statusColor}cc 100%); padding: 50px 20px; text-align: center; color: white; position: relative; overflow: hidden;">
          <div style="position: absolute; top: 0; right: 0; width: 300px; height: 300px; background: rgba(255,255,255,0.1); border-radius: 50%; transform: translate(100px, -100px);"></div>
          <div style="position: relative; z-index: 1;">
            <div style="font-size: 36px; font-weight: bold; margin-bottom: 10px;">GenMZ Shop</div>
            <div style="font-size: 18px; opacity: 0.95; margin-bottom: 15px;">📬 تحديث مهم على طلبك</div>
            <div style="font-size: 13px; opacity: 0.85; letter-spacing: 1px;">نحن معك في كل خطوة</div>
          </div>
        </div>

        <!-- Main Content -->
        <div style="background: white; padding: 40px 30px;">
          <p style="font-size: 18px; color: #333; margin-bottom: 5px;">السلام عليكم ورحمة الله وبركاته</p>
          <p style="font-size: 20px; font-weight: bold; color: ${statusColor}; margin-bottom: 25px;">${data.customerName}</p>
          
          <div style="background: linear-gradient(135deg, rgba(${statusColor === "#27ae60" ? "39, 174, 96" : statusColor === "#f39c12" ? "243, 156, 18" : statusColor === "#3498db" ? "52, 152, 219" : statusColor === "#e74c3c" ? "231, 76, 60" : "102, 126, 234"}, 0.15) 0%, rgba(${statusColor === "#27ae60" ? "39, 174, 96" : statusColor === "#f39c12" ? "243, 156, 18" : statusColor === "#3498db" ? "52, 152, 219" : statusColor === "#e74c3c" ? "231, 76, 60" : "102, 126, 234"}, 0.1) 100%); padding: 25px; border-radius: 12px; border-right: 5px solid ${statusColor}; margin-bottom: 30px; box-shadow: 0 2px 8px rgba(${statusColor === "#27ae60" ? "39, 174, 96" : statusColor === "#f39c12" ? "243, 156, 18" : statusColor === "#3498db" ? "52, 152, 219" : statusColor === "#e74c3c" ? "231, 76, 60" : "102, 126, 234"}, 0.1);">
            <p style="margin: 0; color: ${statusColor}; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">✓ ${statusMessages[data.status || "processing"] || "تحديث حالة الطلب"}</p>
            <p style="margin: 0; font-size: 28px; font-weight: bold; color: #333;">رقم الطلب: <span style="color: ${statusColor};">#${data.orderId.slice(-6).toUpperCase()}</span></p>
          </div>

          <div style="background: #f8f9ff; padding: 20px 20px; border-radius: 8px; margin-bottom: 25px; border-right: 4px solid ${statusColor};">
            <p style="margin: 0; color: #555; font-size: 14px; line-height: 1.6;">
              حالة طلبك تم تحديثها! طلبك الآن في مرحلة <strong style="color: ${statusColor};">${data.status === "processing" ? "معالجة" : data.status === "shipped" ? "شحن" : data.status === "completed" ? "استكمال" : data.status === "cancelled" ? "إلغاء" : data.status === "returned" ? "استرجاع" : "معالجة"}</strong>.
            </p>
          </div>

          <div style="background: linear-gradient(135deg, rgba(${statusColor === "#27ae60" ? "39, 174, 96" : statusColor === "#f39c12" ? "243, 156, 18" : statusColor === "#3498db" ? "52, 152, 219" : statusColor === "#e74c3c" ? "231, 76, 60" : "102, 126, 234"}, 0.1) 0%, rgba(${statusColor === "#27ae60" ? "39, 174, 96" : statusColor === "#f39c12" ? "243, 156, 18" : statusColor === "#3498db" ? "52, 152, 219" : statusColor === "#e74c3c" ? "231, 76, 60" : "102, 126, 234"}, 0.05) 100%); padding: 20px; margin: 20px 0; border-radius: 8px; border-right: 4px solid ${statusColor};">
            <div style="font-size: 14px; color: #666;">إجمالي الطلب</div>
            <div style="font-size: 26px; font-weight: bold; color: ${statusColor}; margin-top: 8px;">${data.orderTotal} ر.س</div>
          </div>

          <p style="color: #666; line-height: 1.8; margin: 25px 0;">
            شكراً لك على اختيارك متجرنا. نحن نعمل بجد لضمان توصيل طلبك في أفضل حالة ممكنة وفي الوقت المحدد!
          </p>

          <div style="text-align: center; margin: 30px 0;">
            <a href="https://www.genmz.store/orders" style="display: inline-block; background: linear-gradient(135deg, ${statusColor} 0%, ${statusColor}cc 100%); color: white; padding: 15px 40px; border-radius: 30px; text-decoration: none; font-weight: bold; font-size: 16px; box-shadow: 0 4px 15px rgba(${statusColor === "#27ae60" ? "39, 174, 96" : statusColor === "#f39c12" ? "243, 156, 18" : statusColor === "#3498db" ? "52, 152, 219" : statusColor === "#e74c3c" ? "231, 76, 60" : "102, 126, 234"}, 0.3); transition: transform 0.2s;">
              تتبع طلبك الآن
            </a>
          </div>

          <div style="text-align: center; margin: 20px 0;">
            <a href="https://www.genmz.store" style="color: ${statusColor}; text-decoration: none; font-size: 14px; font-weight: bold;">
              زيارة المتجر →
            </a>
          </div>
        </div>

        <!-- Footer -->
        <div style="background: #1f1f1f; padding: 40px 20px; text-align: center; color: white; border-top: 3px solid #d4af37;">
          <div style="border-bottom: 1px solid rgba(212, 175, 55, 0.2); padding-bottom: 20px; margin-bottom: 20px;">
            <p style="margin: 0 0 15px 0; font-size: 14px; opacity: 1; color: white;">
              <strong style="font-size: 16px;">GenMZ Shop</strong><br>
              <span style="opacity: 0.85; font-size: 12px; color: #b8b8b8;">متجرك المفضل للتسوق الذكي</span>
            </p>
            <p style="margin: 12px 0; font-size: 12px; opacity: 0.9; color: #b8b8b8;">
              📧 البريد الرسمي: genmz@genmz.store<br>
              💬 الدعم الفني: <a href="mailto:genmz.sa@gmail.com" style="color: #d4af37; text-decoration: none; font-weight: bold;">genmz.sa@gmail.com</a><br>
              🌐 <a href="https://www.genmz.store" style="color: #d4af37; text-decoration: none; font-weight: bold;">www.genmz.store</a>
            </p>
          </div>
          <p style="margin: 0; color: #7a7a7a; font-size: 11px; line-height: 1.6;">
            © 2024-2025 GenMZ Shop | جميع الحقوق محفوظة<br>
            <span style="opacity: 0.7;">شكراً لتعاملك معنا</span>
          </p>
        </div>
      </div>
    `;

    // Get logo path
    const logoPath = path.join(process.cwd(), "attached_assets", "Gen_M&Z_LOGO_1766644527859.png");
    const attachments = fs.existsSync(logoPath) ? [{ filename: "logo.png", path: logoPath, cid: "logo" }] : [];

    await transporter.sendMail({
      from: process.env.SMTP_FROM_EMAIL || process.env.SMTP_USERNAME || "noreply@genmz.store",
      to: data.customerEmail,
      subject: `تحديث الطلب #${data.orderId.slice(-6).toUpperCase()} - ${statusMessages[data.status || "processing"]}`,
      html: htmlContent,
      attachments,
    });

    console.log(`[EMAIL] Order status update sent to ${data.customerEmail}`);
  } catch (error) {
    console.error(`[EMAIL] Failed to send order status update:`, error);
  }
}
