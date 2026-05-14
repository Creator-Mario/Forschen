type ImageHeroProps = {
  imageUrl?: string;
  eyebrow?: string;
  title: string;
  subtitle: string;
};

const defaultImageUrl = 'https://images.unsplash.com/photo-1504052434569-70ad5836ab65?auto=format&fit=crop&w=1600&q=80';

export default function ImageHero({
  imageUrl = defaultImageUrl,
  eyebrow = 'Genealogie',
  title,
  subtitle,
}: ImageHeroProps) {
  return (
    <section
      className="relative overflow-hidden px-4 py-20 text-white md:py-28"
      style={{
        backgroundColor: '#1e3a8a',
        backgroundImage: `linear-gradient(135deg, rgba(10, 37, 90, 0.88), rgba(30, 58, 138, 0.72), rgba(15, 23, 42, 0.66)), url(${imageUrl})`,
        backgroundPosition: 'center',
        backgroundSize: 'cover',
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-[#eff6ff]/10" />
      <div className="relative mx-auto max-w-6xl">
        <div className="max-w-3xl">
          <p className="mb-4 inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.3em] text-blue-100 backdrop-blur-sm">
            {eyebrow}
          </p>
          <h1 className="max-w-3xl text-4xl font-bold leading-tight text-white drop-shadow-[0_8px_30px_rgba(15,23,42,0.45)] md:text-5xl xl:text-6xl">
            {title}
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-blue-50 md:text-xl">
            {subtitle}
          </p>
          <div className="mt-8 flex flex-wrap gap-3 text-sm font-semibold">
            <span className="rounded-full bg-white/14 px-4 py-2 text-white backdrop-blur-sm">Kostenlos</span>
            <span className="rounded-full bg-white/14 px-4 py-2 text-white backdrop-blur-sm">Tägliche Impulse</span>
            <span className="rounded-full bg-white/14 px-4 py-2 text-white backdrop-blur-sm">Wöchentlicher Segen</span>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 w-full overflow-hidden [line-height:0]">
        <svg viewBox="0 0 1440 80" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" className="block h-16 w-full md:h-20">
          <path d="M0,40 C180,80 360,0 540,40 C720,80 900,0 1080,40 C1260,80 1380,20 1440,40 L1440,80 L0,80 Z" fill="#f8fafc" />
        </svg>
      </div>
    </section>
  );
}
