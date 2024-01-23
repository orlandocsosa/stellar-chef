import LocalStorage from '../storage/LocalStorage';
import type IAsset from './IAsset';

export default class Asset {
  private readonly storage: LocalStorage;

  constructor() {
    this.storage = new LocalStorage();

    const assets = this.storage.get('assets');
    if (assets === null) {
      this.storage.set('assets', []);
    }
  }

  public getAssets(): IAsset[] {
    let assetsString = this.storage.get('assets');

    if (assetsString === null) {
      this.storage.set('assets', []);
      assetsString = this.storage.get('assets');
    }

    if (assetsString === null) {
      throw new Error('Failed to initialize assets in localStorage');
    }

    const assets = JSON.parse(assetsString);

    if (!Array.isArray(assets)) {
      return [];
    }

    return assets;
  }

  get(asset: IAsset): IAsset | undefined {
    const assets = this.getAssets();
    return assets.find((a) => a.code === asset.code && a.issuer === asset.issuer);
  }

  set(asset: IAsset): IAsset {
    const assets = this.getAssets();

    assets.push(asset);

    this.storage.set('assets', assets);

    return asset;
  }
}
