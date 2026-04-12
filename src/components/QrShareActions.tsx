'use client';

import { useState } from 'react';

interface QrShareActionsProps {
  siteUrl: string;
}

export default function QrShareActions({ siteUrl }: QrShareActionsProps) {
  const [feedback, setFeedback] = useState('');

  async function handleShare() {
    if (typeof navigator === 'undefined' || typeof navigator.share !== 'function') {
      setFeedback('Teilen wird auf diesem Gerät nicht unterstützt. Bitte lade den QR-Code herunter.');
      return;
    }

    try {
      await navigator.share({
        title: 'Der Fluss des Lebens',
        text: 'Schau dir diese Webseite an und teile den QR-Code gern weiter.',
        url: siteUrl,
      });
      setFeedback('');
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        setFeedback('');
        return;
      }

      setFeedback('Teilen konnte nicht gestartet werden. Bitte lade den QR-Code herunter.');
    }
  }

  return (
    <div className="flex flex-col items-center md:items-start gap-3">
      <div className="flex flex-wrap justify-center md:justify-start gap-3">
        <button
          type="button"
          onClick={handleShare}
          className="inline-flex bg-blue-800 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-colors"
        >
          Link teilen
        </button>
        <a
          href="/api/share-qr?format=png&download=1"
          download="fluss-des-lebens-qr-code.png"
          className="inline-flex bg-white text-blue-800 border border-blue-200 px-4 py-2 rounded-lg text-sm hover:bg-blue-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-colors"
        >
          QR-Code herunterladen
        </a>
        <a
          href={siteUrl}
          className="inline-flex bg-white text-blue-800 border border-blue-200 px-4 py-2 rounded-lg text-sm hover:bg-blue-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-colors"
        >
          Webseite öffnen
        </a>
      </div>
      <p className="text-xs text-gray-500 text-center md:text-left">
        Ideal zum Versenden über WhatsApp, E-Mail oder soziale Medien.
      </p>
      {feedback && (
        <p className="text-xs text-amber-800 text-center md:text-left" role="status">
          {feedback}
        </p>
      )}
    </div>
  );
}
