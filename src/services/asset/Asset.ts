import LocalStorage from '../storage/LocalStorage';
import type IAsset from './IAsset';

export default class Asset {
  private readonly storage: LocalStorage;

  constructor() {
    this.storage = new LocalStorage();
  }

  public getAll(): IAsset[] {
    const assetsString = this.storage.get('assets');

    if (assetsString === null) {
      return [];
    }

    const assets = JSON.parse(assetsString);

    return assets;
  }

  set(asset: IAsset): IAsset[] {
    const assets = this.getAll();

    assets.push(asset);

    this.storage.set('assets', JSON.stringify(assets));

    return assets;
  }
}
