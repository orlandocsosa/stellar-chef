<script lang="ts">
  import type { IClaimant } from '../../services/stellar/types';
  import Button from './Button.svelte';
  import Predicate from './Predicate.svelte';

  export let claimant: IClaimant;
  export let index: number;
  export let onRemoveClaimant: () => void;
</script>

<div>
  <div class="flex flex-row gap-3 items-center">
    <h2 class="font-semibold text-2xl">Claimant <span class="text-blue-600">#</span>{index + 1}</h2>
    <Button color="white" onClick={onRemoveClaimant}>Remove</Button>
  </div>

  <div class="flex flex-col gap-2 mt-5">
    <h3 class="text-lg">Destination</h3>
    <input name="destination" type="text" bind:value={claimant.destination} />
  </div>

  <Predicate predicate={claimant.predicate} />
</div>
