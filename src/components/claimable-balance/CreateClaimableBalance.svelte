<script lang="ts">
  import type { Horizon } from 'stellar-sdk';
  import Card from '../salient/Card.svelte';
  import Button from '../salient/Button.svelte';
  import { claimants } from '../../store/claimants';

  export let isNative = false;

  function toggleIsNative() {
    isNative = !isNative;
  }

  function addClaimant() {
    $claimants.push({ destination: '', predicate: { type: '' } });
    $claimants = $claimants;
  }
</script>

<Card className="w-[650px] font-light">
  <h2 class="font-semibold text-2xl">Create a claimable balance</h2>

  <div class="flex flex-col gap-3 mt-8">
    <div class="flex flex-row items-center gap-3">
      <h3 class="text-lg">Asset</h3>
      <Button onClick={toggleIsNative} color={isNative ? 'blue' : 'white'} className="h-8">Native</Button>
    </div>

    {#if !isNative}
      <label>
        <p class="text-sm font-light text-black/50">Code</p>
        <input name="code" type="text" class="w-full" />
      </label>

      <label>
        <p class="text-sm font-light text-black/50">Issuer</p>
        <input name="issuer" type="text" class="w-full" />
      </label>
    {/if}
  </div>

  <div class="flex flex-col gap-3 mt-8">
    <h3 class="text-lg">Amount</h3>
    <input name="amount" type="text" />
  </div>

  <div class="flex flex-col gap-3 mt-8">
    <h3 class="text-lg">Source Account</h3>
    <label>
      <p class="text-sm font-light text-black/50">Secret Key</p>
      <input name="secret" type="text" class="w-full" />
    </label>
  </div>

  <div class="flex flex-col gap-5 mt-8">
    <div class="flex flex-row gap-5 items-center">
      <Button onClick={addClaimant} className="font-normal   text-sm">ADD</Button>
      <p class="text-lg">
        Claimants<span class="text-black/50">{$claimants.length > 0 ? `: ${$claimants.length}` : ''}</span>
      </p>
    </div>
  </div>

  <Button type="submit" className="h-10 w-full text-lg mt-8">Prepare!</Button>

  <slot />
</Card>
