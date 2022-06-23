import { generateKeyStore } from './encrypt';
import { unlockKeyStore } from './decrypt';
import { regenerateShares } from './regenerate';

const main = () => {
  const lastCmd = process.argv?.[process.argv.length - 1] || '';

  switch (lastCmd) {
    case 'generate':
      generateKeyStore();
      break;
    case 'decrypt':
      // just for testing
      unlockKeyStore({
        hidePk: false,
      });
      break;
    case 'regenerate':
      regenerateShares();
      break;
  }
};

main();
