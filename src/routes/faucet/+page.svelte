<script lang="ts">
  import { Asset, Keypair, Operation } from 'stellar-sdk';
  import Button from '../../components/salient/Button.svelte';
  import Card from '../../components/salient/Card.svelte';
  import { Account } from '../../services/stellar/Account';
  import { buildTransaction, server } from '../../services/stellar/utils';
  import { parseEntriesValues } from '../../utils';
  import { onMount } from 'svelte';

  interface IFaucet {
    code: string;
    issuer: string;
    secret: string;
    amount: string;
    destination: string;
  }

  let isNative: boolean;
  let payment: IFaucet = {
    code: '',
    issuer: '',
    secret: '',
    amount: '',
    destination: ''
  };

  function toggleIsNative() {
    isNative = !isNative;
  }

  async function handlePayment(e: any) {
    try {
      const formData = new FormData(e.target);
      const form = parseEntriesValues<IFaucet>(formData);
      const destinationAccount = new Account(Keypair.fromPublicKey(form.destination));
      const sourcePaymentAccount = new Account(Keypair.fromSecret(form.secret));

      const transaction = buildTransaction(await server.loadAccount(sourcePaymentAccount.publicKey), [
        Operation.payment({
          amount: form.amount,
          asset: isNative ? Asset.native() : new Asset(form.code, form.issuer),
          destination: destinationAccount.publicKey
        })
      ]);

      transaction.sign(Keypair.fromSecret(form.secret));
      await server.submitTransaction(transaction);

      alert('Payment sent');
    } catch (error) {
      alert(error);
    }
  }

  function handleShareLink() {
    const params = new URLSearchParams({ ...payment });
    window.history.pushState({}, '', `?${params.toString()}`);
    navigator.clipboard.writeText(`?${params.toString()}`);
  }

  onMount(() => {
    const params = new URLSearchParams(window.location.search);
    payment = parseEntriesValues(params);
  });
</script>

<Card className="max-w-[650px] m-auto">
  <form class="flex flex-col gap-5 items-center" on:submit|preventDefault={handlePayment}>
    <div class="w-full">
      <div class="mb-4">
        <h3 class="text-lg">Asset</h3>
        <Button onClick={toggleIsNative} color={isNative ? 'blue' : 'white'} className="h-8">Native</Button>
      </div>

      {#if !isNative}
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

    <Button type="submit" className="w-full">Fond</Button>
  </form>

  <Button type="button" onClick={handleShareLink} className="mt-5">Share Link</Button>
</Card>
