import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET() {
  try {
    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM ?? 'noreply@flussdeslebens.live',
      to: 'marioreinerdenzer@gmail.com', // deine E-Mail
      subject: 'Test Resend',
      html: '<p>Wenn du das siehst, funktioniert Resend.</p>',
    });
    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
