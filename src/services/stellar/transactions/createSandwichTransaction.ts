import { Operation } from 'stellar-sdk';
import type { Keypair, Transaction, xdr } from 'stellar-sdk';
import { buildTransaction, server } from '../utils';

export async function createSandwichTransaction(
  sponsoredOperation: xdr.Operation,
  sponsoredKeypair: Keypair,
  sponsorKeypair: Keypair
): Promise<Transaction> {
  const sponsorAccount = await server.loadAccount(sponsorKeypair.publicKey());
  const startSponsoringOperation = Operation.beginSponsoringFutureReserves({
    sponsoredId: sponsoredKeypair.publicKey()
  });

  const endSponsoringOperation = Operation.endSponsoringFutureReserves({
    source: sponsoredKeypair.publicKey()
  });

  const operations = [startSponsoringOperation, sponsoredOperation, endSponsoringOperation];
  const transaction = buildTransaction(sponsorAccount, operations);
  transaction.sign(sponsorKeypair);
  transaction.sign(sponsoredKeypair);

  return transaction;
}
