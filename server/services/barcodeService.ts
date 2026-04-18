type BarcodeType = 'CODE128' | 'EAN13' | 'EAN8' | 'UPC' | 'CODE39';

interface BarcodeOptions {
  width?: number;
  height?: number;
  displayValue?: boolean;
  fontSize?: number;
  margin?: number;
}

export class BarcodeService {
  private readonly CODE128_PATTERNS: { [key: string]: string } = {
    ' ': '11011001100', '!': '11001101100', '"': '11001100110', '#': '10010011000',
    '$': '10010001100', '%': '10001001100', '&': '10011001000', "'": '10011000100',
    '(': '10001100100', ')': '11001001000', '*': '11001000100', '+': '11000100100',
    ',': '10110011100', '-': '10011011100', '.': '10011001110', '/': '10111001100',
    '0': '10011101100', '1': '10011100110', '2': '11001110010', '3': '11001011100',
    '4': '11001001110', '5': '11011100100', '6': '11001110100', '7': '11101101110',
    '8': '11101001100', '9': '11100101100', ':': '11100100110', ';': '11101100100',
    '<': '11100110100', '=': '11100110010', '>': '11011011000', '?': '11011000110',
    '@': '11000110110', 'A': '10100011000', 'B': '10001011000', 'C': '10001000110',
    'D': '10110001000', 'E': '10001101000', 'F': '10001100010', 'G': '11010001000',
    'H': '11000101000', 'I': '11000100010', 'J': '10110111000', 'K': '10110001110',
    'L': '10001101110', 'M': '10111011000', 'N': '10111000110', 'O': '10001110110',
    'P': '11101110110', 'Q': '11010001110', 'R': '11000101110', 'S': '11011101000',
    'T': '11011100010', 'U': '11011101110', 'V': '11101011000', 'W': '11101000110',
    'X': '11100010110', 'Y': '11101101000', 'Z': '11101100010'
  };

  generateSKU(prefix: string = 'SKU'): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${prefix}-${timestamp}${random}`;
  }

  generateEAN13(): string {
    const countryCode = '628';
    const manufacturerCode = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
    const productCode = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    const baseCode = countryCode + manufacturerCode + productCode;
    const checkDigit = this.calculateEAN13CheckDigit(baseCode);
    return baseCode + checkDigit;
  }

  private calculateEAN13CheckDigit(code: string): string {
    let sum = 0;
    for (let i = 0; i < 12; i++) {
      sum += parseInt(code[i]) * (i % 2 === 0 ? 1 : 3);
    }
    const checkDigit = (10 - (sum % 10)) % 10;
    return checkDigit.toString();
  }

  generateBarcodeSVG(value: string, options: BarcodeOptions = {}): string {
    const {
      width = 2,
      height = 80,
      displayValue = true,
      fontSize = 14,
      margin = 10
    } = options;

    let encoded = this.encodeCode128(value);
    const barWidth = encoded.length * width;
    const totalHeight = displayValue ? height + fontSize + 10 : height;
    const totalWidth = barWidth + margin * 2;

    let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="${totalHeight + margin * 2}">`;
    svg += `<rect width="100%" height="100%" fill="white"/>`;

    let x = margin;
    for (let i = 0; i < encoded.length; i++) {
      if (encoded[i] === '1') {
        svg += `<rect x="${x}" y="${margin}" width="${width}" height="${height}" fill="black"/>`;
      }
      x += width;
    }

    if (displayValue) {
      const textX = totalWidth / 2;
      const textY = margin + height + fontSize + 5;
      svg += `<text x="${textX}" y="${textY}" text-anchor="middle" font-family="monospace" font-size="${fontSize}">${value}</text>`;
    }

