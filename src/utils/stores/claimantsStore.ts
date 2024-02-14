import { writable, type Writable } from 'svelte/store';

interface Claimant {
  number: number;
  destination: string;
  predicates: object[];
}

export const claimantsStore: Writable<Claimant[]> = writable([]);
