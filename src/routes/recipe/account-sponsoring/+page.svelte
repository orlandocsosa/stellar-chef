<script lang="ts">
  import { Operation, Keypair, Asset } from 'stellar-sdk';
  import { buildTransaction, submitTransaction, server } from '../../../services/stellar/utils';
  import { Account } from '../../../services/stellar/Account';

  import Card from '../../../components/Card.svelte';
  import Input from '../../../components/Input.svelte';
  import Button from '../../../components/Button.svelte';
  import Status from '../../../components/Status.svelte';

  let sponsorSecretKey = '';
  let sponsoreeSecretKey = '';
  let status = '';
  let isLoading = false;

  async function createAccounts() {
    isLoading = true;
    sponsorSecretKey = '';
    sponsoreeSecretKey = '';
    status = 'Creating accounts...';

    try {
      let sponsorAccount;
      let sponsoreeAccount;

      sponsorAccount = Account.create();
      sponsoreeAccount = Account.create();

      await sponsorAccount.fundWithFriendBot();
      await sponsoreeAccount.fundWithFriendBot();

      sponsorSecretKey = sponsorAccount.secretKey;
      sponsoreeSecretKey = sponsoreeAccount.secretKey;
      status = 'Accounts created';
    } catch (error) {
      status = `Error creating accounts: ${error}`;
    } finally {
      isLoading = false;
    }
  }
  async function performSponsorAccount() {
    isLoading = true;
    status = 'Sponsoring account...';
    try {
      const sponsorKeypair = Keypair.fromSecret(sponsorSecretKey);
      const sponsoreeKeypair = Keypair.fromSecret(sponsoreeSecretKey);

      const sponsorAccount = await server.loadAccount(sponsorKeypair.publicKey());
      const sponsoreeAccount = await server.loadAccount(sponsoreeKeypair.publicKey());

      status = 'Building operations...';
      const operations = [
        Operation.beginSponsoringFutureReserves({
          sponsoredId: sponsoreeAccount.accountId()
        }),
        Operation.changeTrust({
          source: sponsoreeAccount.accountId(),
          asset: new Asset('USD', sponsorKeypair.publicKey()),
          limit: '1000'
        }),
        Operation.endSponsoringFutureReserves({
          source: sponsoreeAccount.accountId()
        })
      ];

      const transaction = buildTransaction(sponsorAccount, operations);

      transaction.sign(sponsorKeypair);
      transaction.sign(sponsoreeKeypair);

      const result = await submitTransaction(transaction);
      if (result.successful) {
        status = 'Sponsorship operation successful';
        isLoading = false;
      }
    } catch (error) {
      status = 'Error performing sponsorship operation';
      isLoading = false;
    }
  }
</script>

<div class="flex justify-center">
  <Card title="Sponsor Account">
    <form class="flex flex-col items-center" on:submit|preventDefault={performSponsorAccount}>
      Enter sponsor secret key
      <Input bind:value={sponsorSecretKey} disabled={isLoading} required />
      Enter sponsoree secret key
      <Input bind:value={sponsoreeSecretKey} disabled={isLoading} required />
      <div class="flex justify-center w-full" />

      <div class="flex justify-center w-full">
        <Button label="Create Accounts" onClick={createAccounts} disabled={isLoading} />
      </div>
      <div class="flex justify-center w-full">
        <Button label="Sponsor" on:click={performSponsorAccount} disabled={isLoading} />
      </div>
    </form>
    <div class="flex justify-center w-full">
      <Status {status} />
    </div>
  </Card>
</div>
