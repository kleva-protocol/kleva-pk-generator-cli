import { generateKey } from 'sss-pk-generator';
import { cwd } from 'process';
import { resolve } from 'path';
import { writeFileSync } from 'fs';

const readlineSync = require('readline-sync');

export const jsonKeyStringBuilder = (address: string, params: string) => {
  const jsonParams: {
    ct: string;
    iv: string;
    s: string;
  } = JSON.parse(params);

  return `{
  "address": "${address}",
  "params": {
    "ct": "${jsonParams.ct}",
    "iv": "${jsonParams.iv}",
    "s": "${jsonParams.s}"
  }
}`;
};

export const makeNodeJsonFile = (path: string, text: string) => {
  writeFileSync(path, text);
};

export const askSecrets = () => {
  let N = 0;
  let T = 0;
  const secrets: string[] = [];

  const regexTester =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~])[A-Za-z\d!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~]{13,}$/;
  const regexMsg =
    'Should include at lease one number, special character, lowercase letter, and uppercase letter!!';

  while (true) {
    let ans = '';

    if (N === 0) {
      ans = readlineSync.questionInt('number of shares: ');
      N = parseInt(ans) || 0;
    } else if (T === 0) {
      ans = readlineSync.questionInt('threshold: ');
      T = parseInt(ans) || 0;
      if (!(T > 0 && T <= N)) {
        console.log('\nenter threshold again; 0 < T <= N');
        T = 0;
      }
    } else if (secrets.length === 0) {
      while (secrets.length < N) {
        ans = readlineSync.question(`passpharse #${secrets.length + 1}:`, {
          hideEchoBack: true,
        });

        if (regexTester.test(ans)) {
          const ans2 = readlineSync.question(`reinput passpharse:`, {
            hideEchoBack: true,
          });
          if (ans === ans2) {
            secrets.push(ans);
          } else {
            console.log('passphrase not matched');
          }
        } else {
          console.log(regexMsg);
        }
      }
    } else {
      break;
    }
  }

  if (secrets.length !== N) {
    throw new Error('fatal err');
  }

  return {
    N,
    T,
    secrets,
  };
};

export const generateKeyStore = (dir = './') => {
  const { N, T, secrets } = askSecrets();
  const res = generateKey(secrets, T);

  const path: string[] = [];
  for (let i = 0; i < N; i++) {
    const filename = `keystore-${i + 1}of${N}-${res.address}.json`;
    const keystorePath = resolve(cwd(), dir, filename);
    const keystoreJson = jsonKeyStringBuilder(
      res.address,
      res.shares[i].cipherparams,
    );
    makeNodeJsonFile(keystorePath, keystoreJson);

    path.push(keystorePath);
  }

  return {
    address: res.address,
    n: N,
    t: T,
    path,
  };
};
