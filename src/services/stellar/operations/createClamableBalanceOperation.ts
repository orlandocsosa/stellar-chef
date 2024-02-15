import { claimantsStore } from '../../../utils/stores/claimantsStore';

export function buildCreateClamableBalanceOperation(formData: FormData): any {
  console.log('formData', formData);
  const unsubscribe = claimantsStore.subscribe((claimants) => {
    console.log('claimantsStore from buildCreateClamableBalanceOperation', claimants);
  });

  unsubscribe();
}
