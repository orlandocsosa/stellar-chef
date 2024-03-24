<script lang="ts">
  import type { AccountResponse, HorizonApi, ServerApi } from 'stellar-sdk/lib/horizon';
  import Label from '../../components/Label.svelte';
  import Span from '../../components/Span.svelte';
  import Button from '../../components/salient/Button.svelte';
  import Card from '../../components/salient/Card.svelte';
  import { server } from '../../services/stellar/utils';
  import type { OfferRecord } from 'stellar-sdk/lib/horizon/types/offer';
  import AssetWithLiabilities from '../../components/calculator/AssetWithLiabilities.svelte';
  import Title from '../../components/salient/Title.svelte';

  let isLoading = false;
  let publicKey: string = 'GDFY5KM3FWNDLXLAEA2UQEVC5OOSYPGINGCX5EMC2NBK2BGE2EIGFMZ4';
  let reserves: number;
  let account: ServerApi.AccountRecord;
  let offers: OfferRecord[] = [];
  let assetsWithLiabilities: Array<
    | HorizonApi.BalanceLineAsset<'credit_alphanum4'>
    | HorizonApi.BalanceLineAsset<'credit_alphanum12'>
    | HorizonApi.BalanceLineNative
  > = [];

  async function getAccountReserves() {
    const baseReserve = 0.5;
    const defaultReserve = 2;

    reserves = (defaultReserve + account.subentry_count + account.num_sponsoring - account.num_sponsored) * baseReserve;
  }

  async function getAccountOffers() {
    const balances = account.balances;
    offers = (await server.offers().forAccount(publicKey).call()).records;
    offers = offers;

    balances.forEach((balance) => {
      if ('buying_liabilities' in balance) {
        if (+balance.buying_liabilities > 0 || +balance.selling_liabilities > 0) {
          assetsWithLiabilities.push(balance);
          assetsWithLiabilities = assetsWithLiabilities;
        }
      }
    });
  }

  async function handleSubmit() {
    isLoading = true;

    offers = [];
    assetsWithLiabilities = [];

    account = await server.accounts().accountId(publicKey).call();
    await getAccountReserves();
    await getAccountOffers();

    isLoading = false;
  }
</script>

<Card className="w-[600px] m-auto">
  <form class="flex flex-col gap-5 mb-5" on:submit|preventDefault={handleSubmit}>
    <Label>
      Public Key
      <input type="text" bind:value={publicKey} />
    </Label>

    <Button type="submit">Get data</Button>
  </form>

  {#if !isLoading}
    {#if reserves}
      <div class="mt-5">
        <p>Account reserves: <Span>{reserves}</Span></p>
      </div>
    {/if}

    {#if assetsWithLiabilities.length > 0}
      <div class="mt-10">
        <Title tag="h2">Assets with liabilities</Title>

        <ul class="flex flex-col gap-2">
          {#each assetsWithLiabilities as asset}
            <li><AssetWithLiabilities {asset} {offers} /></li>
          {/each}
        </ul>
      </div>
    {/if}
  {/if}
</Card>
