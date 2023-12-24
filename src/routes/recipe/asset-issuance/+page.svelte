<script lang="ts">
  import { Asset, Operation, Keypair, AuthClawbackEnabledFlag, AuthRevocableFlag, xdr } from 'stellar-sdk';

  import { Account } from '../../../services/stellar/Account';
  import AssetOutput from '../../../components/AssetOutput.svelte';
  import Input from '../../../components/Input.svelte';
  import Card from '../../../components/Card.svelte';
  import Button from '../../../components/Button.svelte';
  import Checkbox from '../../../components/Checkbox.svelte';
  import { server, buildTransaction, submitTransaction } from '../../../services/stellar/utils';

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

  async function checkClawbackStatus(issuerAccountId: string) {
    const issuerAccount = await server.loadAccount(issuerAccountId);

    if (issuerAccount.flags.auth_clawback_enabled && issuerAccount.flags.auth_revocable) {
      return 'Clawback has been set successfully.';
    } else {
      throw new Error('Failed to set the clawback flag.');
    }
  }

  async function checkAssetFrozen(distributorPublicKey: string, frozenAssetCode: string, issuerPublicKey: string) {
    const distributorAccountWithFrozenAsset = await server.loadAccount(distributorPublicKey);

    const trustline = distributorAccountWithFrozenAsset.balances.find(
      (balance) =>
        'asset_issuer' in balance && balance.asset_code === frozenAssetCode && balance.asset_issuer === issuerPublicKey
    );

    if (trustline && 'is_authorized' in trustline && !trustline.is_authorized) {
      return 'Asset frozen successfully.';
    } else {
      throw new Error('Failed to freeze the asset.');
    }
  }

  async function prepare() {
    accounts = [];
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
        const setOptionsTransaction = buildTransaction(issuer, [
          Operation.setOptions({ setFlags: AuthRevocableFlag }),
          Operation.setOptions({ setFlags: AuthClawbackEnabledFlag })
        ]);
        setOptionsTransaction.sign(Keypair.fromSecret(issuerAccount.secretKey));
        await submitTransaction(setOptionsTransaction);
      }

      if (isFrozenAsset) {
        operations.push(
          Operation.setOptions({
            source: issuerAccount.publicKey,
            setFlags: AuthRevocableFlag
          })
        );
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
        const existingAsset = new Asset(assetCode, issuer.accountId());

        const disableTrustOperation = Operation.setTrustLineFlags({
          source: issuerAccount.publicKey,
          trustor: distributorAccount.publicKey,
          asset: existingAsset,
          flags: { authorized: false }
        });

        const trustlineDisableOperations = [disableTrustOperation];

        const transaction = buildTransaction(issuer, trustlineDisableOperations);
        transaction.sign(Keypair.fromSecret(issuerAccount.secretKey));
        await submitTransaction(transaction);

        status = await checkAssetFrozen(distributorAccount.publicKey, assetCode, issuerAccount.publicKey);
      }

      if (isClawbackEnabled) {
        status = await checkClawbackStatus(issuerAccount.publicKey);
      }

      if (typeof result === 'object') {
        distributor = await server.loadAccount(distributorAccount.publicKey);

        status = `Transaction successful. Distributor account balance: ${distributor.balances[0].balance} ${assetCode}`;

        accounts = [issuerAccount, distributorAccount];
      }
    } catch (error) {
      status = `Error: ${String(error)}`;
    } finally {
      isLoading = false;
    }
  }

  function allowOnlyAlphanumeric(inputValue: string) {
    return inputValue.replace(/[^a-zA-Z0-9]/g, '');
  }
</script>

<div class="flex justify-center">
  <Card title="Inputs">
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
