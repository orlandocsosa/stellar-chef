import type { Account } from 'stellar-sdk';
import { Operation, Keypair, AuthRevocableFlag, AuthClawbackEnabledFlag, Asset } from 'stellar-sdk';
import { buildTransaction, submitTransaction, checkAssetFrozen, checkClawbackStatus } from '../utils';

export async function submitClawbackTransaction(issuer: Account, issuerAccountsecretKey: string): Promise<void> {
  const setOptionsTransaction = buildTransaction(issuer, [
    Operation.setOptions({ setFlags: AuthRevocableFlag }),
    Operation.setOptions({ setFlags: AuthClawbackEnabledFlag })
  ]);
  setOptionsTransaction.sign(Keypair.fromSecret(issuerAccountsecretKey));
  await submitTransaction(setOptionsTransaction);

  if (!(await checkClawbackStatus(issuer.accountId()))) {
    throw new Error('Failed to enable clawback');
  }
}

export async function submitFreezeAssetTransaction(issuer: Account, issuerAccountsecretKey: string): Promise<void> {
  const setOptionsTransaction = buildTransaction(issuer, [Operation.setOptions({ setFlags: AuthRevocableFlag })]);
  setOptionsTransaction.sign(Keypair.fromSecret(issuerAccountsecretKey));
  await submitTransaction(setOptionsTransaction);
}

export async function submitDisableTrustlineTransactionForFrozenAsset(
  assetCode: string,
  distributorAccountPublicKey: string,
  issuer: Account,
  issuerAccountSecretKey: string
): Promise<void> {
  console.log(assetCode, distributorAccountPublicKey, issuer.accountId(), issuerAccountSecretKey);
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

  if (!(await checkAssetFrozen(distributorAccountPublicKey, assetCode, issuer.accountId()))) {
    throw new Error('Failed to freeze the asset');
  }
}