    svg += '</svg>';
    return svg;
  }

  private encodeCode128(value: string): string {
    const START_B = '11010010000';
    const STOP = '1100011101011';
    
    let encoded = START_B;
    let checksum = 104;

    for (let i = 0; i < value.length; i++) {
      const char = value[i];
      const charCode = char.charCodeAt(0) - 32;
      checksum += charCode * (i + 1);
      
      const pattern = this.getCode128Pattern(charCode);
      encoded += pattern;
    }

    const checksumChar = checksum % 103;
    encoded += this.getCode128Pattern(checksumChar);
    encoded += STOP;

    return encoded;
  }

  private getCode128Pattern(code: number): string {
    const patterns = [
      '11011001100', '11001101100', '11001100110', '10010011000', '10010001100',
      '10001001100', '10011001000', '10011000100', '10001100100', '11001001000',
      '11001000100', '11000100100', '10110011100', '10011011100', '10011001110',
      '10111001100', '10011101100', '10011100110', '11001110010', '11001011100',
      '11001001110', '11011100100', '11001110100', '11101101110', '11101001100',
      '11100101100', '11100100110', '11101100100', '11100110100', '11100110010',
      '11011011000', '11011000110', '11000110110', '10100011000', '10001011000',
      '10001000110', '10110001000', '10001101000', '10001100010', '11010001000',
      '11000101000', '11000100010', '10110111000', '10110001110', '10001101110',
      '10111011000', '10111000110', '10001110110', '11101110110', '11010001110',
      '11000101110', '11011101000', '11011100010', '11011101110', '11101011000',
      '11101000110', '11100010110', '11101101000', '11101100010', '11100011010',
      '11101111010', '11001000010', '11110001010', '10100110000', '10100001100',
      '10010110000', '10010000110', '10000101100', '10000100110', '10110010000',
      '10110000100', '10011010000', '10011000010', '10000110100', '10000110010',
      '11000010010', '11001010000', '11110111010', '11000010100', '10001111010',
      '10100111100', '10010111100', '10010011110', '10111100100', '10011110100',
      '10011110010', '11110100100', '11110010100', '11110010010', '11011011110',
      '11011110110', '11110110110', '10101111000', '10100011110', '10001011110'
    ];
    return patterns[code] || patterns[0];
  }

  async generateBarcodeDataURL(value: string, options: BarcodeOptions = {}): Promise<string> {
    const svg = this.generateBarcodeSVG(value, options);
    const base64 = Buffer.from(svg).toString('base64');
    return `data:image/svg+xml;base64,${base64}`;
  }

  generateProductLabel(product: any, variant: any): string {
    const barcode = variant?.sku || product.barcode || this.generateSKU();
    const barcodeSVG = this.generateBarcodeSVG(barcode, { height: 50, fontSize: 10 });
    
    return `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <style>
          @page { size: 50mm 30mm; margin: 0; }
          body { margin: 0; padding: 3mm; font-family: Arial, sans-serif; }
          .label { width: 44mm; height: 24mm; border: 1px solid #ddd; padding: 2mm; box-sizing: border-box; }
          .product-name { font-size: 8pt; font-weight: bold; margin-bottom: 2mm; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
          .variant-info { font-size: 6pt; color: #666; margin-bottom: 2mm; }
          .price { font-size: 10pt; font-weight: bold; color: #000; margin-bottom: 2mm; }
          .barcode { text-align: center; }
          .barcode svg { max-width: 100%; height: auto; }
        </style>
      </head>
      <body>
        <div class="label">
          <div class="product-name">${product.name}</div>
          ${variant ? `<div class="variant-info">${variant.color || ''} - ${variant.size || ''}</div>` : ''}
          <div class="price">${product.price} ر.س</div>
          <div class="barcode">${barcodeSVG}</div>
        </div>
      </body>
      </html>
    `;
  }

  generateBatchLabels(products: any[], count: number = 1): string {
    const labels = products.flatMap(product => {
      const variants = product.variants || [null];
      return variants.flatMap((variant: any) => {
        return Array(count).fill(null).map(() => {
          const barcode = variant?.sku || product.barcode || this.generateSKU();
          return { product, variant, barcode };
        });
      });
    });

    const labelHtml = labels.map(({ product, variant, barcode }) => {
      const barcodeSVG = this.generateBarcodeSVG(barcode, { height: 40, fontSize: 8, width: 1.5 });
      return `
        <div class="label">
          <div class="product-name">${product.name}</div>
          ${variant ? `<div class="variant-info">${variant.color || ''} ${variant.size || ''}</div>` : ''}
          <div class="price">${product.price} ر.س</div>
          <div class="barcode">${barcodeSVG}</div>
        </div>
      `;
    }).join('');

    return `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <style>
          @page { size: A4; margin: 10mm; }
          @media print { body { -webkit-print-color-adjust: exact; } }
          body { margin: 0; padding: 10mm; font-family: Arial, sans-serif; }
          .labels-container { display: flex; flex-wrap: wrap; gap: 5mm; }
          .label { width: 48mm; height: 28mm; border: 1px solid #ccc; padding: 2mm; box-sizing: border-box; page-break-inside: avoid; }
          .product-name { font-size: 8pt; font-weight: bold; margin-bottom: 1mm; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
          .variant-info { font-size: 6pt; color: #666; margin-bottom: 1mm; }
          .price { font-size: 9pt; font-weight: bold; margin-bottom: 1mm; }
          .barcode { text-align: center; }
          .barcode svg { max-width: 100%; height: 35px; }
        </style>
      </head>
      <body>
        <div class="labels-container">
          ${labelHtml}
        </div>
      </body>
      </html>
    `;
  }
}

export const barcodeService = new BarcodeService();
