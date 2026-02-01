import { spawn } from 'node:child_process';
import process from 'node:process';

function getArgValue(args: string[], flag: string): string | undefined {
  const withEquals = args.find(arg => arg.startsWith(`${flag}=`));
  if (withEquals) {
    return withEquals.slice(flag.length + 1);
  }

  const index = args.indexOf(flag);
  if (index !== -1 && index + 1 < args.length) {
    return args[index + 1];
  }

  return undefined;
}

function getPnpmCommand(): string {
  return process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm';
}

function runStep(command: string, args: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: 'inherit' });

    child.on('error', error => reject(error));
    child.on('close', code => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`${command} ${args.join(' ')} exited with code ${code}`));
      }
    });
  });
}

async function main() {
  const args = process.argv.slice(2);
  const epochArg = args.find(arg => !arg.startsWith('--'));

  if (!epochArg) {
    console.error('❌ Error: Epoch ID is required');
    console.log('Usage: pnpm run-tide <epochId> [--seed <hex>] [--blacklist <path>]');
    console.log('Example: pnpm run-tide 1');
    process.exit(1);
  }

  const seed = getArgValue(args, '--seed');
  const blacklist = getArgValue(args, '--blacklist') || process.env.BLACKLIST_PATH;

  const pnpm = getPnpmCommand();
  const epoch = epochArg;

  const fetchArgs = ['fetch-leaderboard', epoch];
  if (blacklist) {
    fetchArgs.push('--blacklist', blacklist);
  }

  const pickArgs = ['pick-winners', epoch];
  if (seed) {
    pickArgs.push('--seed', seed);
  }
  if (blacklist) {
    pickArgs.push('--blacklist', blacklist);
  }

  const reportArgs = ['export-report', epoch];

  try {
    await runStep(pnpm, fetchArgs);
    await runStep(pnpm, pickArgs);
    await runStep(pnpm, reportArgs);
  } catch (error) {
    console.error('\n❌ Error:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

main();
