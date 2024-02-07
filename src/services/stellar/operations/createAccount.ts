import { Operation } from 'stellar-sdk';
import type { xdr } from 'stellar-sdk';

export function buildCreateAccountOperation(formData: FormData): xdr.Operation {
  const sponsoreePublicKey = formData.get('sponsoreeAccount') as string;
  const startingBalance = formData.get('startingBalance') as string;

  return Operation.createAccount({
    destination: sponsoreePublicKey,
    startingBalance
  });
}
