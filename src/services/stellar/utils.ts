import * as StellarSdk from 'stellar-sdk';

/**
 * Build a transaction with multiple operations
 * @param {StellarSdk.Account} sourceAccount - The source account for the transaction
 * @param {StellarSdk.xdr.Operation[]} operations - An array of operations to include in the transaction
 * @param {string} networkPassphrase - The network passphrase (StellarSdk.Networks.TESTNET or StellarSdk.Networks.PUBLIC)
 * @returns {StellarSdk.Transaction} The built transaction
 */
function buildTransaction(sourceAccount: StellarSdk.Account, operations: StellarSdk.xdr.Operation[], networkPassphrase: string): StellarSdk.Transaction {
  const transaction = new StellarSdk.TransactionBuilder(sourceAccount, {
    fee: StellarSdk.BASE_FEE,
    networkPassphrase: networkPassphrase
  });

  operations.forEach((operation: StellarSdk.xdr.Operation) => {
    transaction.addOperation(operation);
  });

  return transaction.setTimeout(30).build();
}

export default buildTransaction;