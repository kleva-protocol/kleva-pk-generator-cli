import { privateKeyToAddress, unlockShares } from 'sss-pk-generator';
import { existsSync, readFileSync } from 'fs';

const readlineSync = require('readline-sync');

export const unlockKeyStore = (options: { hidePk: boolean }) => {
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
        let passphrase = readlineSync.question('input the passphrase:', {
          hideEchoBack: true,
        });
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

  const pk = unlockShares(
    secrets.map((s, idx) => ({
      cipherparams: cipherparams[idx],
      secret: s,
    })),
  );

  if (options.hidePk === false) {
    console.log('\n(just for checking) private key =>', pk);
  }
  const address = privateKeyToAddress(pk);
  console.log(
    'and the address for the pk is',
    privateKeyToAddress(pk),
    '\n[finished]',
    '\n\n',
  );

  return {
    address,
    pk,
  };
};
