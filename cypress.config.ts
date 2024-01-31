import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    setupNodeEvents(on, config) {},
    baseUrl: 'http://localhost:5173/stellar-chef',
    testIsolation: false
  },
  env: {
    ASSET_CODE: 'testCoin',
    EXPECTED_STELLAR_EXPERT_ASSET_URL: 'https://stellar.expert/explorer/testnet/asset/testCoin',
    EXPECTED_STELLAR_EXPERT_ACCOUNT_URL: 'https://stellar.expert/explorer/testnet/account/'
  }
});
