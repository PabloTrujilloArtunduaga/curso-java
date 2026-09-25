import crypto from 'crypto';

export const cryptoNative = {
  randomUUID: () => {
    if (crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return crypto.randomBytes(16).toString('hex');
  }
};
