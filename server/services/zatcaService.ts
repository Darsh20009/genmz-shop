import crypto from 'crypto';

interface ZATCAInvoice {
  invoiceNumber: string;
  issueDate: Date;
  sellerName: string;
  sellerVatNumber: string;
  invoiceTotal: number;
  vatTotal: number;
  items: Array<{
    name: string;
    quantity: number;
    unitPrice: number;
    taxRate: number;
    total: number;
  }>;
}

interface TLVData {
  tag: number;
  value: string;
}

export class ZATCAService {
  private sellerName: string = process.env.ZATCA_SELLER_NAME || "Gen M&Z";
  private vatNumber: string = process.env.ZATCA_VAT_NUMBER || "";

  generateTLVBuffer(tlvData: TLVData[]): Buffer {
    const buffers: Buffer[] = [];
    
    for (const item of tlvData) {
      const tagBuffer = Buffer.from([item.tag]);
      const valueBuffer = Buffer.from(item.value, 'utf-8');
      const lengthBuffer = Buffer.from([valueBuffer.length]);
      
      buffers.push(tagBuffer, lengthBuffer, valueBuffer);
    }
    
    return Buffer.concat(buffers);
  }

  generateQRCode(invoice: ZATCAInvoice): string {
    const tlvData: TLVData[] = [
      { tag: 1, value: this.sellerName },
      { tag: 2, value: this.vatNumber },
      { tag: 3, value: invoice.issueDate.toISOString() },
      { tag: 4, value: invoice.invoiceTotal.toFixed(2) },
      { tag: 5, value: invoice.vatTotal.toFixed(2) },
    ];
    
    const tlvBuffer = this.generateTLVBuffer(tlvData);
    return tlvBuffer.toString('base64');
  }

