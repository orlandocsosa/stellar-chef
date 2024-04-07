<script lang="ts">
  import { Asset } from 'stellar-sdk';
  import useUserAsset from '../../composables/useUserAsset';
  import type IAsset from '../../services/asset/IAsset';
  import Label from '../Label.svelte';
  import Span from '../Span.svelte';
  import AssetSelector from '../asset-selector/AssetSelector.svelte';
  import NativeAssetCheckbox from '../asset-selector/NativeAssetCheckbox.svelte';
  import Button from '../salient/Button.svelte';
  import Title from '../salient/Title.svelte';

  export let onGetId: (getAssetA: () => Asset, getAssetB: () => Asset) => Promise<void>;
  export let onGetAssetTrust: (getAssetA: () => Asset, getAssetB: () => Asset, secretKey: string) => Promise<void>;
  export let assets: IAsset[];
  export let isLoading: boolean;
  let secretKey: string;

  const {
    isNative: isAssetANative,
    code: assetACode,
    issuer: assetAIssuer,
    selectedAsset: selectedAssetA,
    ...userAssetA
  } = useUserAsset(assets);

  const {
    isNative: isAssetBNative,
    code: assetBCode,
    issuer: assetBIssuer,
    selectedAsset: selectedAssetB,
    ...userAssetB
  } = useUserAsset(assets);

  function handleOnGetId() {
    onGetId(userAssetA.getAsset, userAssetB.getAsset);
  }

  function handleOnGetAssetTrust() {
    onGetAssetTrust(userAssetA.getAsset, userAssetB.getAsset, secretKey);
  }
</script>

<div class="flex flex-col gap-5">
  <div>
    <div class="flex flex-row gap-3 items-center">
      <Title tag="h3">Asset A</Title>
      <AssetSelector {assets} bind:value={$selectedAssetA} />
      <NativeAssetCheckbox bind:checked={$isAssetANative} />
    </div>

    {#if $selectedAssetA === null && !$isAssetANative}
      <Label>
        <Span>Code</Span>
        <input type="text" bind:value={$assetACode} />
      </Label>

      <Label>
        <Span>Issuer</Span>
        <input type="text" bind:value={$assetAIssuer} />
      </Label>
    {/if}
  </div>

  <div>
    <div class="flex flex-row gap-3 items-center">
      <Title tag="h3">Asset B</Title>
      <AssetSelector {assets} bind:value={$selectedAssetB} />
      <NativeAssetCheckbox bind:checked={$isAssetBNative} />
    </div>

    {#if $selectedAssetB === null && !$isAssetBNative}
      <Label>
        <Span>Code</Span>
        <input type="text" bind:value={$assetBCode} />
      </Label>

      <Label>
        <Span>Issuer</Span>
        <input type="text" bind:value={$assetBIssuer} />
      </Label>
    {/if}
  </div>

  <Label>
    Secret Key
    <input type="text" bind:value={secretKey} />
  </Label>

  <Button onClick={handleOnGetId}>Get Liquidity Pool ID</Button>
  <Button className={isLoading ? 'animate-pulse' : ''} disabled={isLoading} onClick={handleOnGetAssetTrust}>
    Get Liquidity Pool asset trust
  </Button>
</div>
