import { NextResponse } from 'next/server';

import manifest from '@/app/manifest';

export function GET() {
  return NextResponse.json(manifest(), {
    headers: {
      'Content-Type': 'application/manifest+json; charset=utf-8',
    },
  });
}
