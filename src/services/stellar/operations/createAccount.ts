import { Operation } from 'stellar-sdk';
import type { xdr } from 'stellar-sdk';

export function buildCreateAccountOperation(formData: FormData): xdr.Operation {
  const sponsoredPublicKey = formData.get('sponsoredAccount') as string;
  const startingBalance = formData.get('startingBalance') as string;

  return Operation.createAccount({
    destination: sponsoredPublicKey,
    startingBalance
  });
}
