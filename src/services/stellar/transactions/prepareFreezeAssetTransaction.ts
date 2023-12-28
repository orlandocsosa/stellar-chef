import type { xdr } from 'stellar-sdk';
import { Operation, AuthRevocableFlag } from 'stellar-sdk';

export function prepareFreezeAssetTransaction(issuerPublicKey: string): xdr.Operation[] {
  const operationsArray = [
    Operation.setOptions({
      setFlags: AuthRevocableFlag,
      source: issuerPublicKey
    })
  ];
  return operationsArray;
}
