import { Account, TransactionBuilder, BASE_FEE, xdr, Transaction, Networks, Horizon } from 'stellar-sdk';

interface StellarServer {
  server: Horizon.Server;
  networkPassphrase: string;
}


function getStellarServer(): StellarServer {
  const network = import.meta.env.VITE_STELLAR_NETWORK; // "public" or "testnet"

  let server: Horizon.Server, networkPassphrase: string;
  if (network === 'public') {
    server = new Horizon.Server(import.meta.env.VITE_STELLAR_PUBLIC_URL);
    networkPassphrase = import.meta.env.VITE_STELLAR_PUBLIC_PASSPHRASE;
    console.log('Using public network');
  } else {
    server = new Horizon.Server(import.meta.env.VITE_STELLAR_TESTNET_URL);
    networkPassphrase = import.meta.env.VITE_STELLAR_TESTNET_PASSPHRASE;
    console.log('Using test network');
  }

  return { server, networkPassphrase };
}

function buildTransaction(sourceAccount: Account, operations: xdr.Operation[], networkPassphrase: string): Transaction {
  const transaction = new TransactionBuilder(sourceAccount, {
    fee: BASE_FEE,
    networkPassphrase: networkPassphrase
  });

  operations.forEach((operation: xdr.Operation) => {
    transaction.addOperation(operation);
  });

  return transaction.setTimeout(30).build();
}

export { buildTransaction, getStellarServer };