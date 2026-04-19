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

function prepareStandaloneAssets(repoRoot) {
  const resolvedRepoRoot = repoRoot ?? __dirname;
  const standaloneRoot = path.join(resolvedRepoRoot, '.next', 'standalone');

  ensureDirectoryAvailable(path.join(resolvedRepoRoot, 'public'), path.join(standaloneRoot, 'public'));
  ensureDirectoryAvailable(path.join(resolvedRepoRoot, '.next', 'static'), path.join(standaloneRoot, '.next', 'static'));
}

function getStandaloneServerOptions(repoRoot) {
  const resolvedRepoRoot = repoRoot ?? __dirname;
  const requiredServerFiles = JSON.parse(
    fs.readFileSync(path.join(resolvedRepoRoot, '.next', 'required-server-files.json'), 'utf8'),
  );
  const currentPort = parseInt(process.env.PORT, 10) || 3000;
  let keepAliveTimeout = parseInt(process.env.KEEP_ALIVE_TIMEOUT, 10);

  if (
    Number.isNaN(keepAliveTimeout) ||
    !Number.isFinite(keepAliveTimeout) ||
    keepAliveTimeout < 0
  ) {
    keepAliveTimeout = undefined;
  }

  return {
    dir: resolvedRepoRoot,
    isDev: false,
    config: requiredServerFiles.config,
    hostname: process.env.STANDALONE_HOSTNAME?.trim() || undefined,
    port: currentPort,
    allowRetry: false,
    keepAliveTimeout,
  };
}

function startStandaloneServer() {
  prepareStandaloneAssets(__dirname);
  process.env.NODE_ENV = 'production';

  const { startServer } = require('next/dist/server/lib/start-server');
  startServer(getStandaloneServerOptions(__dirname)).catch((error) => {
    console.error(error);
    process.exit(1);
  });
}

if (require.main === module) {
  startStandaloneServer();
}

module.exports = {
  ensureDirectoryAvailable,
  prepareStandaloneAssets,
  getStandaloneServerOptions,
  startStandaloneServer,
};
