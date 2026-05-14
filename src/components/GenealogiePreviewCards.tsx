const previewCards = [
  {
    icon: '🌊',
    title: 'Glaubenswurzeln entdecken',
    description: 'Erkunde deine geistliche Ahnenreihe und erkenne, welche Impulse dich im Glauben geprägt haben.',
  },
  {
    icon: '✝️',
    title: 'Tägliche Impulse',
    description: 'Empfange jeden Tag neue geistliche Denkanstöße, die dich in Christus stärken und begleiten.',
  },
  {
    icon: '📖',
    title: 'Biblische Vertiefung',
    description: 'Verbinde persönliche Lebensfragen mit Bibeltexten, Auslegung und stiller Reflexion.',
  },
  {
    icon: '💬',
    title: 'Gemeinschaft & Chat',
    description: 'Echtzeit-Austausch über Glauben, Zweifel und Gebetsanliegen in einer geschützten Gemeinschaft.',
    highlighted: true,
  },
  {
    icon: '🙏',
    title: 'Gebet & Begleitung',
    description: 'Teile Gebetsanliegen, trage Anliegen mit und finde geistliche Wegbegleiter für deinen Alltag.',
  },
  {
    icon: '📧',
    title: 'Wöchentlicher Segen',
    description: 'Erhalte einmal pro Woche einen persönlichen Impuls mit Bibelgeschichte, Fragen und Segenswort.',
  },
  {
    icon: '💌',
    title: 'Kostenlos & transparent',
    description: 'Alle Inhalte sind frei zugänglich – ohne versteckte Kosten, ohne Paywall und ohne Überraschungen.',
  },
];

export default function GenealogiePreviewCards() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {previewCards.map((card) => (
        <article
          key={card.title}
          className={[
            'rounded-2xl border border-blue-100 bg-white p-5 shadow-[0_18px_45px_-30px_rgba(30,58,138,0.45)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_22px_55px_-28px_rgba(30,58,138,0.52)]',
            card.highlighted
              ? 'border-amber-300 bg-gradient-to-br from-blue-50 via-white to-amber-50 ring-1 ring-amber-200 sm:col-span-2 xl:col-span-1'
              : '',
          ].join(' ')}
        >
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-2xl shadow-inner shadow-blue-100">
            <span aria-hidden="true">{card.icon}</span>
          </div>
          <h3 className="text-lg font-semibold text-blue-950">{card.title}</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">{card.description}</p>
          {card.highlighted ? (
            <p className="mt-4 inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-amber-800">
              Besonders lebendig
            </p>
          ) : null}
        </article>
      ))}
    </div>
  );
}
