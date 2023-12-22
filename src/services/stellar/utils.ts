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

async function submitTransaction(transaction: Transaction): Promise<object> {
  try {
    return await server.submitTransaction(transaction);
  } catch (e: any) {
    const stellarErrorCode = e.response.data.extras.result_codes;

    if (stellarErrorCode === undefined) {
      throw new Error(JSON.stringify(e));
    }
    throw new Error(JSON.stringify(e.response.data.extras.result_codes));
  }
}

export { buildTransaction, server, submitTransaction };
