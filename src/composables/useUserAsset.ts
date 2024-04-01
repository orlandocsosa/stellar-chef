import { writable, get, type Writable } from 'svelte/store';
import type IAsset from '../services/asset/IAsset';
import { Asset } from 'stellar-sdk';

function useUserAsset(assets: IAsset[]): {
  isNative: Writable<boolean>;
  selectedAsset: Writable<number | null>;
  code: Writable<string>;
  issuer: Writable<string>;
  getAsset: () => Asset;
  toggleIsNative: () => void;
} {
  const selectedAsset = writable<number | null>(null);
  const code = writable('');
  const issuer = writable('');
  const isNative = writable(false);

  selectedAsset.subscribe((value) => {
    if (value !== null) {
      isNative.set(false);
    }
  });

  isNative.subscribe((value) => {
    if (value) selectedAsset.set(null);
  });

  function toggleIsNative(): void {
    isNative.update((value) => {
      if (!value) selectedAsset.set(null);
      return !value;
    });
  }

  function getAsset(): Asset {
    const selectedAssetValue = get(selectedAsset);

    if (get(isNative)) {
      return Asset.native();
    }

    if (typeof selectedAssetValue === 'number') {
      const { code, issuer } = assets[selectedAssetValue];
      return new Asset(code, issuer);
    }

    return new Asset(get(code), get(issuer));
  }

  return { isNative, selectedAsset, code, issuer, getAsset, toggleIsNative };
}

export default useUserAsset;
