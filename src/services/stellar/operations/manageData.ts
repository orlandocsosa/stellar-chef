import { Operation } from 'stellar-sdk';
import type { xdr } from 'stellar-sdk';

export function buildManageDataOperation(formData: FormData): xdr.Operation {
  const sponsoreeAccount = formData.get('sponsoreeAccount') as string;
  const entryName = formData.get('entryName') as string;
  const entryValue = formData.get('entryValue') as string;

  return Operation.manageData({
    source: sponsoreeAccount,
    name: entryName,
    value: entryValue
  });
}
