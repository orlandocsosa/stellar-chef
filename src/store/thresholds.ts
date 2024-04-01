import { writable } from 'svelte/store';

interface IThresholds {
  low: number | undefined;
  med: number | undefined;
  high: number | undefined;
}

export const thresholds = writable<IThresholds>({
  low: undefined,
  med: undefined,
  high: undefined
});
