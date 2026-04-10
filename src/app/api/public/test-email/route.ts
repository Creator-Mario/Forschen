import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';

export async function GET() {
  try {
    const result = await sendEmail({
      to: 'marioreinerdenzer@gmail.com',
      subject: 'Test SMTP',
      html: '<p>Funktioniert!</p>',
    });
    if (result) {
      return NextResponse.json({ success: true, message: 'E-Mail gesendet' });
    } else {
      return NextResponse.json({ success: false, error: 'sendEmail returned false' }, { status: 500 });
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
