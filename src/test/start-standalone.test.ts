import fs from 'node:fs';
import { createRequire } from 'node:module';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';

const tempDirs: string[] = [];
const require = createRequire(import.meta.url);

afterEach(() => {
  while (tempDirs.length > 0) {
    fs.rmSync(tempDirs.pop()!, { recursive: true, force: true });
  }
});

describe('start-standalone asset preparation', () => {
  it('makes public assets and Next static assets available to the standalone server', async () => {
    const repoRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'forschen-standalone-'));
    tempDirs.push(repoRoot);

    fs.mkdirSync(path.join(repoRoot, 'public'), { recursive: true });
    fs.mkdirSync(path.join(repoRoot, '.next', 'static'), { recursive: true });
    fs.mkdirSync(path.join(repoRoot, '.next', 'standalone', '.next'), { recursive: true });

    fs.writeFileSync(path.join(repoRoot, 'public', 'cover.svg'), '<svg />');
    fs.writeFileSync(path.join(repoRoot, '.next', 'static', 'runtime.js'), 'runtime');

    const { prepareStandaloneAssets } = require('../../start-standalone.js');

    prepareStandaloneAssets(repoRoot);

    expect(fs.readFileSync(path.join(repoRoot, '.next', 'standalone', 'public', 'cover.svg'), 'utf8')).toBe('<svg />');
    expect(fs.readFileSync(path.join(repoRoot, '.next', 'standalone', '.next', 'static', 'runtime.js'), 'utf8')).toBe('runtime');
  });
});
