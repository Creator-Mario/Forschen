import Link from 'next/link';

interface SubmissionCtaProps {
  title: string;
  description: string;
  href: string;
  actionLabel: string;
}

export default function SubmissionCta({ title, description, href, actionLabel }: SubmissionCtaProps) {
  return (
    <div className="mt-8 bg-blue-50 rounded-xl p-6">
      <h2 className="font-semibold text-blue-800 mb-2">{title}</h2>
      <p className="text-sm text-gray-600 mb-4">{description}</p>
      <div className="flex flex-wrap items-center gap-3">
        <Link href={href} className="bg-blue-800 text-white px-5 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors">
          {actionLabel}
        </Link>
        <span className="text-xs text-gray-500">Beiträge werden vor der Veröffentlichung vom Admin geprüft.</span>
      </div>
    </div>
  );
}
