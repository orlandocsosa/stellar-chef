import { Operation } from 'stellar-sdk';
import type { xdr } from 'stellar-sdk';

export function buildManageDataOperation(formData: FormData): xdr.Operation {
  const sponsoredAccount = formData.get('sponsoredAccount') as string;
  const entryName = formData.get('entryName') as string;
  const entryValue = formData.get('entryValue') as string;

  return Operation.manageData({
    source: sponsoredAccount,
    name: entryName,
    value: entryValue
  });
}
