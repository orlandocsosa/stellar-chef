<script lang="ts">
  import { Operation, Keypair, Asset, Claimant } from 'stellar-sdk';
  import { buildTransaction, submitTransaction, server } from '../../../services/stellar/utils';
  import { Account } from '../../../services/stellar/Account';

  import Card from '../../../components/Card.svelte';
  import CopyButton from '../../../components/CopyButton.svelte';
  import Input from '../../../components/Input.svelte';
  import Button from '../../../components/Button.svelte';
  import Status from '../../../components/Status.svelte';
  import Switch from '../../../components/Switch.svelte';

  let sponsorPublicKey = '';
  let sponsorSecretKey = '';
  let sponsoreePublicKey = '';
  let sponsoreeSecretKey = '';
  let status = '';
  let transactionHash = '';
  let isTransactionSuccessful = false;
  let isLoading = false;
  let shouldFoundSponsor = false;
  let shouldFoundSponsoree = false;
  let accountsStatus = '';

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

  async function performAccountSponsorship() {
    try {
      isTransactionSuccessful = false;
      isLoading = true;
      status = 'Sponsoring account...';
      const sponsorKeypair = Keypair.fromSecret(sponsorSecretKey);
      const sponsorAccount = await server.loadAccount(sponsorKeypair.publicKey());

      const sponsoreeKeypair = Keypair.fromSecret(sponsoreeSecretKey);
      let sponsoreeAccount;
      try {
        sponsoreeAccount = await server.loadAccount(sponsoreeKeypair.publicKey());
      } catch (error) {
        status = 'Sponsoring account...';
        const operations = [
          Operation.beginSponsoringFutureReserves({ sponsoredId: sponsoreeKeypair.publicKey() }),
          Operation.createAccount({ destination: sponsoreeKeypair.publicKey(), startingBalance: '0' }),
          Operation.endSponsoringFutureReserves({ source: sponsoreeKeypair.publicKey() })
        ];

        const transaction = buildTransaction(sponsorAccount, operations);

        transaction.sign(sponsorKeypair);
        transaction.sign(sponsoreeKeypair);

        const result = await submitTransaction(transaction);
        if (result) {
          status = 'Transaction successful, account creation sponsored';
          isTransactionSuccessful = true;
          transactionHash = result.hash;
          isLoading = false;
        }
      }
    } catch (error) {
      status = `Error sponsoring account: ${error}`;
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
    <form class="flex flex-col items-center" on:submit|preventDefault={performAccountSponsorship}>
      <div class="flex justify-center w-full">
        <Button label="Perform Sponsorship" disabled={isLoading} />
      </div>
    </form>
    <div class="flex justify-center w-full">
      <Status {status} {isTransactionSuccessful} {transactionHash} />
    </div>
  </Card>
</div>