  generateInvoiceNumber(): string {
    const prefix = "INV";
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${prefix}-${timestamp}-${random}`;
  }

  calculateVAT(subtotal: number, vatRate: number = 15): { vatAmount: number; total: number } {
    const vatAmount = subtotal * (vatRate / 100);
    return {
      vatAmount: Math.round(vatAmount * 100) / 100,
      total: Math.round((subtotal + vatAmount) * 100) / 100
    };
  }

  generateInvoiceHash(invoice: ZATCAInvoice): string {
    const data = JSON.stringify({
      invoiceNumber: invoice.invoiceNumber,
      issueDate: invoice.issueDate.toISOString(),
      total: invoice.invoiceTotal,
      vatTotal: invoice.vatTotal,
      items: invoice.items
    });
    
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  formatInvoiceForPrint(invoice: ZATCAInvoice, qrCode: string): string {
    const itemsHtml = invoice.items.map(item => `
      <tr>
        <td style="text-align: right; padding: 8px; border-bottom: 1px solid #eee;">${item.name}</td>
        <td style="text-align: center; padding: 8px; border-bottom: 1px solid #eee;">${item.quantity}</td>
        <td style="text-align: left; padding: 8px; border-bottom: 1px solid #eee;">${item.unitPrice.toFixed(2)} ر.س</td>
        <td style="text-align: left; padding: 8px; border-bottom: 1px solid #eee;">${item.total.toFixed(2)} ر.س</td>
      </tr>
    `).join('');

    return `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: 'Cairo', Arial, sans-serif; margin: 0; padding: 20px; }
          .invoice { max-width: 800px; margin: 0 auto; border: 1px solid #ddd; padding: 30px; }
          .header { text-align: center; margin-bottom: 30px; }
          .logo { font-size: 28px; font-weight: bold; }
          .zatca-badge { background: #2D8B32; color: white; padding: 5px 15px; border-radius: 4px; font-size: 12px; margin-top: 10px; display: inline-block; }
          .info-section { display: flex; justify-content: space-between; margin-bottom: 20px; }
          .info-box { background: #f9f9f9; padding: 15px; border-radius: 8px; flex: 1; margin: 0 5px; }
          .info-label { font-size: 12px; color: #666; margin-bottom: 5px; }
          .info-value { font-weight: bold; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th { background: #f0f0f0; padding: 12px 8px; text-align: right; font-weight: bold; }
          .totals { background: #f9f9f9; padding: 20px; border-radius: 8px; margin-top: 20px; }
          .total-row { display: flex; justify-content: space-between; padding: 8px 0; }
          .grand-total { font-size: 24px; font-weight: bold; color: #2D8B32; border-top: 2px solid #2D8B32; padding-top: 15px; margin-top: 10px; }
          .qr-section { text-align: center; margin-top: 30px; padding: 20px; background: #f9f9f9; border-radius: 8px; }
          .qr-code { max-width: 150px; }
          .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="invoice">
          <div class="header">
            <div class="logo">Gen M&Z</div>
            <p>فاتورة ضريبية مبسطة</p>
            <div class="zatca-badge">معتمدة من هيئة الزكاة والضريبة والجمارك</div>
          </div>
          
          <div class="info-section">
            <div class="info-box">
              <div class="info-label">رقم الفاتورة</div>
              <div class="info-value">${invoice.invoiceNumber}</div>
            </div>
            <div class="info-box">
              <div class="info-label">تاريخ الإصدار</div>
              <div class="info-value">${invoice.issueDate.toLocaleDateString('ar-SA')}</div>
            </div>
            <div class="info-box">
              <div class="info-label">الرقم الضريبي</div>
              <div class="info-value">${this.vatNumber}</div>
            </div>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>المنتج</th>
                <th>الكمية</th>
                <th>السعر</th>
                <th>الإجمالي</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>
          
          <div class="totals">
            <div class="total-row">
              <span>المجموع الفرعي:</span>
              <span>${(invoice.invoiceTotal - invoice.vatTotal).toFixed(2)} ر.س</span>
            </div>
            <div class="total-row">
              <span>ضريبة القيمة المضافة (15%):</span>
              <span>${invoice.vatTotal.toFixed(2)} ر.س</span>
            </div>
            <div class="total-row grand-total">
              <span>الإجمالي شامل الضريبة:</span>
              <span>${invoice.invoiceTotal.toFixed(2)} ر.س</span>
            </div>
          </div>
          
          <div class="qr-section">
            <p>امسح رمز QR للتحقق من صحة الفاتورة</p>
            <img class="qr-code" src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(qrCode)}" alt="QR Code">
          </div>
          
          <div class="footer">
            <p>شكراً لتسوقكم معنا - Gen M&Z</p>
            <p>للاستفسارات: support@genmz.com</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  async createZATCAInvoice(order: any): Promise<{ invoice: ZATCAInvoice; qrCode: string; html: string; hash: string }> {
    const items = order.items.map((item: any) => {
      const itemTotal = item.price * item.quantity;
      const taxAmount = itemTotal * 0.15;
      return {
        name: item.title,
        quantity: item.quantity,
        unitPrice: item.price,
        taxRate: 15,
        total: itemTotal + taxAmount
      };
    });

    const subtotal = parseFloat(order.subtotal || order.total);
    const vatAmount = parseFloat(order.vatAmount || (subtotal * 0.15).toFixed(2));
    const total = subtotal + vatAmount;

    const invoice: ZATCAInvoice = {
      invoiceNumber: this.generateInvoiceNumber(),
      issueDate: new Date(),
      sellerName: this.sellerName,
      sellerVatNumber: this.vatNumber,
      invoiceTotal: total,
      vatTotal: vatAmount,
      items
    };

    const qrCode = this.generateQRCode(invoice);
    const hash = this.generateInvoiceHash(invoice);
    const html = this.formatInvoiceForPrint(invoice, qrCode);

    return { invoice, qrCode, html, hash };
  }
}

export const zatcaService = new ZATCAService();
