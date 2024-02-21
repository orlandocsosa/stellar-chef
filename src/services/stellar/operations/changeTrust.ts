import { Operation, Asset } from 'stellar-sdk';
import type { xdr } from 'stellar-sdk';

export function buildChangeTrustOperation(formData: FormData): xdr.Operation {
  const sponsoredAccount = formData.get('sponsoredAccount') as string;
  const limit = formData.get('limit') as string;
  let limitValue;
  if (limit === '') limitValue = undefined;
  const assetCode = formData.get('assetCode') as string;

  console.log('limit', limit);

  return Operation.changeTrust({
    asset: new Asset(assetCode, sponsoredAccount),
    limit: limitValue
  });
}
