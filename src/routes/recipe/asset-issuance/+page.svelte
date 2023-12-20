<script lang="ts">
  import { Asset, Operation, Keypair } from 'stellar-sdk';

  import { Account } from '../../../services/stellar/Account';
  import AssetOutput from '../../../components/AssetOutput.svelte';
  import Input from '../../../components/Input.svelte';
  import Card from '../../../components/Card.svelte';
  import Button from '../../../components/Button.svelte';
  import Checkbox from '../../../components/Checkbox.svelte';
  import { server, buildTransaction } from '../../../services/stellar/utils';

  let assetCode = '';
  let accounts: Account[] = [];
  let balanceValue = 100;
  let isLoading = false;
  let shouldCreateDistributorAccount = true;
  let isClawbackEnabled = false;
  let isFrozenAsset = false;
  let shouldCreateHolders = true;
  let numberOfHolders = 0;
  let shouldBalanceBeEqualForAll = true;
  let status = '';

  async function prepare() {
    status = '';
    isLoading = true;

    try {
      accounts = [];
      const issuerAccount = await Account.create().fundWithFriendBot();
      const distributorAccount = await Account.create().fundWithFriendBot();

      const issuer = await server.loadAccount(issuerAccount.publicKey);
      let distributor = await server.loadAccount(distributorAccount.publicKey);
      status = 'Accounts created';

      const asset = new Asset(assetCode, issuer.accountId());

      const operations = [
        Operation.changeTrust({
          asset: asset
        }),
        Operation.payment({
          source: issuerAccount.publicKey,
          destination: distributor.accountId(),
          asset: asset,
          amount: '1000000'
        })
      ];

      const transaction = buildTransaction(distributor, operations);

      transaction.sign(Keypair.fromSecret(distributorAccount.secretKey));
      transaction.sign(Keypair.fromSecret(issuerAccount.secretKey));

      const result = await server.submitTransaction(transaction);

      if (!result) {
        status = 'Transaction failed';
      } else {
        accounts.push(issuerAccount, distributorAccount);
        accounts = accounts;

        status = 'Transaction successful';

        distributor = await server.loadAccount(distributorAccount.publicKey);

        const distributorCreatedAssetBalance = distributor.balances[0].balance;
        status = `Distributor balance is: ${distributorCreatedAssetBalance} ${assetCode}`;
      }
    } catch (error) {
      console.error('Error during preparation:', error);
      status = 'Failed to create accounts: ' + error;
    }

    isLoading = false;
  }

  function removeSpaces(inputValue: string) {
    return inputValue.replace(/\s/g, '');
  }
</script>

<div class="flex justify-center">
  <Card title="Inputs">
    <div class="flex flex-col">
      <label for="asset-code" class="block mb-2"
        >Asset Code <span class="text-red-500">*</span>
        <Input id="asset-code" bind:value={assetCode} maxlength={12} handleInput={removeSpaces} />
      </label>
      <Checkbox
        id="create-distributor-account"
        label="Create distributor account"
        bind:checked={shouldCreateDistributorAccount}
      />
      <Checkbox id="clawback-enabled" label="Clawback enabled" bind:checked={isClawbackEnabled} />
      <Checkbox id="frozen-asset" label="Frozen asset" bind:checked={isFrozenAsset} />
      <Checkbox id="create-holders" label="Create holders" bind:checked={shouldCreateHolders} />
      <div class="ml-4">
        <label for="number-of-holders">
          How many?<Input id="number-of-holders" type="number" bind:value={numberOfHolders} /></label
        >

        <Checkbox label="Equal balance for all" bind:checked={shouldBalanceBeEqualForAll} />
        <label for="balance-value" />
        <Input id="balance-value" type="number" bind:value={balanceValue} />
      </div>
      <div class="flex justify-center items-center">
        <Button
          id="prepare-button"
          label={isLoading ? 'Preparing...' : 'Prepare!'}
          onClick={prepare}
          disabled={isLoading}
        />
      </div>
      <textarea id="status" class="h-auto max-h-12 overflow-auto mt-4" bind:value={status} readonly />
    </div>
  </Card>

  <Card title="Output">
    {#each accounts as { publicKey, secretKey }, i (publicKey)}
      <div class="mt-4">
        <h2 class="text-lg font-bold mb-2">{i === 0 ? 'Issuer' : 'Distributor'}</h2>
        <label for="publicKey{i + 1}" class="block mb-2"
          >Public Key
          <AssetOutput id="publicKey{i + 1}" value={publicKey} />
        </label>
        <label for="secretKey{i + 1}" class="block">
          Secret Key
          <AssetOutput id="secretKey{i + 1}" value={secretKey} />
        </label>
      </div>
    {/each}
  </Card>
</div>
