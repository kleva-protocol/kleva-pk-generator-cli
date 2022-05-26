import { generateKey } from 'sss-pk-generator';
import { cwd } from 'process';
import { resolve } from 'path';
import { writeFileSync } from 'fs';

const readlineSync = require('readline-sync');

const _jsonKeyStringBuilder = (address: string, shares: string[]) => {
  return `{
  "address": "${address}",
  "shares": [
    ${shares.join(',')}
  ]
}`;
};

const _makeNodeJsonFile = (path: string, text: string) => {
  writeFileSync(path, text);
};

const generateKeyStore = (dir = './') => {
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

  const res = generateKey(secrets, T);

  const filename = `keystore-${res.address}.json`;
  const path = resolve(cwd(), dir, filename);

  const keystoreJson = _jsonKeyStringBuilder(
    res.address,
    res.shares.map((s) => s.cipherparams.toString()),
  );
  _makeNodeJsonFile(path, keystoreJson);

  return {
    address: res.address,
    n: N,
    t: T,
    path,
  };
};

generateKeyStore();
