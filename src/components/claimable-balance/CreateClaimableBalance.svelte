<script lang="ts">
  import Card from '../base/Card.svelte';
  import Button from '../base/Button.svelte';
  import { claimants } from '../../store/claimants';
  import type IAsset from '../../services/asset/IAsset';
  import NativeAssetCheckbox from '../asset-selector/NativeAssetCheckbox.svelte';
  import AssetSelector from '../asset-selector/AssetSelector.svelte';

  export let isNative = false;
  export let assets: IAsset[];
  export let issuer: string;
  export let code: string;
  export let selectedAsset: number | null;

  function toggleIsNative() {
    selectedAsset = null;
    isNative = !isNative;
  }

  function addClaimant() {
    $claimants.push({ destination: '', predicate: { type: '' } });
    $claimants = $claimants;
  }

  $: if (selectedAsset !== null) {
    isNative = false;
  }
</script>

<Card className="w-[650px] font-light">
  <h2 class="font-semibold text-2xl">Create a claimable balance</h2>

  <div class="flex flex-col gap-3 mt-8">
    <div class="flex flex-row items-center gap-3">
      <h3 class="text-lg">Asset</h3>
      <NativeAssetCheckbox bind:checked={isNative} />
      <AssetSelector {assets} bind:value={selectedAsset} />
    </div>

    {#if !isNative && selectedAsset === null}
      <label>
        <p class="text-sm font-light text-black/50">Code</p>
        <input name="code" type="text" class="w-full" bind:value={code} />
      </label>

      <label>
        <p class="text-sm font-light text-black/50">Issuer</p>
        <input name="issuer" type="text" class="w-full" bind:value={issuer} />
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
</Card>
