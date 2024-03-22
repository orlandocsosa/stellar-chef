<script lang="ts">
  import {
    Asset,
    Keypair,
    Operation,
    LiquidityPoolAsset,
    LiquidityPoolFeeV18,
    getLiquidityPoolId,
    xdr,
    Horizon
  } from 'stellar-sdk';
  import { buildTransaction, server } from '../../../services/stellar/utils';
  import type { AccountResponse } from 'stellar-sdk/lib/horizon';
  import Card from '../../../components/salient/Card.svelte';
  import Title from '../../../components/salient/Title.svelte';
  import Button from '../../../components/salient/Button.svelte';
  import Select from '../../../components/salient/Select.svelte';
  import AssetService from '../../../services/asset/Asset';
  import { parseEntriesValues, sliceString } from '../../../utils';
  import useUserAsset from '../../../composables/useUserAsset';
  import useToast from '../../../composables/useToast';
  import Span from '../../../components/Span.svelte';
  import LiquidityPool from '../../../components/liquidity-pool/LiquidityPool.svelte';
  import RadioOptions from '../../../components/salient/RadioOptions.svelte';
  import FractionInput from '../../../components/liquidity-pool/FractionInput.svelte';

  interface IAddLiquidityForm {
    secret: string;
    'max-reserve-a': string;
    'max-reserve-b': string;
    numerator: string;
    denominator: string;
    amount: string;
  }

  const assetsService = new AssetService();
  const assets = assetsService.getAll();
  const { showToast } = useToast();

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

  let isLoading = false;
  let liquidityPool: Horizon.ServerApi.LiquidityPoolRecord;
  let liquidityPollIdResult: string;
  let isMinPriceFraction = false;
  let isMaxPriceFraction = false;

  async function handleOnSubmit(e: Event) {
    isLoading = true;

    try {
      const formData = new FormData(e.target as HTMLFormElement);
      const secret = formData.get('secret') as string;
      const [assetA, assetB] = orderAssets(userAssetA.getAsset(), userAssetB.getAsset());
      const poolShareAsset = new LiquidityPoolAsset(assetA, assetB, LiquidityPoolFeeV18);
      const poolId = getLiquidityPoolId('constant_product', poolShareAsset.getLiquidityPoolParameters()).toString(
        'hex'
      );

      const accountKeypair = Keypair.fromSecret(secret);
      const account = await server.loadAccount(accountKeypair.publicKey());

      const operations: xdr.Operation[] = [];

      for (const asset of [assetA, assetB]) {
        if (asset.isNative()) continue;

        operations.push(
          Operation.changeTrust({
            asset
          })
        );
      }

      if (operations.length) {
        const transaction = buildTransaction(account, operations);
        transaction.sign(accountKeypair);
        await server.submitTransaction(transaction);
      }

      await establishPoolTrustline(account, accountKeypair, poolShareAsset);

      alert(poolId);

      console.log('poolId', poolId);
    } catch (e) {
      alert('error');
    } finally {
      isLoading = false;
    }
  }

  function handleGetLiquidityPoolID() {
    const [assetA, assetB] = orderAssets(userAssetA.getAsset(), userAssetB.getAsset());
    const poolShareAsset = new LiquidityPoolAsset(assetA, assetB, LiquidityPoolFeeV18);
    liquidityPollIdResult = getLiquidityPoolId(
      'constant_product',
      poolShareAsset.getLiquidityPoolParameters()
    ).toString('hex');
  }

  async function establishPoolTrustline(account: AccountResponse, keypair: Keypair, poolAsset: LiquidityPoolAsset) {
    const transaction = buildTransaction(account, [
      Operation.changeTrust({
        asset: poolAsset
      })
    ]);

    transaction.sign(keypair);
    await server.submitTransaction(transaction);
  }

  function orderAssets(assetA: Asset, assetB: Asset) {
    return Asset.compare(assetA, assetB) <= 0 ? [assetA, assetB] : [assetA, assetB];
  }

  async function handleSearchLiquidityPool(e: Event) {
    const formData = new FormData(e.target as HTMLFormElement);
    const poolId = formData.get('id');

    if (!poolId) showToast('Liquidity pool ID is required', 'danger');

    liquidityPool = await server
      .liquidityPools()
      .liquidityPoolId(poolId as string)
      .call();
  }

  async function handleAddLiquidity(e: Event) {
    const formData = new FormData(e.target as HTMLFormElement);
    const {
      'max-reserve-a': maxReserveA,
      'max-reserve-b': maxReserveB,
      secret,
      denominator,
      numerator,
      amount
    } = parseEntriesValues<IAddLiquidityForm>(formData);

    const accountKeypair = Keypair.fromSecret(secret);
    const account = await server.loadAccount(accountKeypair.publicKey());

    const exactPrice = +maxReserveA / +maxReserveB;
    const minPrice = exactPrice - exactPrice * 0.1;
    const maxPrice = exactPrice + exactPrice * 0.1;

    const transaction = buildTransaction(account, [
      Operation.liquidityPoolDeposit({
        liquidityPoolId: liquidityPool.id,
        maxAmountA: maxReserveA,
        maxAmountB: maxReserveB,
        minPrice: minPrice.toFixed(7),
        maxPrice: maxPrice.toFixed(7)
      })
    ]);

    transaction.sign(accountKeypair);
    await server.submitTransaction(transaction);
  }
