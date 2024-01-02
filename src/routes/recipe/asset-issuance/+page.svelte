<script lang="ts">
  import { Asset, Operation, Keypair } from 'stellar-sdk';

  import { Account } from '../../../services/stellar/Account';
  import AssetOutput from '../../../components/AssetOutput.svelte';
  import Input from '../../../components/Input.svelte';
  import Card from '../../../components/Card.svelte';
  import Button from '../../../components/Button.svelte';
  import Checkbox from '../../../components/Checkbox.svelte';

  import { server, buildTransaction, submitTransaction } from '../../../services/stellar/utils';
  import { prepareClawbackOperations } from '../../../services/stellar/transactions/prepareClawbackOperations';
  import { prepareFreezeAssetTransaction } from '../../../services/stellar/transactions/prepareFreezeAssetTransaction';
  import { submitDisableTrustlineTransactionForFrozenAsset } from '../../../services/stellar/transactions/submitDisableTrustlineTransactionForFrozenAsset';
  import { createHolders } from '../../../services/stellar/transactions/createHolders';

  let assetCode = '';
  let accounts: Account[] = [];
  let balancePerHolder = 100;
  let isLoading = false;
  let shouldCreateDistributorAccount = true;
  let isClawbackEnabled = false;
  let isFrozenAsset = false;
  let shouldCreateHolders = false;
  let numberOfHolders = 1;
  let status = '';
  let holdersAccounts: Account[] = [];
  let showHolders = false;

  async function prepare() {
    accounts = [];
    holdersAccounts = [];
    status = '';
    isLoading = true;

    try {
      const [issuerAccount, distributorAccount] = await Promise.all([
        Account.create().fundWithFriendBot(),
        Account.create().fundWithFriendBot()
      ]);

      let [issuer, distributor] = await Promise.all([
        server.loadAccount(issuerAccount.publicKey),
        server.loadAccount(distributorAccount.publicKey)
      ]);

      status = 'Accounts created';

      const asset = new Asset(assetCode, issuer.accountId());

      let operations = [];
      if (isClawbackEnabled) {
        operations.push(...prepareClawbackOperations(issuerAccount.publicKey));
      }
      if (isFrozenAsset && !isClawbackEnabled) {
        operations.push(...prepareFreezeAssetTransaction(issuerAccount.publicKey));
      }

      operations.push(Operation.changeTrust({ asset }));
      operations.push(
        Operation.payment({
          source: issuerAccount.publicKey,
          destination: distributor.accountId(),
          asset,
          amount: '1000000'
        })
      );

      const transaction = buildTransaction(distributor, operations);
      transaction.sign(Keypair.fromSecret(distributorAccount.secretKey));
      transaction.sign(Keypair.fromSecret(issuerAccount.secretKey));

      const result = await submitTransaction(transaction);
      if (isFrozenAsset) {
        await submitDisableTrustlineTransactionForFrozenAsset(
          assetCode,
          distributorAccount.publicKey,
          issuer,
          issuerAccount.secretKey
        );
      }

      if (shouldCreateHolders && numberOfHolders > 0) {
        holdersAccounts = await createHolders(
          distributorAccount,
          numberOfHolders,
          balancePerHolder ? balancePerHolder.toString() : '',
          asset
        );
      }

      if (typeof result.successful) {
        distributor = await server.loadAccount(distributorAccount.publicKey);

        issuer = await server.loadAccount(issuerAccount.publicKey);

        status = `Transaction successful. Distributor account balance: ${distributor.balances[0].balance} ${assetCode}`;

        accounts = [issuerAccount, distributorAccount];
      }
    } catch (error) {
      status = `Error: ${String(error)}`;
      console.error(error);
    } finally {
      isLoading = false;
    }
  }

  function allowOnlyAlphanumeric(inputValue: string) {
    return inputValue.replace(/[^a-zA-Z0-9]/g, '');
  }
</script>

<div class="flex justify-center">
  <Card id="inputs" title="Inputs">
    <div class="flex flex-col">
      <label for="asset-code" class="block mb-2"
        >Asset Code <span class="text-red-500">*</span>
        <Input id="asset-code" bind:value={assetCode} maxlength={12} handleInput={allowOnlyAlphanumeric} />
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
          How many?<Input
            id="number-of-holders"
            type="number"
            bind:value={numberOfHolders}
            disabled={!shouldCreateHolders}
          /></label
        >

        <p>Balance per holder:</p>
        <label for="balance-value" />
        <Input id="balance-value" type="number" bind:value={balancePerHolder} disabled={!shouldCreateHolders} />
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

  <Card id="outputs" title="Output">
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
    {#if holdersAccounts.length > 0}
      <Button
        id="toggle-holders-button"
        label={showHolders ? 'Hide Holders' : 'Show Holders'}
        onClick={() => {
          showHolders = !showHolders;
        }}
      />
    {/if}
    {#if showHolders}
      {#each holdersAccounts as { publicKey, secretKey }, i (publicKey)}
        <div class="mt-4">
          <h2 class="text-lg font-bold mb-2">Holder {i + 1}</h2>
          <label for="publicKeyHolder{i + 1}" class="block mb-2"
            >Public Key
            <AssetOutput id="publicKeyHolder{i + 1}" value={publicKey} />
          </label>
          <label for="secretKeyHolder{i + 1}" class="block">
            Secret Key
            <AssetOutput id="secretKeyHolder{i + 1}" value={secretKey} />
          </label>
        </div>
      {/each}
    {/if}
  </Card>
</div>
