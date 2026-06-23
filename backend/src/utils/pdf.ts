import PDFDocument from 'pdfkit';
import { PassThrough } from 'stream';

export interface InvoicePdfData {
  invoiceNo: string;
  residentName: string;
  roomName: string;
  period: string;
  date: string;
  roomRent: number;
  messCharges: number;
  laundryCharges: number;
  gst: number;
  total: number;
  status: string;
}

export function generateInvoicePdf(data: InvoicePdfData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const stream = new PassThrough();
    const chunks: Buffer[] = [];

    stream.on('data', (chunk) => chunks.push(chunk));
    stream.on('end', () => resolve(Buffer.concat(chunks)));
    stream.on('error', reject);

    doc.pipe(stream);

    doc.fillColor('#4f46e5').fontSize(28).text('StayNest', 50, 50);
    doc.fillColor('#64748b').fontSize(10).text('Premium PG Management System', 50, 82);
    doc.fillColor('#1e293b').fontSize(20).text('INVOICE', 400, 55);
    doc.fillColor('#64748b').fontSize(10).text(`#${data.invoiceNo}`, 400, 80);

    doc.moveTo(50, 110).lineTo(545, 110).strokeColor('#e2e8f0').lineWidth(1).stroke();

    doc.fillColor('#64748b').fontSize(10).text('Billed To', 50, 130);
    doc.fillColor('#1e293b').fontSize(13).text(data.residentName, 50, 148);
    doc.fillColor('#64748b').fontSize(10).text(`Room: ${data.roomName}`, 50, 168);
    doc.fillColor('#64748b').text(`Period: ${data.period}`, 50, 183);

    doc.fillColor('#64748b').fontSize(10).text('Invoice Date', 380, 130);
    doc.fillColor('#1e293b').fontSize(13).text(data.date, 380, 148);
    doc.fillColor('#64748b').fontSize(10).text('Status', 380, 168);

    const statusColor = data.status === 'paid' ? '#16a34a' : data.status === 'pending' ? '#d97706' : '#dc2626';
    doc.fillColor(statusColor).fontSize(13).text(data.status.toUpperCase(), 380, 183);

    const tableTop = 230;
    doc.moveTo(50, tableTop - 10).lineTo(545, tableTop - 10).strokeColor('#e2e8f0').stroke();
    doc.fillColor('#64748b').fontSize(10).text('Description', 50, tableTop);
    doc.fillColor('#64748b').text('Amount', 450, tableTop);
    doc.moveTo(50, tableTop + 18).lineTo(545, tableTop + 18).strokeColor('#e2e8f0').stroke();

    let y = tableTop + 35;
    const rows: [string, number][] = [
      ['Room Rent', data.roomRent],
      ['Mess Charges', data.messCharges],
      ['Laundry Charges', data.laundryCharges],
      ['GST (18%)', data.gst],
    ];

    for (const [label, amount] of rows) {
      doc.fillColor('#1e293b').fontSize(11).text(label, 50, y);
      doc.fillColor('#1e293b').text(formatINR(amount), 450, y);
      y += 25;
    }

    doc.moveTo(50, y).lineTo(545, y).strokeColor('#e2e8f0').stroke();
    y += 15;
    doc.fillColor('#4f46e5').fontSize(14).text('Total', 50, y);
    doc.fillColor('#4f46e5').text(formatINR(data.total), 450, y);

    y += 60;
    doc.moveTo(50, y).lineTo(545, y).strokeColor('#e2e8f0').stroke();
    y += 15;
    doc.fillColor('#94a3b8').fontSize(9).text('This is a computer-generated invoice and does not require a physical signature.', 50, y);
    doc.fillColor('#94a3b8').text('StayNest Premium PG | 42, Knowledge Park, Sector 18, Noida, UP 201301', 50, y + 15);
    doc.fillColor('#94a3b8').text('Phone: +91 98765 43210 | Email: hello@staynest.in', 50, y + 30);

    doc.end();
  });
}

function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
}