</script>

<div class="flex flex-row gap-10 justify-center items-start">
  <Card className="w-[650px]">
    <Title tag="h2">Create liquidity pool</Title>

    <form class="flex flex-col gap-5" on:submit|preventDefault={handleOnSubmit}>
      <div class="flex flex-row items-center gap-3">
        <h3 class="text-lg">Asset A</h3>
        <Button onClick={userAssetA.toggleIsNative} color={$isAssetANative ? 'blue' : 'white'} className="h-8">
          Native
        </Button>
        <Select color={$selectedAssetA !== null ? 'blue' : 'white'} className="h-8" bind:value={$selectedAssetA}>
          {#each assets as { code, issuer }, i}
            <option class="bg-white text-black" value={i}>{`${code}|${sliceString(issuer)}`}</option>
          {/each}
        </Select>
      </div>

      {#if !$isAssetANative && $selectedAssetA === null}
        <label class="flex flex-col gap-1">
          <p class="text-sm text-gray-600">Code</p>
          <input type="text" bind:value={$assetACode} />
        </label>

        <label class="flex flex-col gap-1">
          <p class="text-sm text-gray-600">Issuer</p>
          <input type="text" bind:value={$assetAIssuer} />
        </label>
      {/if}

      <div class="flex flex-row items-center gap-3">
        <h3 class="text-lg">Asset B</h3>
        <Button onClick={userAssetB.toggleIsNative} color={$isAssetBNative ? 'blue' : 'white'} className="h-8">
          Native
        </Button>
        <Select color={$selectedAssetB !== null ? 'blue' : 'white'} className="h-8" bind:value={$selectedAssetB}>
          {#each assets as { code, issuer }, i}
            <option class="bg-white text-black" value={i}>{`${code}|${sliceString(issuer)}`}</option>
          {/each}
        </Select>
      </div>

      {#if !$isAssetBNative && $selectedAssetB === null}
        <label class="flex flex-col gap-1">
          <p class="text-sm text-gray-600">Code</p>
          <input type="text" bind:value={$assetBCode} />
        </label>

        <label class="flex flex-col gap-1">
          <p class="text-sm text-gray-600">Issuer</p>
          <input type="text" bind:value={$assetBIssuer} />
        </label>
      {/if}

      <div>
        <Title>Account</Title>

        <label class="flex flex-col gap-1">
          <p class="text-sm text-gray-600">Secret Key</p>
          <input type="text" name="secret" />
        </label>
      </div>

      <Button type="submit" className="h-10 mt-8" {isLoading}>GET Liquidity Pool asset trust</Button>
    </form>

    <form class="flex flex-col gap-5" on:submit|preventDefault={handleGetLiquidityPoolID}>
      <Button type="submit" className="h-10 mt-8" {isLoading}>GET liquidity pool ID</Button>
    </form>

    {#if liquidityPollIdResult}
      <p>ID: <Span>{liquidityPollIdResult}</Span></p>
    {/if}
  </Card>

  <Card className="w-[650px]">
    <Title tag="h2">Liquidity pool</Title>

    <form on:submit|preventDefault={handleSearchLiquidityPool}>
      <label class="flex flex-col gap-1">
        <p class="text-sm text-gray-600">ID</p>
        <input type="text" name="id" />
      </label>

      <Button type="submit" className="mt-7">Search</Button>
    </form>

    {#if liquidityPool}
      <div class="flex flex-col gap-10">
        <LiquidityPool {liquidityPool} />

        <form on:submit|preventDefault={handleAddLiquidity} class="flex flex-col gap-5">
          <Title tag="h3">Add liquidity</Title>

          <label class="flex flex-col gap-1">
            <p class="text-sm text-gray-600">Max reserve A</p>
            <input type="text" name="max-reserve-a" />
          </label>

          <label class="flex flex-col gap-1">
            <p class="text-sm text-gray-600">Max reserve B</p>
            <input type="text" name="max-reserve-b" />
          </label>

          <label class="flex flex-col gap-1">
            <p class="text-sm text-gray-600">User secret</p>
            <input type="text" name="secret" />
          </label>

          <div class="flex flex-col gap-5">
            <Title tag="h3">Min price</Title>

            <div class="flex flex-row justify-start text-sm mt-2">
              <RadioOptions
                options={[
                  { label: 'Number', value: false, checked: !isMinPriceFraction },
                  { label: 'Fraction', value: true, checked: isMinPriceFraction }
                ]}
                bind:group={isMinPriceFraction}
              />
            </div>

            <FractionInput bind:isFraction={isMinPriceFraction} />
          </div>

          <div class="flex flex-col gap-5">
            <Title tag="h3">Max price</Title>

            <div class="flex flex-row justify-start text-sm mt-2">
              <RadioOptions
                options={[
                  { label: 'Number', value: false, checked: !isMaxPriceFraction },
                  { label: 'Fraction', value: true, checked: isMaxPriceFraction }
                ]}
                bind:group={isMaxPriceFraction}
              />
            </div>

            <FractionInput bind:isFraction={isMaxPriceFraction} />
          </div>

          <Button type="submit" className="mt-7">Add liquidity</Button>
        </form>
      </div>
    {/if}
  </Card>
</div>
