import { generateKey } from 'sss-pk-generator';
import { unlockKeyStore } from './decrypt';
import { askSecrets, jsonKeyStringBuilder, makeNodeJsonFile } from './encrypt';
import { resolve } from 'path';
import { cwd } from 'process';

export const regenerateShares = () => {
  const currentKeyData = unlockKeyStore({
    hidePk: true,
  });

  console.log(
    '\n\n',
    `regenerate shares of this key '${currentKeyData.address}'`,
  );

  const DIR = './';
  const { N, T, secrets } = askSecrets();
  const res = generateKey(secrets, T, currentKeyData.pk);

  const path: string[] = [];
  for (let i = 0; i < N; i++) {
    const filename = `keystore-${i + 1}of${N}-${res.address}.json`;
    const keystorePath = resolve(cwd(), DIR, filename);
    const keystoreJson = jsonKeyStringBuilder(
      res.address,
      res.shares[i].cipherparams,
    );
    makeNodeJsonFile(keystorePath, keystoreJson);

    path.push(keystorePath);
  }

  console.log('\n[finished]');
};
