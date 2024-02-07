<script lang="ts">
  import { Keypair, Operation } from 'stellar-sdk';
  import { buildTransaction, submitTransaction, server } from '../../../services/stellar/utils';
  import { Account } from '../../../services/stellar/Account';

  import { createSandwichTransaction } from '../../../services/stellar/transactions/createSandwichTransaction';
  import Card from '../../../components/Card.svelte';
  import CopyButton from '../../../components/CopyButton.svelte';
  import Input from '../../../components/Input.svelte';
  import Button from '../../../components/Button.svelte';
  import Status from '../../../components/Status.svelte';
  import Switch from '../../../components/Switch.svelte';
  import { sponsoringForms } from '../../../utils/sponsoringForms';

  let sponsorPublicKey = '';
  let sponsorSecretKey = '';
  let sponsoreePublicKey = '';
  let sponsoreeSecretKey = '';
  let status = '';
  let transactionHash = '';
  let isTransactionSuccessful = false;
  let isLoading = false;
  let shouldFoundSponsor = true;
  let shouldFoundSponsoree = true;
  let accountsStatus = '';
  let selectedForm = sponsoringForms[0];

  async function createAccounts() {
    isTransactionSuccessful = false;
    isLoading = true;
    sponsorPublicKey = '';
    sponsoreePublicKey = '';
    sponsorSecretKey = '';
    sponsoreeSecretKey = '';
    accountsStatus = '';
    try {
      let sponsorAccount = await Account.create();
      let sponsoreeAccount = await Account.create();

      if (shouldFoundSponsor) {
        accountsStatus = 'Funding sponsor account...';
        sponsorAccount = await sponsorAccount.fundWithFriendBot();
      }

      if (shouldFoundSponsoree) {
        accountsStatus = 'Funding sponsoree account...';
        sponsoreeAccount = await sponsoreeAccount.fundWithFriendBot();
      }

      ({ publicKey: sponsorPublicKey, secretKey: sponsorSecretKey } = sponsorAccount);
      ({ publicKey: sponsoreePublicKey, secretKey: sponsoreeSecretKey } = sponsoreeAccount);
      accountsStatus = 'Accounts created successfully!';
    } catch (error) {
      status = `Error creating accounts: ${error}`;
    } finally {
      isLoading = false;
    }
  }

  async function onSubmit(event: Event) {
    status = '';
    isTransactionSuccessful = false;
    isLoading = true;
    status = 'Performing sponsorship recipe...';
    try {
      const sponsoredOperation = selectedForm.operation(new FormData(event.target as HTMLFormElement));
      const sponsorKeypair = Keypair.fromSecret(sponsorSecretKey);
      const sponsoreeKeypair = Keypair.fromSecret(sponsoreeSecretKey);

      const transaction = await createSandwichTransaction(sponsoredOperation, sponsoreeKeypair, sponsorKeypair);
      const result = await submitTransaction(transaction);

      isTransactionSuccessful = true;
      transactionHash = result.hash;
      status = 'Transaction successful!';
      isLoading = false;
    } catch (error) {
      console.error(error);
      status = `Error: ${error}`;
      isLoading = false;
    }
  }
  const isValidKey = (key: string) => key && key.length === 56;
</script>

<div class="flex justify-center items-start">
  <Card title="Create Accounts">
    <form class="flex flex-col items-center" on:submit|preventDefault={createAccounts}>
      <div>
        <h2 class="font-bold">Sponsor Account</h2>
        <div class="flex justify-between items-center">
          <span class={shouldFoundSponsor ? 'text-green-500 font-bold' : ''}>Found Sponsor</span>
          <Switch bind:checked={shouldFoundSponsor} disabled={isLoading} />
        </div>
        Public key {#if isValidKey(sponsorPublicKey)}
          <CopyButton textToCopy={sponsorPublicKey} />
        {/if}
        <Input bind:value={sponsorPublicKey} disabled={isLoading} required />

        Secret key {#if isValidKey(sponsorSecretKey)}
          <CopyButton textToCopy={sponsorSecretKey} />
        {/if}
        <Input bind:value={sponsorSecretKey} disabled={isLoading} required />
      </div>
      <div>
        <h2 class="font-bold">Sponsoree Account</h2>
        <div class="flex justify-between items-center">
          <span class={shouldFoundSponsoree ? 'text-green-500 font-bold' : ''}>Found Sponsoree</span>
          <Switch bind:checked={shouldFoundSponsoree} disabled={isLoading} />
        </div>
        Public key {#if isValidKey(sponsoreePublicKey)}
          <CopyButton textToCopy={sponsoreePublicKey} />
        {/if}
        <Input bind:value={sponsoreePublicKey} disabled={isLoading} required />

        Secret key{#if isValidKey(sponsoreeSecretKey)}
          <CopyButton textToCopy={sponsoreeSecretKey} />
        {/if}
        <Input bind:value={sponsoreeSecretKey} disabled={isLoading} required />
      </div>
      <div class="flex justify-center w-full">
        <Button label="Create Accounts" onClick={createAccounts} disabled={isLoading} />
      </div>
    </form>
    <p>{accountsStatus}</p>
  </Card>
  <Card title="Sponsor Recipe">
    <select bind:value={selectedForm} class="w-full p-2 border border-gray-300 rounded" disabled={isLoading}>
      {#each sponsoringForms as form}
        <option value={form}>{form.type}</option>
      {/each}
    </select>

    {#if selectedForm}
      <svelte:component this={selectedForm.component} {onSubmit} {sponsorPublicKey} {sponsoreePublicKey} {isLoading} />
    {/if}
    <div class="flex justify-center w-full">
      <Status {status} {isTransactionSuccessful} {transactionHash} />
    </div>
  </Card>
</div>
