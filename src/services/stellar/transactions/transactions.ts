import type { Account } from 'stellar-sdk';
import { Operation, Keypair, AuthRevocableFlag, AuthClawbackEnabledFlag, Asset } from 'stellar-sdk';
import { buildTransaction, submitTransaction } from '../utils';

export async function submitClawbackTransaction(issuer: Account, issuerAccountsecretKey: string): Promise<void> {
  const setOptionsTransaction = buildTransaction(issuer, [
    Operation.setOptions({ setFlags: AuthRevocableFlag }),
    Operation.setOptions({ setFlags: AuthClawbackEnabledFlag })
  ]);
  setOptionsTransaction.sign(Keypair.fromSecret(issuerAccountsecretKey));
  await submitTransaction(setOptionsTransaction);
}

export async function submitFreezeAssetTransaction(issuer: Account, issuerAccountsecretKey: string): Promise<void> {
  const setOptionTransaction = buildTransaction(issuer, [Operation.setOptions({ setFlags: AuthRevocableFlag })]);
  setOptionTransaction.sign(Keypair.fromSecret(issuerAccountsecretKey));
  await submitTransaction(setOptionTransaction);
}

export async function submitDisableTrustlineTransactionForFrozenAsset(
  assetCode: string,
  distributorAccountPublicKey: string,
  issuer: Account,
  issuerAccountSecretKey: string
): Promise<void> {
  const existingAsset = new Asset(assetCode, issuer.accountId());

  const disableTrustOperation = Operation.setTrustLineFlags({
    source: issuer.accountId(),
    trustor: distributorAccountPublicKey,
    asset: existingAsset,
    flags: { authorized: false }
  });

  const trustlineDisableOperations = [disableTrustOperation];

  const transaction = buildTransaction(issuer, trustlineDisableOperations);
  transaction.sign(Keypair.fromSecret(issuerAccountSecretKey));
  await submitTransaction(transaction);
}
