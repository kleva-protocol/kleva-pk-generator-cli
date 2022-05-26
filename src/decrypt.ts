import { generateKey, unlockShares } from 'sss-pk-generator';
import { cwd } from 'process';
import { resolve } from 'path';
import { existsSync, readFileSync, writeFileSync } from 'fs';

const readlineSync = require('readline-sync');

const unlockKeyStore = () => {
  let keystorePath = '';
  const secrets: string[] = [];

  let json: {
    address: string;
    shares: { ct: string; iv: string; s: string }[];
  };

  while (true) {
    let ans = '';

    if (keystorePath === '') {
      ans = readlineSync.question('input path of key store json:');
      if (existsSync(ans)) {
        keystorePath = ans;

        json = JSON.parse(readFileSync(keystorePath).toString());
      }
    } else if (secrets.length === 0) {
      while (secrets.length < json.shares.length) {
        ans = readlineSync.question(
          `input path of key store json for #${
            secrets.length + 1
          } share(input enter to skip):`,
          {
            hideEchoBack: true,
          },
        );

        secrets.push(ans);
      }
    } else {
      break;
    }
  }

  const pk = unlockShares(
    json.shares.map((s, idx) => ({
      cipherparams: s,
      secret: secrets[idx],
    })),
  );

  console.log('\nprivate key =>', pk);
};

unlockKeyStore();
