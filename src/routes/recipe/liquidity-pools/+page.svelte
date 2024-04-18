<script lang="ts">
  import { Asset, LiquidityPoolAsset, getLiquidityPoolId, LiquidityPoolFeeV18, Operation, Keypair } from 'stellar-sdk';
  import AssetsForm from '../../../components/liquidity-pool/AssetsForm.svelte';
  import Card from '../../../components/base/Card.svelte';
  import Title from '../../../components/base/Title.svelte';
  import AssetService from '../../../services/asset/Asset';
  import useToast from '../../../composables/useToast';
  import {
    buildTransaction,
    getAccountBalances,
    orderAssets,
    server,
    submitTransaction
  } from '../../../services/stellar/utils';
  import SearchForm from '../../../components/liquidity-pool/SearchForm.svelte';
  import type { ServerApi } from 'stellar-sdk/lib/horizon';
  import LiquidityPool from '../../../components/liquidity-pool/LiquidityPool.svelte';
  import ParticipateRadio from '../../../components/liquidity-pool/ParticipateRadio.svelte';
  import DepositForm from '../../../components/liquidity-pool/DepositForm.svelte';
  import WithdrawForm from '../../../components/liquidity-pool/WithdrawForm.svelte';
  import Label from '../../../components/base/Label.svelte';

  const assetsService = new AssetService();
  const assets = assetsService.getAll();
  const { showToast } = useToast();
  let secretKey = '';
  let participateAction: 'withdraw' | 'deposit' = 'deposit';
  let liquidityPool: ServerApi.LiquidityPoolRecord;
  let liquidityPoolId = '';
  let isLoading = false;

  async function handleGetLiquidityPoolId(getAssetA: () => Asset, getAssetB: () => Asset) {
    try {
      const [assetA, assetB] = orderAssets(getAssetA(), getAssetB());
      const poolShareAsset = new LiquidityPoolAsset(assetA, assetB, LiquidityPoolFeeV18);
      liquidityPoolId = getLiquidityPoolId('constant_product', poolShareAsset.getLiquidityPoolParameters()).toString(
        'hex'
      );
    } catch (e) {
      showToast((e as Error).message, 'danger');
    }
  }

  async function handleGetAssetTrust(getAssetA: () => Asset, getAssetB: () => Asset, secretKey: string) {
    isLoading = true;

    try {
      const [assetA, assetB] = orderAssets(getAssetA(), getAssetB());
      const poolShareAsset = new LiquidityPoolAsset(assetA, assetB, LiquidityPoolFeeV18);
      const keypair = Keypair.fromSecret(secretKey);
      const account = await server.loadAccount(keypair.publicKey());
      let operations = [];

      if (!getAccountBalances(account, assetA) && !assetA.isNative()) {
        operations.push(
          Operation.changeTrust({
            asset: assetA
          })
        );
      }

      if (!getAccountBalances(account, assetB) && !assetB.isNative()) {
        operations.push(
          Operation.changeTrust({
            asset: assetB
          })
        );
      }

      const transaction = buildTransaction(account, [
        ...operations,
        Operation.changeTrust({
          asset: poolShareAsset
        })
      ]);

      transaction.sign(keypair);
      await submitTransaction(transaction);
      showToast('Asset trustline established', 'success');
    } catch (e) {
      showToast((e as Error).message, 'danger');
    } finally {
      isLoading = false;
    }
  }

  async function handleSearchLiquidityPool(id: string) {
    isLoading = true;

    try {
      liquidityPool = await server.liquidityPools().liquidityPoolId(id).call();
    } catch (e) {
      showToast((e as Error).message, 'danger');
    } finally {
      isLoading = false;
    }
  }

  async function handleOnDeposit(depositA: string, depositB: string, minSlippage: string, maxSlippage: string) {
    isLoading = true;

    try {
      const accountKeypair = Keypair.fromSecret(secretKey);
      const account = await server.loadAccount(accountKeypair.publicKey());

      const exactPrice = +depositA / +depositB;
      const minPrice = exactPrice - exactPrice * +minSlippage;
      const maxPrice = exactPrice + exactPrice * +maxSlippage;

      const transaction = buildTransaction(account, [
        Operation.liquidityPoolDeposit({
          liquidityPoolId: liquidityPool.id,
          maxAmountA: depositA,
          maxAmountB: depositB,
          minPrice: minPrice.toFixed(7),
          maxPrice: maxPrice.toFixed(7)
        })
      ]);

      transaction.sign(accountKeypair);
      await server.submitTransaction(transaction);
      showToast('Deposit successful', 'success');
    } catch (e) {
      showToast((e as Error).message, 'danger');
    } finally {
      isLoading = false;
    }
  }

  async function handleWithdraw(sharesAmount: string) {
    isLoading = true;

    try {
      const accountKeypair = Keypair.fromSecret(secretKey);
      const account = await server.loadAccount(accountKeypair.publicKey());
      const totalShares = liquidityPool.total_shares;

      let minReserveA = (+sharesAmount / +totalShares) * +liquidityPool.reserves[0].amount * 0.95;
      let minReserveB = (+sharesAmount / +totalShares) * +liquidityPool.reserves[1].amount * 0.95;

      const transaction = buildTransaction(account, [
        Operation.liquidityPoolWithdraw({
          liquidityPoolId: liquidityPool.id,
          amount: sharesAmount,
          minAmountA: minReserveA.toFixed(7),
          minAmountB: minReserveB.toFixed(7)
        })
      ]);

      transaction.sign(accountKeypair);
      await server.submitTransaction(transaction);
      showToast('Withdraw successful', 'success');
    } catch (e) {
      showToast((e as Error).message, 'danger');
    } finally {
      isLoading = false;
    }
  }
</script>

<svelte:head>
  <title>Liquidity Pool</title>
</svelte:head>

<div class="flex flex-row gap-10 justify-center items-start">
  <Card className="w-[650px] flex flex-col gap-10">
    <Title tag="h2">Get Liquidity Pool ID</Title>
    <AssetsForm onGetId={handleGetLiquidityPoolId} onGetAssetTrust={handleGetAssetTrust} {assets} {isLoading} />

    {#if liquidityPoolId}
      <p>Result: {liquidityPoolId}</p>
    {/if}
  </Card>

  <Card className="w-[650px] flex flex-col gap-5">
    <SearchForm onSearchLiquidityPool={handleSearchLiquidityPool} {isLoading} />

    {#if liquidityPool}
      <LiquidityPool {liquidityPool} />
      <ParticipateRadio bind:group={participateAction} />

      <Label>
        Secret Key
        <input type="text" bind:value={secretKey} />
      </Label>

      {#if participateAction === 'deposit'}
        <DepositForm onDeposit={handleOnDeposit} {isLoading} />
      {:else}
        <WithdrawForm onWithdraw={handleWithdraw} {isLoading} />
      {/if}
    {/if}
  </Card>
</div>
