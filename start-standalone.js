const fs = require('fs');
const path = require('path');

function ensureDirectoryAvailable(sourceDir, targetDir) {
  if (!fs.existsSync(sourceDir)) {
    return;
  }

  fs.mkdirSync(path.dirname(targetDir), { recursive: true });

  if (fs.existsSync(targetDir)) {
    try {
      if (fs.realpathSync(targetDir) === fs.realpathSync(sourceDir)) {
        return;
      }
    } catch {
      // Fall through and replace the stale target.
    }

    fs.rmSync(targetDir, { recursive: true, force: true });
  }

  try {
    fs.symlinkSync(sourceDir, targetDir, process.platform === 'win32' ? 'junction' : 'dir');
  } catch {
    fs.cpSync(sourceDir, targetDir, { recursive: true, force: true });
  }
}

function prepareStandaloneAssets(repoRoot = __dirname) {
  const standaloneRoot = path.join(repoRoot, '.next', 'standalone');

  ensureDirectoryAvailable(path.join(repoRoot, 'public'), path.join(standaloneRoot, 'public'));
  ensureDirectoryAvailable(path.join(repoRoot, '.next', 'static'), path.join(standaloneRoot, '.next', 'static'));
}

function startStandaloneServer() {
  if (process.env.RAILWAY_ENVIRONMENT || process.env.RAILWAY_PROJECT_ID) {
    process.env.HOSTNAME = '0.0.0.0';
  }

  prepareStandaloneAssets(__dirname);

  require('./.next/standalone/server.js');
}

if (require.main === module) {
  startStandaloneServer();
}

module.exports = {
  ensureDirectoryAvailable,
  prepareStandaloneAssets,
  startStandaloneServer,
};
