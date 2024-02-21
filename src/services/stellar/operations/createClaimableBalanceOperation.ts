import { get } from 'svelte/store';
import { claimant } from '../../../utils/stores/claimant';

export function buildCreateClaimableBalanceOperation(formData: FormData): any {
  console.log(get(claimant));
}
