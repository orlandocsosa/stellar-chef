<script lang="ts">
  import Button from '../../../components/salient/Button.svelte';
  import Select from '../../../components/salient/Select.svelte';
  import Card from '../../../components/salient/Card.svelte';
  import Title from '../../../components/salient/Title.svelte';
  import AssetService from '../../../services/asset/Asset';
  import { parseEntriesValues, sliceString } from '../../../utils';
  import { Horizon, Keypair, Operation } from 'stellar-sdk';
  import {
    buildTransaction,
    getAssetFromUser,
    getSponsorWrapperOperations,
    server
  } from '../../../services/stellar/utils';
  import useToast from '../../../composables/useToast';
  import LoadingSpinner from '../../../components/LoadingSpinner.svelte';
  import JsonBlock from '../../../components/salient/JsonBlock.svelte';

  interface IChangeTrustForm {
    code: string;
    issuer: string;
    limit: string;
    source: string;
    sponsor: string;
  }

  const { showToast } = useToast();
  const assetsService = new AssetService();
  const storedAssets = assetsService.getAll();
  let transactionResult: Horizon.HorizonApi.SubmitTransactionResponse | null = null;
  let selectedAsset: number | null = null;
  let isLoading = false;

  async function handleOnSubmit(e: Event) {
    isLoading = true;
    transactionResult = null;

    try {
      const formData = new FormData(e.target as HTMLFormElement);
      const { code, issuer, limit, source, sponsor } = parseEntriesValues<IChangeTrustForm>(formData);
      const sourceKeypair = Keypair.fromSecret(source);
      const sponsorKeypair = sponsor ? Keypair.fromSecret(sponsor) : null;
      const asset = getAssetFromUser(false, storedAssets, selectedAsset, {
        code,
        issuer
      });

      const operation = Operation.changeTrust({
        asset,
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
  <title>Recipe Change Trust</title>
</svelte:head>

<Card className="w-[650px] m-auto">
  <Title>Change Trust</Title>

  <form class="mt-8" on:submit|preventDefault={handleOnSubmit}>
    <div class="flex flex-row gap-3">
      <Title tag="h3">Asset</Title>

      <Select className="h-8" color={selectedAsset !== null ? 'blue' : 'white'} bind:value={selectedAsset}>
        {#each storedAssets as { code, issuer }, i}
          <option class="bg-white text-black" value={i}>{`${code}|${sliceString(issuer)}`}</option>
        {/each}
      </Select>
    </div>

    {#if selectedAsset === null}
      <label class="flex flex-col gap-1">
        <p class="text-sm text-gray-600">Code</p>
        <input type="text" name="code" />
      </label>

      <label class="flex flex-col gap-1 mt-4">
        <p class="text-sm text-gray-600">Issuer</p>
        <input type="text" name="issuer" />
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
