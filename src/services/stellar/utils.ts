import { type Account, TransactionBuilder, BASE_FEE, type xdr, type Transaction, Horizon } from 'stellar-sdk';

const STELLAR_NETWORK_URL = import.meta.env.VITE_STELLAR_NETWORK_URL;
const STELLAR_NETWORK_PASSPHRASE = import.meta.env.VITE_STELLAR_NETWORK_PASSPHRASE;

const server = new Horizon.Server(STELLAR_NETWORK_URL);

function buildTransaction(sourceAccount: Account, operations: xdr.Operation[]): Transaction {
  const transaction = new TransactionBuilder(sourceAccount, {
    fee: BASE_FEE,
    networkPassphrase: STELLAR_NETWORK_PASSPHRASE
  });

  try {
    for (const operation of operations) {
      transaction.addOperation(operation);
    }

    return transaction.setTimeout(30).build();
  } catch (error) {
    console.error(error);
    throw error;
  }
}

async function submitTransaction(transaction: Transaction): Promise<string> {
  try {
    await server.submitTransaction(transaction);
    return 'Transaction submitted successfully';
  } catch (e: unknown) {
    throw new Error(`An error occurred while submitting the transaction: ${String(e)}`);
  }
}

export { buildTransaction, server, submitTransaction };
