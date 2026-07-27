/**
 * Auto-Patch Changeset Generator Script
 * Dynamically discovers all workspace packages in packages/ and generates a fallback
 * patch changeset when commits land on main without an explicit changeset file.
 */

import fs from 'node:fs';
import path from 'node:path';

function findPackageJsonFiles(dir: string, fileList: string[] = []): string[] {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  for (const file of files) {
    const res = path.resolve(dir, file.name);
    if (file.isDirectory() && file.name !== 'node_modules' && file.name !== 'dist') {
      findPackageJsonFiles(res, fileList);
    } else if (file.name === 'package.json') {
      fileList.push(res);
    }
  }
  return fileList;
}

console.log('📦 Discovering workspace packages for auto-patch release...');

const rootPackagesDir = path.resolve(process.cwd(), 'packages');
const packageJsonPaths = findPackageJsonFiles(rootPackagesDir);

const packageNames: string[] = [];

for (const pkgPath of packageJsonPaths) {
  try {
    const pkgContent = fs.readFileSync(pkgPath, 'utf-8');
    const pkgJson = JSON.parse(pkgContent);
    if (pkgJson.name && !pkgJson.private) {
      packageNames.push(pkgJson.name);
    }
  } catch (err) {
    console.error(`⚠️ Failed to read or parse package.json at ${pkgPath}:`, err);
  }
}

packageNames.sort();

if (packageNames.length === 0) {
  console.error('❌ No public workspace packages found in packages/');
  process.exit(1);
}

console.log(`  ✓ Found ${packageNames.length} packages: ${packageNames.join(', ')}`);

const changesetContent = [
  '---',
  ...packageNames.map((name) => `"${name}": patch`),
  '---',
  '',
  'auto: patch version release',
  '',
].join('\n');

const changesetDir = path.resolve(process.cwd(), '.changeset');
if (!fs.existsSync(changesetDir)) {
  fs.mkdirSync(changesetDir, { recursive: true });
}

const targetPath = path.resolve(changesetDir, 'auto-patch-release.md');
fs.writeFileSync(targetPath, changesetContent, 'utf-8');

console.log(`✅ Successfully generated fallback patch changeset at .changeset/auto-patch-release.md`);
