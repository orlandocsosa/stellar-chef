<script lang="ts">
  import { Account } from '../../../services/stellar/Account';
  import Input from '../../../components/Input.svelte';
  import Card from '../../../components/Card.svelte';
  import Button from '../../../components/Button.svelte';
  import Checkbox from '../../../components/Checkbox.svelte';
  import NumberInput from '../../../components/NumberInput.svelte';

  let assetCode = '';
  let accounts: Account[] = [];
  let shouldCreateDistributorAccount = true;
  let isClawbackEnabled = false;
  let isFrozenAsset = false;
  let shouldCreateHolders = true;
  let numberOfHolders = 0;
  let shouldBalanceBeEqualForAll = true;
  let balanceValue = 100;

  async function prepare() {
    accounts = [];
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
    <div class="flex flex-col">
      <Input id="asset-code" label="Asset Code" bind:value={assetCode} />
      <Checkbox
        id="create-distributor-account"
        label="Create distributor account"
        bind:checked={shouldCreateDistributorAccount}
      />
      <Checkbox id="clawback-enabled" label="Clawback enabled" bind:checked={isClawbackEnabled} />
      <Checkbox id="frozen-asset" label="Frozen asset" bind:checked={isFrozenAsset} />
      <Checkbox id="create-holders" label="Create holders" bind:checked={shouldCreateHolders} />
      <div class="ml-4">
        <NumberInput id="number-of-holders" label="How many?" bind:value={numberOfHolders} />
        <Checkbox label="Equal balance for all" bind:checked={shouldBalanceBeEqualForAll} />
        <NumberInput id="balance-value" bind:value={balanceValue} />
      </div>
      <div class="flex justify-center items-center">
        <Button id="prepare-button" label="Prepare !" onClick={prepare} />
      </div>
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
