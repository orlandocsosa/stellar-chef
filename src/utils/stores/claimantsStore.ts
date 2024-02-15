import { writable, type Writable } from 'svelte/store';

export interface Claimant {
  claimantNumber: number;
  destination: string;
  predicates: object[];
}

export const claimantsStore: Writable<Claimant[]> = writable([]);
