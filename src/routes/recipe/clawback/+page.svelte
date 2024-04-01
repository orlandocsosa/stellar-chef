<script lang="ts">
  import { Keypair, Operation } from 'stellar-sdk';
  import Label from '../../../components/Label.svelte';
  import LoadingSpinner from '../../../components/LoadingSpinner.svelte';
  import Span from '../../../components/Span.svelte';
  import AssetSelector from '../../../components/asset-selector/AssetSelector.svelte';
  import Button from '../../../components/salient/Button.svelte';
  import Card from '../../../components/salient/Card.svelte';
  import Title from '../../../components/salient/Title.svelte';
  import useToast from '../../../composables/useToast';
  import useUserAsset from '../../../composables/useUserAsset';
  import AssetService from '../../../services/asset/Asset';
  import { parseEntriesValues } from '../../../utils';
  import { buildTransaction, getAccountBalances, server, submitTransaction } from '../../../services/stellar/utils';

  interface IClawbackForm {
    secret: string;
    account: string;
    amount: string;
  }

  const assetService = new AssetService();
  const assets = assetService.getAll();
  const { code, getAsset, issuer, selectedAsset } = useUserAsset(assets);
  const { showToast } = useToast();
  let isClawbackAllChecked = true;
  let isLoading = false;

  async function handleOnSubmit(e: Event) {
    isLoading = true;

    try {
      const asset = getAsset();
      const formData = new FormData(e.target as HTMLFormElement);
      const { account: accountId, amount: formAmount, secret } = parseEntriesValues<IClawbackForm>(formData);
      const account = await server.loadAccount(accountId);
      const issuerAccount = await server.loadAccount(asset.issuer);
      const balance = await getAccountBalances(account, asset);
      let amount = '';

      if (isClawbackAllChecked) {
        if (!Array.isArray(balance)) amount = balance.balance;
      } else {
        amount = formAmount;
      }

      if (parseFloat(amount) <= 0) {
        showToast(`Amount must be greater than 0`, 'danger');
        return;
      }

      const clawbackOp = Operation.clawback({
        asset,
        from: account.accountId(),
        amount
      });

      const transaction = buildTransaction(issuerAccount, [clawbackOp]);
      transaction.sign(Keypair.fromSecret(secret));

      await submitTransaction(transaction);
      showToast('Transaction submitted', 'success');
    } catch (e) {
      showToast(`Something went wrong: ${e}`, 'danger');
    } finally {
      isLoading = false;
    }
  }
</script>

<Card className="flex flex-col m-auto w-[650px]">
  <Title>Clawback</Title>

  <form class="flex flex-col gap-3" on:submit|preventDefault={handleOnSubmit}>
    <div class="flex flex-row gap-3 items-center">
      <Title tag="h3">Asset</Title>
      <AssetSelector {assets} bind:value={$selectedAsset} />
    </div>

    {#if $selectedAsset === null}
      <Label>
        <Span>Code</Span>
        <input type="text" bind:value={$code} />
      </Label>

      <Label>
        <Span>Issuer</Span>
        <input type="text" bind:value={$issuer} />
      </Label>
    {/if}

    <Label>
      Issuer Secret
      <input type="text" name="secret" value={$selectedAsset !== null ? assets[$selectedAsset].issuerSecret : ''} />
    </Label>

    <Label>
      Clawback Account
      <input type="text" name="account" />
    </Label>

    <div class="mt-5">
      <label>
        <input type="checkbox" name="all" bind:checked={isClawbackAllChecked} />
        Clawback All
      </label>

      {#if !isClawbackAllChecked}
        <Label>
          Amount
          <input type="text" name="amount" />
        </Label>
      {/if}
    </div>

    <Button type="submit" className="mt-8 h-10 w-full">
      {#if isLoading}
        <div class="w-8"><LoadingSpinner /></div>
      {:else}
        Perform clawback
      {/if}
    </Button>
  </form>
</Card>
