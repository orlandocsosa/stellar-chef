import LocalStorage from '../storage/LocalStorage';
import type IAsset from './IAsset';

export default class Asset {
  private readonly storage: LocalStorage;

  constructor() {
    this.storage = new LocalStorage();
  }

  private getAssetKey(asset: IAsset): string {
    return `asset-${asset.code}-${asset.issuer}`;
  }

  get(asset: IAsset): IAsset {
    const assetString = this.storage.get(this.getAssetKey(asset));
    return JSON.parse(assetString);
  }

  set(asset: IAsset): IAsset {
    this.storage.set(this.getAssetKey(asset), JSON.stringify(asset));
    return this.get(asset);
  }
}
