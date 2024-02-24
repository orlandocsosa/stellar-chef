import { writable } from 'svelte/store';
import type { IClaimant } from '../services/stellar/types';

export const claimants = writable<IClaimant[]>([]);
