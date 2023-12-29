import type { Asset } from 'stellar-sdk';
import { Operation, Keypair } from 'stellar-sdk';
import { Account } from '../Account';
import { server, buildTransaction } from '../utils';

export async function createHolders(
  distributorAccount: Account,
  numberOfHolders: number,
  equalBalance: string,
  asset: Asset
): Promise<Account[]> {
  const holders: Account[] = [];

  for (let i = 0; i < numberOfHolders; i++) {
    const holderAccount = Account.create();

    let operation = Operation.createAccount({
      destination: holderAccount.publicKey,
      startingBalance: '100'
    });
    let distributor = await server.loadAccount(distributorAccount.publicKey);
    let transaction = buildTransaction(distributor, [operation]);
    transaction.sign(Keypair.fromSecret(distributorAccount.secretKey));
    await server.submitTransaction(transaction);

    operation = Operation.changeTrust({
      asset
    });
    const holder = await server.loadAccount(holderAccount.publicKey);
    transaction = buildTransaction(holder, [operation]);
    transaction.sign(Keypair.fromSecret(holderAccount.secretKey));
    await server.submitTransaction(transaction);

    operation = Operation.payment({
      destination: holderAccount.publicKey,
      asset,
      amount: equalBalance
    });
    distributor = await server.loadAccount(distributorAccount.publicKey);
    transaction = buildTransaction(distributor, [operation]);
    transaction.sign(Keypair.fromSecret(distributorAccount.secretKey));
    await server.submitTransaction(transaction);

    holders.push(holderAccount);
  }

  return holders;
}
