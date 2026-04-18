import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST() {
  try {
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL ?? 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `Du bist ein spiritueller Begleiter für eine ruhige, dogmenfreie christliche Plattform namens "Der Fluss des Lebens". Erstelle ein kurzes, inspirierendes Tageswort (ca. 100 Wörter). Der Stil soll persönlich, einladend, tiefgründig und ohne Druck sein. Sprich den Leser direkt an ("du"). Gib nur den reinen Text aus.`,
        },
        {
          role: 'user',
          content: 'Erstelle ein Tageswort für heute. Orientiere dich an einem ruhigen, besinnlichen Stil.',
        },
      ],
      max_tokens: 200,
      temperature: 0.7,
    });

    const theme = completion.choices[0]?.message?.content?.trim();
    if (!theme) {
      throw new Error('Leere Antwort von der KI');
    }

    return NextResponse.json({ theme });
  } catch (error) {
    console.error('Fehler bei der Generierung:', error);
    return NextResponse.json(
      { error: 'Tageswort konnte nicht generiert werden' },
      { status: 500 }
    );
  }
}
