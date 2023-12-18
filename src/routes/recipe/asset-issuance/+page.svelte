<script lang="ts">
  import { Asset, TransactionBuilder, Operation, Keypair } from 'stellar-sdk';

  import { Account } from '../../../services/stellar/Account';
  import Input from '../../../components/Input.svelte';
  import Card from '../../../components/Card.svelte';
  import Button from '../../../components/Button.svelte';
  import Checkbox from '../../../components/Checkbox.svelte';
  import { server } from '../../../services/stellar/utils';

  let assetCode = '';
  let accounts: Account[] = [];
  let balanceValue = 100;
  let buttonLabel = 'Prepare!';
  let isButtonDisabled = false;
  let shouldCreateDistributorAccount = true;
  let isClawbackEnabled = false;
  let isFrozenAsset = false;
  let shouldCreateHolders = true;
  let numberOfHolders = 0;
  let shouldBalanceBeEqualForAll = true;
  let status = '';

  function showStatus(message: string) {
    console.log(message);
    status = message;
  }

  async function prepare() {
    status = '';
    buttonLabel = 'Preparing...';
    isButtonDisabled = true;

    try {
      accounts = [];
      const account1 = await Account.create().fundWithFriendBot();
      const account2 = await Account.create().fundWithFriendBot();
      accounts = [account1, account2];

      const issuer = await server.loadAccount(account1.publicKey);
      const distributor = await server.loadAccount(account2.publicKey);
      showStatus('Accounts created');

      const asset = new Asset(assetCode, issuer.accountId());

      const trustTransaction = new TransactionBuilder(distributor, {
        fee: (await server.fetchBaseFee()).toString(),
        networkPassphrase: import.meta.env.VITE_STELLAR_NETWORK_PASSPHRASE
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
      showStatus('Trust transaction succeeded');

      const paymentTransaction = new TransactionBuilder(issuer, {
        fee: (await server.fetchBaseFee()).toString(),
        networkPassphrase: import.meta.env.VITE_STELLAR_NETWORK_PASSPHRASE
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
      showStatus('Payment transaction succeeded');
      const updatedDistributor = await server.loadAccount(account2.publicKey);
      showStatus(`Distributor balance: ${updatedDistributor.balances[0].balance} ${assetCode}`);
    } catch (error) {
      if (error instanceof Error) {
        showStatus('Failed to create accounts: ' + JSON.stringify(error.message));
      } else {
        showStatus('Failed to create accounts, unknown error ');
      }
    }
    buttonLabel = 'Prepare!';
    isButtonDisabled = false;
  }

  $: accountFields = accounts.map((account) => ({
    publicKey: account.publicKey,
    secretKey: account.secretKey
  }));
</script>

<div class="flex justify-center">
  <Card title="Inputs">
    <div class="flex flex-col">
      <label for="asset-code" class="block mb-2"
        >Asset Code <span class="text-red-500">*</span>
        <Input id="asset-code" bind:value={assetCode} maxlength={12} /></label
      >
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
          How many?<Input
            id="number-of-holders"
            hasToAcceptSpaces={true}
            type="number"
            bind:value={numberOfHolders}
          /></label
        >

        <Checkbox label="Equal balance for all" bind:checked={shouldBalanceBeEqualForAll} />
        <label for="balance-value" />
        <Input id="balance-value" type="number" bind:value={balanceValue} />
      </div>
      <div class="flex justify-center items-center">
        <Button id="prepare-button" label={buttonLabel} onClick={prepare} disabled={isButtonDisabled} />
      </div>
      <textarea id="status" class="h-auto max-h-12 overflow-auto mt-4" bind:value={status} readonly />
    </div>
  </Card>

  <Card title="Output">
    {#each accountFields as { publicKey, secretKey }, i (publicKey)}
      <div class="mt-4">
        <h2 class="text-lg font-bold mb-2">{i === 0 ? 'Issuer' : 'Distributor'}</h2>
        <label for="publicKey{i + 1}" class="block mb-2"
          >Public Key
          <Input id="publicKey{i + 1}" value={publicKey} readonly />
        </label>
        <label for="secretKey{i + 1}" class="block">
          Secret Key
          <Input id="secretKey{i + 1}" value={secretKey} readonly />
        </label>
      </div>
    {/each}
  </Card>
</div>
