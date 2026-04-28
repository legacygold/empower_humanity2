// wallet.ts – placeholder for Stellar keypair handling
export interface Wallet {
  publicKey: string;   // Stellar address
  encryptedSecret: string; // stored encrypted locally
}

export function generateWallet(): Wallet {
  // TODO: replace with real Stellar Keypair.random() later
  return {
publicKey: "GADummyAddressForTestingOnlyxxxxxxxxxxxxxxxxxxxx",
    encryptedSecret: ""   // will be filled after encryption
  };
}

export function lockWallet(wallet: Wallet, password: string): Wallet {
  // TODO: encrypt wallet.secret with password (or biometric‑derived key)
  return wallet;
}

export function unlockWallet(wallet: Wallet, password: string): string {
  // TODO: decrypt and return the secret key for signing
  return "dummy-secret-key-for-testing";
}
