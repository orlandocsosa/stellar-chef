<script lang="ts">
  import { Asset, Keypair, Operation } from 'stellar-sdk';
  import Button from '../../components/base/Button.svelte';
  import Card from '../../components/base/Card.svelte';
  import { Account } from '../../services/stellar/Account';
  import { buildTransaction, server, submitTransaction } from '../../services/stellar/utils';
  import { parseEntriesValues } from '../../utils';
  import { onMount } from 'svelte';
  import useToast from '../../composables/useToast';
  import useUserAsset from '../../composables/useUserAsset';
  import AssetService from '../../services/asset/Asset';
  import NativeAssetCheckbox from '../../components/asset-selector/NativeAssetCheckbox.svelte';
  import AssetSelector from '../../components/asset-selector/AssetSelector.svelte';

  interface IFaucet {
    code: string;
    issuer: string;
    secret: string;
    amount: string;
    destination: string;
  }

  const assetService = new AssetService();
  const assets = assetService.getAll();
  const { showToast, toggleLoadingToast } = useToast();
  const { getAsset, isNative, selectedAsset } = useUserAsset(assets);

  let payment: IFaucet = {
    code: '',
    issuer: '',
    secret: '',
    amount: '',
    destination: ''
  };

  async function handlePayment(e: any) {
    toggleLoadingToast(true, 'Sending payment...');

    try {
      const formData = new FormData(e.target);
      const form = parseEntriesValues<IFaucet>(formData);
      const destinationAccount = new Account(Keypair.fromPublicKey(form.destination));
      const sourcePaymentAccount = new Account(Keypair.fromSecret(form.secret));

      const transaction = buildTransaction(await server.loadAccount(sourcePaymentAccount.publicKey), [
        Operation.payment({
          amount: form.amount,
          asset: getAsset(),
          destination: destinationAccount.publicKey
        })
      ]);

      transaction.sign(Keypair.fromSecret(form.secret));
      await submitTransaction(transaction);

      toggleLoadingToast(false);
      showToast('Payment sent', 'success');
    } catch (error) {
      toggleLoadingToast(false);
      showToast(`Error: ${error}`, 'danger');
    }
  }

  function handleShareLink() {
    const params = new URLSearchParams({ ...payment });
    window.history.pushState({}, '', `?${params.toString()}`);
    navigator.clipboard.writeText(window.location.href);
  }

  onMount(() => {
    const params = new URLSearchParams(window.location.search);
    payment = parseEntriesValues(params);
  });

  $: if ($selectedAsset !== null) {
    payment.code = assets[$selectedAsset].code;
    payment.issuer = assets[$selectedAsset].issuer;
    payment.secret = assets[$selectedAsset].issuerSecret;
  }
</script>

<svelte:head>
  <title>Faucet</title>
</svelte:head>

<Card className="max-w-[650px] m-auto">
  <form class="flex flex-col gap-5 items-center" on:submit|preventDefault={handlePayment}>
    <div class="w-full">
      <div class="mb-4 flex flex-row items-center gap-3">
        <h3 class="text-lg">Asset</h3>
        <NativeAssetCheckbox bind:checked={$isNative} />
        <AssetSelector {assets} bind:value={$selectedAsset} />
      </div>

      {#if !$isNative}
        <label class="flex flex-col w-full">
          <p class="text-sm text-gray-600">Code</p>
          <input name="code" type="text" bind:value={payment.code} />
        </label>

        <label class="flex flex-col w-full">
          <p class="text-sm text-gray-600">Issuer</p>
          <input name="issuer" type="text" bind:value={payment.issuer} />
        </label>
      {/if}
    </div>

    <label class="flex flex-col w-full">
      Secret Key
      <input name="secret" type="text" bind:value={payment.secret} />
    </label>

    <label class="flex flex-col w-full">
      Amount
      <input name="amount" type="number" bind:value={payment.amount} />
    </label>

    <label class="flex flex-col w-full">
      Destination
      <input name="destination" type="text" bind:value={payment.destination} />
    </label>

    <Button type="submit" className="w-full">Send payment</Button>
  </form>

  <Button type="button" onClick={handleShareLink} className="mt-5">Create shareable link</Button>
</Card>
