import * as StellarSdk from 'stellar-sdk';

interface StellarServer {
  server: typeof StellarSdk.default.Server;
  networkPassphrase: string;
}

/**
 * Creates and returns a Stellar server instance based on the network environment.
 *
 * @return {StellarServer} An object containing the Stellar server instance and the network passphrase.
 */
function getStellarServer(): StellarServer {
  const network = process.env.VITE_STELLAR_NETWORK; // "testnet" or "public"

  let server: typeof StellarSdk.default.Server, networkPassphrase: string;
  if (network === 'public') {
    server = new StellarSdk.default.Server('https://horizon.stellar.org');
    networkPassphrase = StellarSdk.default.Networks.PUBLIC;
    console.log('Using public network');
  } else {
    server = new StellarSdk.default.Server('https://horizon-testnet.stellar.org');
    networkPassphrase = StellarSdk.default.Networks.TESTNET;
    console.log('Using test network');
  }

  return { server, networkPassphrase };
}

export default getStellarServer;