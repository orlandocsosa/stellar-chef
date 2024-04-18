<script lang="ts">
  import { Asset, Keypair, Operation, xdr } from 'stellar-sdk';
  import AssetService from '../../../services/asset/Asset';
  import Button from '../../../components/base/Button.svelte';
  import Card from '../../../components/base/Card.svelte';
  import RadioOptions from '../../../components/base/RadioOptions.svelte';
  import { parseEntriesValues } from '../../../utils';
  import {
    buildTransaction,
    getSponsorWrapperOperations,
    server,
    submitTransaction
  } from '../../../services/stellar/utils';
  import JsonBlock from '../../../components/base/JsonBlock.svelte';
  import type { IOfferRequest, IOfferRecord } from '../../../services/stellar/types';
  import NativeAssetCheckbox from '../../../components/asset-selector/NativeAssetCheckbox.svelte';
  import AssetSelector from '../../../components/asset-selector/AssetSelector.svelte';
  import useUserAsset from '../../../composables/useUserAsset';
  import useToast from '../../../composables/useToast';

  const { showToast, toggleLoadingToast } = useToast();
  const assetsService = new AssetService();
  const assets = assetsService.getAll();
  const {
    code: buyingAssetCode,
    issuer: buyingAssetIssuer,
    selectedAsset: buyingSelectedAsset,
    isNative: isBuyingAssetNative,
    getAsset: getBuyingAsset
  } = useUserAsset(assets);

  const {
    code: sellingAssetCode,
    issuer: sellingAssetIssuer,
    selectedAsset: sellingSelectedAsset,
    isNative: isSellingAssetNative,
    getAsset: getSellingAsset
  } = useUserAsset(assets);

  let offerType: 'buy' | 'sell' | 'passiveSell' = 'sell';
  let offersRecords: IOfferRecord[] = [];
  let jsonValue: object;

  async function handleOnSubmit(e: Event) {
    toggleLoadingToast(true, 'Submitting offer...');

    try {
      const formData = new FormData(e.currentTarget as HTMLFormElement);
      const { amount, offerID, price, source, sponsor } = parseEntriesValues<IOfferRequest>(formData);

      const sourceKeypair = Keypair.fromSecret(source);
      const sponsorKeypair = sponsor ? Keypair.fromSecret(sponsor) : undefined;

      const options = {
        price: price,
        buying: getBuyingAsset(),
        selling: getSellingAsset(),
        offerId: offerID,
        source: sourceKeypair.publicKey()
      };

      const offerOperations: Record<typeof offerType, xdr.Operation> = {
        buy: Operation.manageBuyOffer({
          buyAmount: amount,
          ...options
        }),
        sell: Operation.manageSellOffer({
          amount: amount,
          ...options
        }),
        passiveSell: Operation.createPassiveSellOffer({
          amount,
          ...options
        })
      };

      const operations = sponsorKeypair
        ? [
            ...getSponsorWrapperOperations(
              offerOperations[offerType],
              sponsorKeypair.publicKey(),
              sourceKeypair.publicKey()
            )
          ]
        : [offerOperations[offerType]];

      const transaction = buildTransaction(await server.loadAccount(sourceKeypair.publicKey()), operations);
      transaction.sign(sourceKeypair);
      if (sponsorKeypair) transaction.sign(sponsorKeypair);

      const result = await submitTransaction(transaction);

      if (result.successful) {
        jsonValue = {
          envXdr: result.envelope_xdr,
          resultXdr: result.result_xdr,
          offerResults: result['offerResults' as keyof typeof result]
        };
      } else {
        jsonValue = result;
      }

      toggleLoadingToast(false);
      showToast('Offer submitted', 'success');
    } catch (e) {
      jsonValue = { error: `${e}` };
      toggleLoadingToast(false);
      showToast(`Error: ${e}`, 'danger');
    }
  }

  async function handleOffersSearch(e: Event) {
    offersRecords = [];
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const publicKey = formData.get('publicKey');

    if (publicKey) {
      const { records } = await server.offers().forAccount(publicKey.toString()).call();

      records.map(({ amount, buying, selling, id, price, seller }) => {
        let buyingCode = '';
        let sellingCode = '';

        if (buying.asset_type === 'native') buyingCode = 'XLM';
        if (selling.asset_type === 'native') sellingCode = 'XLM';
        if (buying.asset_code) buyingCode = buying.asset_code;
        if (selling.asset_code) sellingCode = selling.asset_code;

        offersRecords.push({
          amount,
          buying: { code: buyingCode, issuer: buying.asset_issuer || '' },
          selling: { code: sellingCode, issuer: selling.asset_issuer || '' },
          id,
          price,
          seller
        });
        offersRecords = offersRecords;
      });
    }
  }
