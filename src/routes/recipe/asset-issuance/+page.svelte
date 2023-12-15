<script lang="ts">
  import { Asset, Networks, TransactionBuilder, Operation, Keypair } from 'stellar-sdk';

  import { Account } from '../../../services/stellar/Account';
  import AssetInput from '../../../components/AssetInput.svelte';
  import Input from '../../../components/Input.svelte';
  import Card from '../../../components/Card.svelte';
  import Button from '../../../components/Button.svelte';
  import Checkbox from '../../../components/Checkbox.svelte';
  import NumberInput from '../../../components/NumberInput.svelte';
  import { server } from '../../../services/stellar/utils';

  let assetCode = '';
  let accounts: Account[] = [];
  let balanceValue = 100;
  let shouldCreateDistributorAccount = true;
  let isClawbackEnabled = false;
  let isFrozenAsset = false;
  let shouldCreateHolders = true;
  let numberOfHolders = 0;
  let shouldBalanceBeEqualForAll = true;

  async function createAndFundAccount() {
    const account = await Account.create();
    await account.fundWithFriendBot();
    return account;
  }

  async function prepare() {
    try {
      accounts = [];
      const account1 = await createAndFundAccount();
      const account2 = await createAndFundAccount();
      accounts = [account1, account2];

      const issuer = await server.loadAccount(account1.publicKey);
      const distributor = await server.loadAccount(account2.publicKey);

      const asset = new Asset(assetCode, issuer.accountId());

      const trustTransaction = new TransactionBuilder(distributor, {
        fee: (await server.fetchBaseFee()).toString(),
        networkPassphrase: Networks.TESTNET
      })
        .addOperation(
          Operation.changeTrust({
            asset: asset
          })
        )
        .setTimeout(30)
        .build();

      trustTransaction.sign(Keypair.fromSecret(account2.secretKey));
      const trustResult = await server.submitTransaction(trustTransaction);
      console.log('Trust transaction succeeded:', trustResult);

      const paymentTransaction = new TransactionBuilder(issuer, {
        fee: (await server.fetchBaseFee()).toString(),
        networkPassphrase: Networks.TESTNET
      })
        .addOperation(
          Operation.payment({
            destination: distributor.accountId(),
            asset: asset,
            amount: '1000000'
          })
        )
        .setTimeout(30)
        .build();

      paymentTransaction.sign(Keypair.fromSecret(account1.secretKey));
      const paymentResult = await server.submitTransaction(paymentTransaction);
      console.log('Payment transaction succeeded:', paymentResult);

      const updatedDistributor = await server.loadAccount(account2.publicKey);
      console.log('Updated distributor balances:', updatedDistributor.balances);
    } catch (error) {
      if (error instanceof Error) {
        console.error('Failed to create accounts: ' + error.message);
      } else {
        console.error('Failed to create accounts: An unknown error occurred');
      }
    }
  }

  $: accountFields = accounts.map((account) => ({
    publicKey: account.publicKey,
    secretKey: account.secretKey
  }));
</script>

<div class="flex justify-center">
  <Card title="Inputs">
    <div class="flex flex-col">
      <AssetInput id="asset-code" label="Asset Code" bind:value={assetCode} />
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
        <Input id="publicKey{i + 1}" label="Public Key" value={publicKey} readonly />
        <Input id="secretKey{i + 1}" label="Secret Key" value={secretKey} readonly />
      </div>
    {/each}
  </Card>
</div>
