// src/utils/arconnect.js

export async function connectArweaveWallet() {
    await window.arweaveWallet.connect(['ACCESS_PUBLIC_KEY', 'SIGNATURE', 'ACCESS_ADDRESS', 'SIGN_TRANSACTION']);
    return await window.arweaveWallet.getActiveAddress();
  }
  
  export async function checkActiveAddress() {
    try {
      return await window.arweaveWallet.getActiveAddress();
    } catch (error) {
      console.error('Error checking active address:', error);
      return null;
    }
  }
  