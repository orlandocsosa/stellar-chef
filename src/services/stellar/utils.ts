import {
  type Account,
  TransactionBuilder,
  BASE_FEE,
  type xdr,
  type Transaction,
  Horizon,
  Operation,
  Asset
} from 'stellar-sdk';

import type { AccountResponse } from 'stellar-sdk/lib/horizon';
import { network } from '../../store/network';
import { get } from 'svelte/store';

const networkUrl = get(network).url;
const networkPassphrase = get(network).passphrase;
const server = new Horizon.Server(networkUrl);

function buildTransaction(sourceAccount: Account, operations: xdr.Operation[]): Transaction {
  const transaction = new TransactionBuilder(sourceAccount, {
    fee: BASE_FEE,
    networkPassphrase
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

async function submitTransaction(transaction: Transaction): Promise<Horizon.HorizonApi.SubmitTransactionResponse> {
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

async function checkClawbackStatus(issuerAccountId: string): Promise<boolean> {
  const issuerAccount = await server.loadAccount(issuerAccountId);

  return issuerAccount.flags.auth_clawback_enabled && issuerAccount.flags.auth_revocable;
}

async function checkAssetFrozen(
  distributorPublicKey: string,
  frozenAssetCode: string,
  issuerPublicKey: string
): Promise<boolean> {
  const distributorAccountWithFrozenAsset = await server.loadAccount(distributorPublicKey);

  const trustline = distributorAccountWithFrozenAsset.balances.find(
    (balance) =>
      'asset_issuer' in balance && balance.asset_code === frozenAssetCode && balance.asset_issuer === issuerPublicKey
  );

  if (trustline !== null && trustline !== undefined && 'is_authorized' in trustline && !trustline.is_authorized) {
    return true;
  } else {
    return false;
  }
}

async function findClaimableBalance(claimant: string): Promise<Horizon.ServerApi.ClaimableBalanceRecord[]> {
  const claimableBalances = await server.claimableBalances().claimant(claimant).call();
  return claimableBalances.records;
}

function getSponsorWrapperOperations(operation: xdr.Operation, sponsoredId: string, source: string): xdr.Operation[] {
  return [
    Operation.beginSponsoringFutureReserves({
      sponsoredId,
      source
    }),
    operation,
    Operation.endSponsoringFutureReserves({
      source: sponsoredId
    })
  ];
}

function getAccountBalances(
  account: AccountResponse,
  asset?: Asset
):
  | Horizon.HorizonApi.BalanceLineNative
  | Horizon.HorizonApi.BalanceLineAsset<'credit_alphanum4'>
  | Horizon.HorizonApi.BalanceLineAsset<'credit_alphanum12'>
  | Horizon.HorizonApi.BalanceLineLiquidityPool
  | undefined
  | Array<
  | Horizon.HorizonApi.BalanceLineNative
  | Horizon.HorizonApi.BalanceLineAsset<'credit_alphanum4'>
  | Horizon.HorizonApi.BalanceLineAsset<'credit_alphanum12'>
  | Horizon.HorizonApi.BalanceLineLiquidityPool
  > {
  const balances = account.balances;

  if (asset instanceof Asset) {
    for (const balance of balances) {
      if (
        'asset_code' in balance &&
        'asset_issuer' in balance &&
        balance.asset_code === asset.code &&
        balance.asset_issuer === asset.issuer
      ) {
        return balance;
      }
    }

    return undefined;
  }

  return balances;
}

function orderAssets(assetA: Asset, assetB: Asset): Asset[] {
  return Asset.compare(assetA, assetB) <= 0 ? [assetA, assetB] : [assetA, assetB];
}

export {
  server,
  buildTransaction,
  submitTransaction,
  checkClawbackStatus,
  checkAssetFrozen,
  findClaimableBalance,
  getSponsorWrapperOperations,
  getAccountBalances,
  orderAssets
};
