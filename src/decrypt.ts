import { unlockShares } from 'sss-pk-generator';
import { existsSync, readFileSync } from 'fs';

const readlineSync = require('readline-sync');

const unlockKeyStore = () => {
  const secrets: string[] = [];
  const cipherparams: { ct: string; iv: string; s: string }[] = [];

  while (true) {
    let ans = '';
    let json: {
      address: string;
      params: { ct: string; iv: string; s: string };
    };

    ans = readlineSync.question(
      `[${secrets.length + 1}] input path of key store json(or ENTER to exit):`,
    );
    ans = (ans || '').trim();

    if (ans === '') {
      console.log('end of shares');
      break;
    } else if (existsSync(ans)) {
      json = JSON.parse(readFileSync(ans).toString());

      if (
        json?.address &&
        json?.params?.ct &&
        json?.params?.iv &&
        json?.params?.s
      ) {
        let passphrase = readlineSync.question('input the passphrase:');
        passphrase = (passphrase || '').trim();
        cipherparams.push(json.params);
        secrets.push(passphrase);
        console.log('\n');
      } else {
        console.log('@ERR: not valid key store structrue');
      }
    } else {
      console.log('@ERR: not valid path');
    }
  }

  console.log('\n the number of shares you filled:', secrets.length);

  console.log(
    '@@@@@@@@@@@@@@@@@@@@@@@@@@@\n',
    secrets.map((s, idx) => ({
      cipherparams: cipherparams[idx],
      secret: s,
    })),
    '\n@@@@@@@@@@@@@@@@@@@@@@@@@@@\n',
  );

  const pk = unlockShares(
    secrets.map((s, idx) => ({
      cipherparams: cipherparams[idx],
      secret: s,
    })),
  );

  console.log('\n(just for checking) private key =>', pk);
};

unlockKeyStore();
