<script lang="ts">
  import { Keypair } from 'stellar-sdk';
  import { submitTransaction } from '../../../services/stellar/utils';
  import { Account } from '../../../services/stellar/Account';

  import { createSandwichTransaction } from '../../../services/stellar/transactions/createSandwichTransaction';
  import Card from '../../../components/Card.svelte';
  import Input from '../../../components/Input.svelte';
  import Button from '../../../components/Button.svelte';
  import Status from '../../../components/Status.svelte';
  import Switch from '../../../components/Switch.svelte';
  import { sponsoringForms } from '../../../utils/sponsoringForms';

  let sponsorPublicKey = '';
  let sponsorSecretKey = '';
  let sponsoredPublicKey = '';
  let sponsoredSecretKey = '';
  let status = '';
  let transactionHash = '';
  let isTransactionSuccessful = false;
  let isLoading = false;
  let shouldFoundSponsor = true;
  let shouldFoundSponsored = true;
  let accountsStatus = '';
  let selectedForm = sponsoringForms[0];

  async function createAccounts() {
    isTransactionSuccessful = false;
    isLoading = true;
    sponsorPublicKey = '';
    sponsoredPublicKey = '';
    sponsorSecretKey = '';
    sponsoredSecretKey = '';
    accountsStatus = '';
    try {
      let sponsorAccount = Account.create();
      let sponsoredAccount = Account.create();

      if (shouldFoundSponsor) {
        accountsStatus = 'Funding sponsor account...';
        sponsorAccount = await sponsorAccount.fundWithFriendBot();
      }

      if (shouldFoundSponsored) {
        accountsStatus = 'Funding sponsored account...';
        sponsoredAccount = await sponsoredAccount.fundWithFriendBot();
      }

      ({ publicKey: sponsorPublicKey, secretKey: sponsorSecretKey } = sponsorAccount);
      ({ publicKey: sponsoredPublicKey, secretKey: sponsoredSecretKey } = sponsoredAccount);
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
      const sponsoredKeypair = Keypair.fromSecret(sponsoredSecretKey);
      const transaction = await createSandwichTransaction(sponsoredOperation, sponsoredKeypair, sponsorKeypair);
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
        Public key
        <Input bind:value={sponsorPublicKey} disabled={isLoading} required />

        Secret key
        <Input bind:value={sponsorSecretKey} disabled={isLoading} required />
      </div>
      <div>
        <h2 class="font-bold">Sponsored Account</h2>
        <div class="flex justify-between items-center">
          <span class={shouldFoundSponsored ? 'text-green-500 font-bold' : ''}>Found Sponsored</span>
          <Switch bind:checked={shouldFoundSponsored} disabled={isLoading} />
        </div>
        Public key
        <Input bind:value={sponsoredPublicKey} disabled={isLoading} required />

        Secret key
        <Input bind:value={sponsoredSecretKey} disabled={isLoading} required />
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
      <svelte:component this={selectedForm.component} {onSubmit} {sponsorPublicKey} {sponsoredPublicKey} {isLoading} />
    {/if}
    <div class="flex justify-center w-full">
      <Status {status} {isTransactionSuccessful} {transactionHash} />
    </div>
  </Card>
</div>
