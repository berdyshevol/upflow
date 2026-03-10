import 'dotenv/config';
import { startBot } from './bot';
import { monitorNewJobs } from './services/monitor';

async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'monitor';

  console.log(`UpFlow version 1.0.0. Command: ${command}`);

  if (command === 'bot') {
    // Start long-running bot listener
    startBot();
  } else if (command === 'monitor') {
    // Run a single monitoring cycle
    await monitorNewJobs();
    // Exit after monitor (unless bot is also needed)
    process.exit(0);
  } else if (command === 'run') {
    // Start bot AND run monitor (for manual execution)
    startBot();
    await monitorNewJobs();
  } else {
    console.error(`Unknown command: ${command}`);
    console.log('Usage:');
    console.log('  npm start bot      - Start Telegram bot (long-running)');
    console.log('  npm start monitor  - Run one monitoring cycle');
    console.log('  npm start run      - Both (for manual use)');
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
