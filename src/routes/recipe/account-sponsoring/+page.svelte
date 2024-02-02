<script lang="ts">
  import { Operation, Keypair, Asset, Claimant } from 'stellar-sdk';
  import { buildTransaction, submitTransaction, server } from '../../../services/stellar/utils';
  import { Account } from '../../../services/stellar/Account';

  import Card from '../../../components/Card.svelte';
  import CopyButton from '../../../components/CopyButton.svelte';
  import Input from '../../../components/Input.svelte';
  import Button from '../../../components/Button.svelte';
  import Status from '../../../components/Status.svelte';

  let sponsorPublicKey = '';
  let sponsorSecretKey = '';
  let sponsoreePublicKey = '';
  let sponsoreeSecretKey = '';
  let status = '';
  let transactionHash = '';
  let isTransactionSuccessful = false;
  let isLoading = false;

  async function createAccounts() {
    isTransactionSuccessful = false;
    isLoading = true;
    sponsorSecretKey = '';
    sponsoreeSecretKey = '';
    status = 'Creating accounts...';

    try {
      const sponsorAccount = await Account.create();
      const sponsoreeAccount = await Account.create();

      await sponsorAccount.fundWithFriendBot();

      ({ publicKey: sponsorPublicKey, secretKey: sponsorSecretKey } = sponsorAccount);
      ({ publicKey: sponsoreePublicKey, secretKey: sponsoreeSecretKey } = sponsoreeAccount);

      status = 'Accounts created';
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
        }
      }
    } catch (error) {
      status = `Error sponsoring account: ${error}`;
      isLoading = false;
    }
  }

  const isValidKey = (key: string) => key && key.length === 56;
</script>

<div class="flex justify-center">
  <Card title="Sponsor Account">
    <form class="flex flex-col items-center" on:submit|preventDefault={performAccountSponsorship}>
      <div>
        <h2 class="font-bold">Sponsor Account</h2>
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
      <div class="flex justify-center w-full">
        <Button label="Sponsor" onClick={performAccountSponsorship} disabled={isLoading} />
      </div>
    </form>
    <div class="flex justify-center w-full">
      <Status {status} {isTransactionSuccessful} {transactionHash} />
    </div>
  </Card>
</div>