</script>

<svelte:head>
  <title>Offers</title>
</svelte:head>

<div class="flex flex-row items-start gap-10 justify-center">
  <Card className="w-[650px]">
    <h2 class="text-2xl mb-8">Create Offer</h2>

    <div class="flex flex-row justify-start text-sm mt-5">
      <RadioOptions
        options={[
          { label: 'Buying', value: 'buy', checked: offerType === 'buy' },
          { label: 'Selling', value: 'sell', checked: offerType === 'sell' },
          { label: 'Passive Selling', value: 'passiveSell', checked: offerType === 'passiveSell' }
        ]}
        bind:group={offerType}
      />
    </div>

    <form class="flex flex-col gap-7 mt-8" on:submit|preventDefault={handleOnSubmit}>
      <div class="flex flex-col gap-2">
        <div class="flex flex-row gap-3">
          <h3 class="text-lg">Buying</h3>
          <NativeAssetCheckbox bind:checked={$isBuyingAssetNative} />
          <AssetSelector {assets} bind:value={$buyingSelectedAsset} />
        </div>

        {#if !$isBuyingAssetNative && $buyingSelectedAsset === null}
          <label class="flex flex-col gap-1">
            <p class="text-sm text-gray-600">Code</p>
            <input type="text" bind:value={$buyingAssetCode} />
          </label>

          <label class="flex flex-col gap-1">
            <p class="text-sm text-gray-600">Issuer</p>
            <input type="text" bind:value={$buyingAssetIssuer} />
          </label>
        {/if}
      </div>

      <div class="flex flex-col gap-2">
        <div class="flex flex-row gap-3">
          <h3 class="text-lg">Selling</h3>
          <NativeAssetCheckbox bind:checked={$isSellingAssetNative} />
          <AssetSelector {assets} bind:value={$sellingSelectedAsset} />
        </div>

        {#if !$isSellingAssetNative && $sellingSelectedAsset === null}
          <label class="flex flex-col gap-1">
            <p class="text-sm text-gray-600">Code</p>
            <input type="text" bind:value={$sellingAssetCode} />
          </label>

          <label class="flex flex-col gap-1">
            <p class="text-sm text-gray-600">Issuer</p>
            <input type="text" bind:value={$sellingAssetIssuer} />
          </label>
        {/if}
      </div>

      <label class="flex flex-col gap-1">
        Amount you are {offerType === 'buy' ? 'buying' : 'selling'}
        <input type="text" name="amount" />
      </label>

      <label class="flex flex-col gap-1">
        Price of 1 unit of buying in terms of {offerType === 'buy' ? 'selling' : 'buying'}
        <input type="text" name="price" />
      </label>

      {#if offerType !== 'passiveSell'}
        <label class="flex flex-col gap-1">
          Offer ID
          <input type="text" name="id" />
        </label>
      {/if}

      <label class="flex flex-col gap-1">
        Source Account
        <input type="text" name="source" />
      </label>

      <label class="flex flex-col gap-1">
        <p>Sponsor <span class="text-sm text-gray-600">(optional)</span></p>
        <input type="text" name="sponsor" />
      </label>

      <Button type="submit">Create offer</Button>
    </form>

    {#if jsonValue}
      <div class="mt-8">
        <JsonBlock>{JSON.stringify(jsonValue, null, 2)}</JsonBlock>
      </div>
    {/if}
  </Card>

  <Card className="w-[650px]">
    <h2 class="text-2xl mb-8">Search Offers</h2>

    <form on:submit|preventDefault={handleOffersSearch}>
      <label class="flex flex-col gap-1">
        Public Key
        <input type="text" name="publicKey" />
      </label>

      <Button type="submit" className="mt-7">Search</Button>
    </form>

    {#each offersRecords as { amount, buying, id, price, seller, selling }, i}
      <div class="flex flex-col gap-2 bg-gray-50 border border-gray-200 rounded-md px-5 py-2 mt-7">
        <p>ID: <span class="text-sm text-gray-600">{id}</span></p>
        <p>Amount: <span class="text-sm text-gray-600">{amount}</span></p>
        <p>Price: <span class="text-sm text-gray-600">{price}</span></p>
        <p>Seller: <span class="text-sm text-gray-600">{seller}</span></p>
        <p>
          Buying Asset: <span class="text-sm text-gray-600"
            >{buying.code}{buying.issuer ? `|${buying.issuer}` : ''}</span
          >
        </p>
        <p>
          Selling Asset: <span class="text-sm text-gray-600"
            >{selling.code}{selling.issuer ? `|${selling.issuer}` : ''}</span
          >
        </p>
      </div>
    {/each}
  </Card>
</div>
