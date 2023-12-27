import type { Account } from 'stellar-sdk';
import { Operation, Keypair, AuthRevocableFlag, AuthClawbackEnabledFlag } from 'stellar-sdk';
import { buildTransaction, submitTransaction } from '../utils';

export async function submitClawbackTransaction(issuer: Account, issuerAccountsecretKey: string): Promise<void> {
  const setOptionsTransaction = buildTransaction(issuer, [
    Operation.setOptions({ setFlags: AuthRevocableFlag }),
    Operation.setOptions({ setFlags: AuthClawbackEnabledFlag })
  ]);
  setOptionsTransaction.sign(Keypair.fromSecret(issuerAccountsecretKey));
  await submitTransaction(setOptionsTransaction);
}
