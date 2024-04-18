<script lang="ts">
  import Button from '../../../components/base/Button.svelte';
  import Card from '../../../components/base/Card.svelte';
  import Title from '../../../components/base/Title.svelte';
  import AssetService from '../../../services/asset/Asset';
  import { parseEntriesValues } from '../../../utils';
  import { Horizon, Keypair, Operation } from 'stellar-sdk';
  import { buildTransaction, getSponsorWrapperOperations, server } from '../../../services/stellar/utils';
  import useToast from '../../../composables/useToast';
  import LoadingSpinner from '../../../components/base/LoadingSpinner.svelte';
  import JsonBlock from '../../../components/base/JsonBlock.svelte';
  import AssetSelector from '../../../components/asset-selector/AssetSelector.svelte';
  import useUserAsset from '../../../composables/useUserAsset';

  interface IChangeTrustForm {
    code: string;
    issuer: string;
    limit: string;
    source: string;
    sponsor: string;
  }

  const assetsService = new AssetService();
  const assets = assetsService.getAll();
  const { showToast } = useToast();
  const { code, getAsset, issuer, selectedAsset } = useUserAsset(assets);

  let transactionResult: Horizon.HorizonApi.SubmitTransactionResponse | null = null;
  let isLoading = false;

  async function handleOnSubmit(e: Event) {
    isLoading = true;
    transactionResult = null;

    try {
      const formData = new FormData(e.target as HTMLFormElement);
      const { limit, source, sponsor } = parseEntriesValues<IChangeTrustForm>(formData);
      const sourceKeypair = Keypair.fromSecret(source);
      const sponsorKeypair = sponsor ? Keypair.fromSecret(sponsor) : null;

      const operation = Operation.changeTrust({
        asset: getAsset(),
        limit: limit || undefined
      });

      const operations = sponsorKeypair
        ? getSponsorWrapperOperations(operation, sourceKeypair.publicKey(), sponsorKeypair.publicKey())
        : [operation];

      const transaction = buildTransaction(await server.loadAccount(sourceKeypair.publicKey()), operations);
      transaction.sign(sourceKeypair);

      if (sponsorKeypair) {
        transaction.sign(sponsorKeypair);
      }

      transactionResult = await server.submitTransaction(transaction);
      showToast('Trust changed successfully', 'success');
    } catch (e) {
      showToast(`${e}`, 'danger');
    } finally {
      isLoading = false;
    }
  }
</script>

<svelte:head>
  <title>Change Trust</title>
</svelte:head>

<Card className="w-[650px] m-auto">
  <Title>Change Trust</Title>

  <form class="mt-8" on:submit|preventDefault={handleOnSubmit}>
    <div class="flex flex-row gap-3">
      <Title tag="h3">Asset</Title>

      <AssetSelector {assets} bind:value={$selectedAsset} />
    </div>

    {#if $selectedAsset === null}
      <label class="flex flex-col gap-1">
        <p class="text-sm text-gray-600">Code</p>
        <input type="text" bind:value={$code} />
      </label>

      <label class="flex flex-col gap-1 mt-4">
        <p class="text-sm text-gray-600">Issuer</p>
        <input type="text" bind:value={$issuer} />
      </label>
    {/if}

    <label class="flex flex-col gap-1 mt-4">
      Trust Limit
      <input type="text" name="limit" />
    </label>

    <label class="flex flex-col gap-1 mt-4">
      Source Account
      <input type="text" name="source" />
    </label>

    <label class="flex flex-col gap-1 mt-4">
      <p>Sponsor Account <span class="text-gray-600">(optional)</span></p>
      <input type="text" name="sponsor" />
    </label>

    <Button type="submit" className="mt-8 h-12 w-full">
      {#if isLoading}
        <div class="w-8"><LoadingSpinner /></div>
      {:else}
        Change trust
      {/if}
    </Button>
  </form>

  {#if transactionResult}
    <div class="mt-8">
      <JsonBlock>
        {JSON.stringify(transactionResult, null, 2)}
      </JsonBlock>
    </div>
  {/if}
</Card>
