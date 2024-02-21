import { get } from 'svelte/store';
import { claimantsStore } from '../../../utils/stores/claimantsStore';

export function buildCreateClaimableBalanceOperation(formData: FormData): any {
  console.log(get(claimantsStore));
}
