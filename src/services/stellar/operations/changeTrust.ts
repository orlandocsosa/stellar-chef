import { Operation, Asset } from 'stellar-sdk';
import type { xdr } from 'stellar-sdk';

export function buildChangeTrustOperation(formData: FormData): xdr.Operation {
  const sponsoreeAccount = formData.get('sponsoreeAccount') as string;
  const limit = formData.get('limit') as string;
  let limitValue;
  if (limit === '') limitValue = undefined;
  const assetCode = formData.get('assetCode') as string;

  console.log('limit', limit);

  return Operation.changeTrust({
    asset: new Asset(assetCode, sponsoreeAccount),
    limit: limitValue
  });
}
