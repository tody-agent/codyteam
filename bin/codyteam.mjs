#!/usr/bin/env node
/**
 * Codyteam CLI
 * Universal installer and runner for the Codyteam Multi-Agent Swarm.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

const args = process.argv.slice(2);
const command = args[0] || 'help';

function copyRecursive(src, dest) {
  if (!fs.existsSync(src)) return;
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    for (const child of fs.readdirSync(src)) {
      copyRecursive(path.join(src, child), path.join(dest, child));
    }
  } else {
    const parent = path.dirname(dest);
    if (!fs.existsSync(parent)) fs.mkdirSync(parent, { recursive: true });
    fs.copyFileSync(src, dest);
  }
}

switch (command) {
  case 'init': {
    const targetDir = path.resolve(args[1] || process.cwd());
    console.log(`\nInitializing Codyteam Swarm in: ${targetDir}\n`);

    // 1. Copy .claude/agents/
    const agentsSrc = path.join(ROOT_DIR, '.claude', 'agents');
    const agentsDest = path.join(targetDir, '.claude', 'agents');
    copyRecursive(agentsSrc, agentsDest);
    console.log('✓ Installed 14 Codyteam Agents to .claude/agents/');

    // 2. Copy hooks
    const hooksSrc = path.join(ROOT_DIR, 'hooks');
    const hooksDest = path.join(targetDir, '.claude', 'hooks');
    copyRecursive(hooksSrc, hooksDest);
    console.log('✓ Installed Zero-Trust Enforcement Hooks to .claude/hooks/');

    // 3. Copy templates to .swarm
    const templatesSrc = path.join(ROOT_DIR, 'templates');
    const swarmDest = path.join(targetDir, '.swarm');
    copyRecursive(templatesSrc, swarmDest);
    console.log('✓ Installed Swarm Pipeline & Templates to .swarm/');

    // 4. Copy scripts
    const scriptsSrc = path.join(ROOT_DIR, 'scripts');
    const scriptsDest = path.join(targetDir, 'scripts');
    copyRecursive(scriptsSrc, scriptsDest);
    console.log('✓ Installed Swarm Watchdog & CLI to scripts/');

    // 5. Copy specifications
    fs.copyFileSync(path.join(ROOT_DIR, 'SWARM-SPEC.md'), path.join(targetDir, 'SWARM-SPEC.md'));
    fs.copyFileSync(path.join(ROOT_DIR, 'PLANNING-STANDARD.md'), path.join(targetDir, 'PLANNING-STANDARD.md'));
    console.log('✓ Installed SWARM-SPEC.md and PLANNING-STANDARD.md');

    console.log('\nInitialization complete! Run "codyteam test" to verify enforcement hooks.\n');
    break;
  }

  case 'test': {
    console.log('\nRunning Codyteam Zero-Trust Hook Test Suite...\n');
    const testScript = path.join(ROOT_DIR, 'scripts', 'test-hooks.mjs');
    const result = spawnSync('node', [testScript], { stdio: 'inherit' });
    process.exit(result.status || 0);
    break;
  }

  case 'watchdog': {
    console.log('\nStarting Codyteam Heartbeat Watchdog...\n');
    const watchdogScript = path.join(ROOT_DIR, 'scripts', 'swarm-watchdog.mjs');
    const result = spawnSync('node', [watchdogScript, ...args.slice(1)], { stdio: 'inherit' });
    process.exit(result.status || 0);
    break;
  }

  case 'version':
  case '-v':
  case '--version': {
    const pkg = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, 'package.json'), 'utf-8'));
    console.log(`codyteam v${pkg.version}`);
    break;
  }

  case 'help':
  default: {
    console.log(`
Codyteam Multi-Agent Swarm CLI

Usage:
  codyteam init [directory]   Initialize Codyteam swarm into a repository
  codyteam test               Run the Zero-Trust hook test suite
  codyteam watchdog           Start the autonomous queue watchdog daemon
  codyteam version            Print Codyteam version
  codyteam help               Display this help message
`);
    break;
  }
}
