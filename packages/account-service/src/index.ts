import { App } from './app';
import { getConfig } from './config';

let app!: App;

process.on('SIGINT', async () => {
  await app.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await app.close();
  process.exit(0);
});

async function main() {
  app = await App.launch(getConfig());
}

main();
