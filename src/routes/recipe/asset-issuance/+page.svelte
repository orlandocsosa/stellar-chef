<script lang="ts">
  import { Account } from '../../../services/stellar/Account';
  import Input from '../../../components/Input.svelte';
  import Card from '../../../components/Card.svelte';
  import Button from '../../../components/Button.svelte';
  let assetCode = '';
  let accounts: Account[] = [];

  async function prepare() {
    accounts = []; // Clear the accounts
    const account1 = await Account.create();
    const account2 = await Account.create();
    accounts = [account1, account2];
  }

  $: accountFields = accounts.map((account) => ({
    publicKey: account.publicKey,
    secretKey: account.secretKey
  }));
</script>

<div class="flex justify-center">
  <Card title="Inputs">
    <Input id="asset-code" label="Asset Code" bind:value={assetCode} />
    <div class="flex justify-center items-center">
      <button
        class="bg-white hover:bg-gray-200 text-black py-2 px-4 border border-black w-full mx-2"
        on:click={prepare}
        style="box-shadow: 3px 3px 0px 0px black;"
      >
        Prepare!
      </button>
    </div>
  </Card>

  <Card title="Output">
    {#each accountFields as { publicKey, secretKey }, i (publicKey)}
      <div class="mt-4">
        <h2 class="text-lg font-bold mb-2">Account {i + 1}</h2>
        <Input id="publicKey" label="Public Key" value={publicKey} readonly />
        <Input id="secretKey" label="Secret Key" value={secretKey} readonly />
      </div>
    {/each}
  </Card>
</div>
