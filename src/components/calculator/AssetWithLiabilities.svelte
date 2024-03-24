<script lang="ts">
  import type { OfferRecord } from 'stellar-sdk/lib/horizon/types/offer';
  import Title from '../salient/Title.svelte';
  import Span from '../Span.svelte';
  import type { HorizonApi } from 'stellar-sdk/lib/horizon';

  export let offers: OfferRecord[];
  export let asset:
    | HorizonApi.BalanceLineAsset<'credit_alphanum4'>
    | HorizonApi.BalanceLineAsset<'credit_alphanum12'>
    | HorizonApi.BalanceLineNative;

  const filteredOffers = offers.filter((offer) => {
    if (asset.asset_type === 'native') {
      return offer.selling.asset_type === asset.asset_type || offer.buying.asset_type === asset.asset_type;
    } else {
      return (
        (offer.selling.asset_code === asset.asset_code && offer.selling.asset_issuer === asset.asset_issuer) ||
        (offer.buying.asset_code === asset.asset_code && offer.buying.asset_issuer === asset.asset_issuer)
      );
    }
  });
</script>

<div class="bg-gray-50 p-3 border rounded-md">
  <Title tag="h2">{asset.asset_type === 'native' ? 'XLM' : asset.asset_code}</Title>

  <div>
    <div>
      <Title tag="h3">Balance</Title>
      <Span>{asset.balance}</Span>
    </div>

    {#if +asset.buying_liabilities > 0}
      <div>
        <Title tag="h3">Buying liabilities</Title>
        <Span>{asset.buying_liabilities}</Span>
      </div>
    {/if}

    {#if +asset.selling_liabilities > 0}
      <div>
        <Title tag="h3">Selling liabilities</Title>
        <Span>{asset.selling_liabilities}</Span>
      </div>
    {/if}

    <div>
      <Title tag="h3">Offers</Title>

      {#each filteredOffers as { id }}
        <ul>
          <li>
            <a
              class="text-blue-500 hover:underline"
              href="https://stellar.expert/explorer/testnet/offer/{id}?order=desc"
              target="_blank"
              rel="noreferrer"
            >
              #{id}
            </a>
          </li>
        </ul>
      {/each}
    </div>
  </div>
</div>
