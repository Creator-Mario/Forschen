import { ImageResponse } from 'next/og';

import { canonicalSiteUrl, siteName } from '@/lib/config';

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export const alt = `${siteName} – christliche Bibelforschung`;

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '56px 64px',
          background:
            'linear-gradient(160deg, #0d47a1 0%, #1565c0 50%, #1976d2 80%, #2196f3 100%)',
          color: 'white',
          fontFamily: 'sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 24,
          }}
        >
          <div
            style={{
              width: 104,
              height: 104,
              borderRadius: 26,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(255,255,255,0.15)',
              fontSize: 52,
              fontWeight: 700,
            }}
          >
            DL
          </div>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
            }}
          >
            <div style={{ fontSize: 30, opacity: 0.82 }}>Freie christliche Bibelforschung</div>
            <div style={{ fontSize: 68, fontWeight: 700, lineHeight: 1.05 }}>{siteName}</div>
          </div>
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
            maxWidth: 920,
          }}
        >
          <div style={{ fontSize: 34, lineHeight: 1.25 }}>
            Tageswort, Wochenthema, Psalmen, Forschungsbeiträge und gemeinschaftliches Gebet.
          </div>
          <div style={{ fontSize: 24, opacity: 0.78 }}>{canonicalSiteUrl}</div>
        </div>
      </div>
    ),
    size,
  );
}
