import { ImageResponse } from 'next/og';

export const size = {
  width: 180,
  height: 180,
};

export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 36,
          background:
            'linear-gradient(160deg, #0d47a1 0%, #1565c0 50%, #1976d2 80%, #2196f3 100%)',
          color: 'white',
          fontSize: 52,
          fontWeight: 700,
          letterSpacing: -2,
        }}
      >
        DL
      </div>
    ),
    size,
  );
}
