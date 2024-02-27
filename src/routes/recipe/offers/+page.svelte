<script lang="ts">
  import { Asset, Keypair, Operation, xdr } from 'stellar-sdk';
  import AssetService from '../../../services/asset/Asset';
  import Button from '../../../components/salient/Button.svelte';
  import Card from '../../../components/salient/Card.svelte';
  import RadioOptions from '../../../components/salient/RadioOptions.svelte';
  import { parseEntriesValues, sliceString } from '../../../utils';
  import { buildTransaction, getSponsorWrapperOperations, server } from '../../../services/stellar/utils';
  import JsonBlock from '../../../components/salient/JsonBlock.svelte';
  import type { IOfferRequest, IOfferRecord } from '../../../services/stellar/types';
  import Select from '../../../components/salient/Select.svelte';

  const assetsService = new AssetService();
  const storedAssets = assetsService.getAll();
  let offerType: 'buy' | 'sell' | 'passiveSell' = 'sell';
  let offersRecords: IOfferRecord[] = [];
  let jsonValue: object;
  let userAssets = {
    buying: {
      isNative: false,
      code: '',
      issuer: '',
      selectedAsset: null
    },
    selling: {
      isNative: false,
      code: '',
      issuer: '',
      selectedAsset: null
    }
  };

  async function handleOnSubmit(e: Event) {
    try {
      const formData = new FormData(e.currentTarget as HTMLFormElement);
      const { amount, offerID, price, source, sponsor } = parseEntriesValues<IOfferRequest>(formData);

      const sourceKeypair = Keypair.fromSecret(source);
      const sponsorKeypair = sponsor ? Keypair.fromSecret(sponsor) : undefined;

      const buyingAsset = userAssets.buying.isNative
        ? Asset.native()
        : new Asset(userAssets.buying.code, userAssets.buying.issuer);

      const sellingAsset = userAssets.selling.isNative
        ? Asset.native()
        : new Asset(userAssets.selling.code, userAssets.selling.issuer);

      const options = {
        price: price,
        buying: buyingAsset,
        selling: sellingAsset,
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

      const result = await server.submitTransaction(transaction);

      if (result.successful) {
        jsonValue = {
          envXdr: result.envelope_xdr,
          resultXdr: result.result_xdr,
          offerResults: result['offerResults' as keyof typeof result]
        };
      } else {
        jsonValue = result;
      }
    } catch (e) {
      jsonValue = { error: `${e}` };
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

  function handleSelectedAsset(value: number | null, type: 'buying' | 'selling') {
    userAssets[type].code = value !== null ? storedAssets[value].code : '';
    userAssets[type].issuer = value !== null ? storedAssets[value].issuer : '';
  }

  $: if (userAssets.buying.selectedAsset !== null) {
    userAssets.buying.isNative = false;
  }

  $: if (userAssets.buying.selectedAsset !== null) {
    userAssets.selling.isNative = false;
  }
</script>

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
          <Button
            onClick={() => {
              userAssets.buying.selectedAsset = null;
              userAssets.buying.isNative = !userAssets.buying.isNative;
            }}
            color={userAssets.buying.isNative ? 'blue' : 'white'}
            className="h-8">Native</Button
          >

          <Select
            on:selected={(e) => handleSelectedAsset(e.detail, 'buying')}
            className="h-8"
            color={userAssets.buying.selectedAsset !== null ? 'blue' : 'white'}
            bind:value={userAssets.buying.selectedAsset}
          >
            {#each storedAssets as { code, issuer }, i}
              <option class="bg-white text-black" value={i}>{`${code}|${sliceString(issuer)}`}</option>
            {/each}
          </Select>
        </div>

        {#if !userAssets.buying.isNative && userAssets.buying.selectedAsset === null}
          <label class="flex flex-col gap-1">
            <p class="text-sm text-gray-600">Code</p>
            <input type="text" bind:value={userAssets.buying.code} />
          </label>

          <label class="flex flex-col gap-1">
            <p class="text-sm text-gray-600">Issuer</p>
            <input type="text" bind:value={userAssets.buying.issuer} />
          </label>
        {/if}
      </div>

      <div class="flex flex-col gap-2">
        <div class="flex flex-row gap-3">
          <h3 class="text-lg">Selling</h3>
          <Button
            onClick={() => {
              userAssets.selling.selectedAsset = null;
              userAssets.selling.isNative = !userAssets.selling.isNative;
            }}
            color={userAssets.selling.isNative ? 'blue' : 'white'}
            className="h-8">Native</Button
          >
          <Select
            on:selected={(e) => handleSelectedAsset(e.detail, 'selling')}
            className="h-8"
            color={userAssets.selling.selectedAsset !== null ? 'blue' : 'white'}
            bind:value={userAssets.selling.selectedAsset}
          >
            {#each storedAssets as { code, issuer }, i}
              <option class="bg-white text-black" value={i}>{`${code}|${sliceString(issuer)}`}</option>
            {/each}
          </Select>
        </div>

        {#if !userAssets.selling.isNative && userAssets.selling.selectedAsset === null}
          <label class="flex flex-col gap-1">
            <p class="text-sm text-gray-600">Code</p>
            <input type="text" bind:value={userAssets.selling.code} />
          </label>

          <label class="flex flex-col gap-1">
            <p class="text-sm text-gray-600">Issuer</p>
            <input type="text" bind:value={userAssets.selling.issuer} />
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
