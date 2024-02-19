<script lang="ts">
  import { Asset, Keypair, Operation } from 'stellar-sdk';
  import Button from '../../components/Button.svelte';
  import Card from '../../components/Card.svelte';
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

  let payment: IFaucet = {
    code: '',
    issuer: '',
    secret: '',
    amount: '',
    destination: ''
  };

  async function handlePayment(e: any) {
    try {
      const formData = new FormData(e.target);
      const form = parseEntriesValues<IFaucet>(formData);
      const destinationAccount = new Account(Keypair.fromPublicKey(form.destination));
      const sourcePaymentAccount = new Account(Keypair.fromSecret(form.secret));

      const transaction = buildTransaction(await server.loadAccount(sourcePaymentAccount.publicKey), [
        Operation.payment({
          amount: form.amount,
          asset: new Asset(form.code, form.issuer),
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

<Card title="Faucet">
  <form class="flex flex-col gap-5 items-center" on:submit|preventDefault={handlePayment}>
    <label class="flex flex-col w-full">
      Asset Code
      <input name="code" type="text" bind:value={payment.code} />
    </label>

    <label class="flex flex-col w-full">
      Asset Issuer
      <input name="issuer" type="text" bind:value={payment.issuer} />
    </label>

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

    <Button label="Faucet" />
  </form>
</Card>

<button on:click={handleShareLink}>Share Link</button>
