import { writable, type Writable } from 'svelte/store';
import type { PredicateType } from '../../services/stellar/claimants/predicateFactory';

export interface Claimant {
  destination: string;
  predicate: PredicateType;
}

export const claimants: Writable<Claimant[]> = writable([]);
