<script lang="ts">
  import { Asset, Operation, Claimant as StellarClaimant, Keypair, Horizon } from 'stellar-sdk';
  import AssetService from '../../../services/asset/Asset';
  import Card from '../../../components/base/Card.svelte';
  import Claimant from '../../../components/claimable-balance/Claimant.svelte';
  import createPredicate from '../../../services/stellar/predicateFactory';
  import { claimants } from '../../../store/claimants';
  import { buildTransaction, findClaimableBalance, server, submitTransaction } from '../../../services/stellar/utils';
  import CheckClaimableBalance from '../../../components/claimable-balance/CheckClaimableBalance.svelte';
  import ClaimBalance from '../../../components/claimable-balance/ClaimBalance.svelte';
  import ClaimableBalancesRecords from '../../../components/claimable-balance/ClaimableBalancesRecords.svelte';
  import CreateClaimableBalance from '../../../components/claimable-balance/CreateClaimableBalance.svelte';
  import { parseEntriesValues } from '../../../utils';
  import type { ICreateClaimableBalanceRequest } from '../../../services/stellar/types';
  import useUserAsset from '../../../composables/useUserAsset';
  import useToast from '../../../composables/useToast';

  const assetsService = new AssetService();
  const assets = assetsService.getAll();
  const { code, getAsset, isNative, issuer, selectedAsset } = useUserAsset(assets);
  const { showToast, toggleLoadingToast } = useToast();

  let findClaimableBalancePublicKey: string;
  let findClaimableBalanceSecretKey: string;
  let balanceId: string;
  let claimableBalances: Horizon.ServerApi.ClaimableBalanceRecord[] = [];

  function removeClaimant(index: number) {
    $claimants = $claimants.filter((_, i) => i !== index);
  }

  async function handleFindClaimableBalances() {
    toggleLoadingToast(true, 'Finding claimable balances...');
    claimableBalances = await findClaimableBalance(findClaimableBalancePublicKey);
    toggleLoadingToast(false);
    showToast(`Found ${claimableBalances.length} claimable balances`, 'success');
  }

  async function handleClaimClaimableBalance() {
    toggleLoadingToast(true, 'Claiming claimable balance...');

    try {
      const operation = Operation.claimClaimableBalance({
        balanceId
      });
      const keypair = Keypair.fromSecret(findClaimableBalanceSecretKey);
      const transaction = buildTransaction(await server.loadAccount(keypair.publicKey()), [operation]);

      transaction.sign(keypair);
      const result = await submitTransaction(transaction);
      toggleLoadingToast(false);
      showToast(`Transaction ${result.successful ? 'successfully' : 'failed'}`, 'success');
    } catch (error) {
      toggleLoadingToast(false);
      showToast(`${error}`, 'danger');
    }
  }

  async function handleCreateClaimableBalance(e: SubmitEvent & { currentTarget: EventTarget & HTMLFormElement }) {
    toggleLoadingToast(true, 'Creating claimable balance...');

    try {
      const formData = new FormData(e.currentTarget);
      const { amount, secret } = parseEntriesValues<ICreateClaimableBalanceRequest>(formData);
      const keypair = Keypair.fromSecret(secret);

      const operation = Operation.createClaimableBalance({
        amount,
        asset: getAsset(),
        claimants: $claimants.map(
          (claimant) => new StellarClaimant(claimant.destination, createPredicate(claimant.predicate))
        )
      });

      const transaction = buildTransaction(await server.loadAccount(keypair.publicKey()), [operation]);
      transaction.sign(keypair);

      const result = await submitTransaction(transaction);
      toggleLoadingToast(false);
      showToast(`Transaction ${result.successful ? 'successfully' : 'failed'}`, 'success');
    } catch (error) {
      toggleLoadingToast(false);
      showToast(`${error}`, 'danger');
    }
  }
</script>

<svelte:head>
  <title>Claimable Balance</title>
</svelte:head>

<div class="flex justify-center">
  <div class="grid grid-cols-2 gap-10 max-lg:grid-cols-1">
    <form on:submit|preventDefault={handleCreateClaimableBalance}>
      <CreateClaimableBalance
        bind:isNative={$isNative}
        bind:code={$code}
        bind:issuer={$issuer}
        bind:selectedAsset={$selectedAsset}
        {assets}
      />

      {#each $claimants as claimant, i}
        <Card className="mt-5">
          <Claimant {claimant} index={i} onRemoveClaimant={() => removeClaimant(i)} />
        </Card>
      {/each}
    </form>

    <div class="flex flex-col gap-10">
      <CheckClaimableBalance bind:publicKey={findClaimableBalancePublicKey} onClick={handleFindClaimableBalances} />

      <ClaimBalance
        bind:balanceId
        bind:secretKey={findClaimableBalanceSecretKey}
        onClick={handleClaimClaimableBalance}
      />

      {#if claimableBalances.length}
        <ClaimableBalancesRecords {claimableBalances} />
      {/if}
    </div>
  </div>
</div>
