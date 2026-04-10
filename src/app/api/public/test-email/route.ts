import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';

export async function GET() {
  try {
    const result = await sendEmail({
      to: 'marioreinerdenzer@gmail.com',
      subject: 'SMTP Test',
      html: '<b>Funktioniert!</b>',
    });
    if (result) {
      return NextResponse.json({ success: true, message: 'Email sent' });
    } else {
      return NextResponse.json({ success: false, error: 'sendEmail returned false' }, { status: 500 });
    }
  } catch (err) {
    return NextResponse.json({ success: false, error: err instanceof Error ? err.message : 'Unknown error' }, { status: 500 });
  }
}
