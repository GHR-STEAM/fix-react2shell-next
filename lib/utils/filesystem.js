const fs = require('fs');
const path = require('path');

const SKIP_DIRS = new Set([
  'node_modules',
  '.next',
  '.turbo',
  '.git',
  'dist',
  'build',
  '.output',
  '.nuxt',
  '.vercel',
  'coverage',
]);

function findAllPackageJsons(dir, results = []) {
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch (e) {
    return results;
  }

  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue;
      findAllPackageJsons(path.join(dir, entry.name), results);
    } else if (entry.name === 'package.json') {
      results.push(path.join(dir, entry.name));
    }
  }

  return results;
}

function hasLockFile(dir) {
  return fs.existsSync(path.join(dir, 'package-lock.json')) ||
         fs.existsSync(path.join(dir, 'yarn.lock')) ||
         fs.existsSync(path.join(dir, 'pnpm-lock.yaml')) ||
         fs.existsSync(path.join(dir, 'bun.lockb')) ||
         fs.existsSync(path.join(dir, 'bun.lock'));
}

function findProjectRoot(startDir) {
  let dir = startDir;

  while (dir !== path.dirname(dir)) {
    if (hasLockFile(dir)) {
      return dir;
    }
    dir = path.dirname(dir);
  }

  // No lock file found, return the original directory
  return startDir;
}

function findMonorepoRoot(startDir) {
  let dir = startDir;

  while (dir !== path.dirname(dir)) {
    if (fs.existsSync(path.join(dir, 'pnpm-workspace.yaml'))) {
      return dir;
    }

    const pkgPath = path.join(dir, 'package.json');
    if (fs.existsSync(pkgPath)) {
      try {
        const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
        if (pkg.workspaces) {
          return dir;
        }
      } catch (e) {
        // ignore
      }
    }

    dir = path.dirname(dir);
  }

  return null;
}

module.exports = {
  SKIP_DIRS,
  findAllPackageJsons,
  hasLockFile,
  findProjectRoot,
  findMonorepoRoot,
};
