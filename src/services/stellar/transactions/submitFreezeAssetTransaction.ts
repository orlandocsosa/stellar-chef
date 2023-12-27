import type { Account } from 'stellar-sdk';
import { Operation, Keypair, AuthRevocableFlag } from 'stellar-sdk';
import { buildTransaction, submitTransaction } from '../utils';

export async function submitFreezeAssetTransaction(issuer: Account, issuerAccountsecretKey: string): Promise<void> {
  const setOptionTransaction = buildTransaction(issuer, [Operation.setOptions({ setFlags: AuthRevocableFlag })]);
  setOptionTransaction.sign(Keypair.fromSecret(issuerAccountsecretKey));
  await submitTransaction(setOptionTransaction);
}
