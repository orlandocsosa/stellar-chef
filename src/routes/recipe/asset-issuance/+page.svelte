<script lang="ts">
  import { Asset, Keypair, Operation } from 'stellar-sdk';

  import AccountDetails from '../../../components/AccountDetails.svelte';
  import AssetOutput from '../../../components/AssetOutput.svelte';
  import Button from '../../../components/Button.svelte';
  import Card from '../../../components/Card.svelte';
  import Checkbox from '../../../components/Checkbox.svelte';
  import CoinInfo from '../../../components/CoinInfo.svelte';
  import Input from '../../../components/Input.svelte';

  import { Account } from '../../../services/stellar/Account';
  import AssetStorageService from '../../../services/asset/Asset';
  import type IAsset from '../../../services/asset/IAsset';
  import { buildTransaction, server, submitTransaction } from '../../../services/stellar/utils';
  import { createHolders } from '../../../services/stellar/transactions/createHolders';
  import { prepareClawbackOperations } from '../../../services/stellar/transactions/prepareClawbackOperations';
  import { prepareFreezeAssetTransaction } from '../../../services/stellar/transactions/prepareFreezeAssetTransaction';
  import { submitDisableTrustlineTransactionForFrozenAsset } from '../../../services/stellar/transactions/submitDisableTrustlineTransactionForFrozenAsset';

  let assetCode = '';
  let accounts: Account[] = [];
  let assetCodeForCoinInfo = '';
  let paymentAmount = 1000000;
  let balancePerHolder = 100;
  let isLoading = false;
  let isClawbackEnabled = false;
  let isFrozenAsset = false;
  let shouldCreateHolders = false;
  let numberOfHolders = 1;
  let status = '';
  let holdersAccounts: Account[] = [];
  let showHolders = false;
  let isTransactionSuccessful = false;
  let assetService = new AssetStorageService();

  async function prepare() {
    accounts = [];
    holdersAccounts = [];
    status = '';
    isLoading = true;
    isTransactionSuccessful = false;

    if (shouldCreateHolders && numberOfHolders * balancePerHolder > paymentAmount) {
      status = 'Error: Not enough funds for distributor account to create holders.';
      isLoading = false;
      return;
    }

    try {
      const [issuerAccount, distributorAccount] = await Promise.all([
        Account.create().fundWithFriendBot(),
        Account.create().fundWithFriendBot()
      ]);

      let [issuer, distributor] = await Promise.all([
        server.loadAccount(issuerAccount.publicKey),
        server.loadAccount(distributorAccount.publicKey)
      ]);

      status = 'Accounts created...';
      accounts = [issuerAccount, distributorAccount];

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
          amount: paymentAmount.toString()
        })
      );

      const transaction = buildTransaction(distributor, operations);
      transaction.sign(Keypair.fromSecret(distributorAccount.secretKey));
      transaction.sign(Keypair.fromSecret(issuerAccount.secretKey));

      const result = await submitTransaction(transaction);
      if (isFrozenAsset && !shouldCreateHolders) {
        await submitDisableTrustlineTransactionForFrozenAsset(
          assetCode,
          distributorAccount.publicKey,
          issuer,
          issuerAccount.secretKey
        );
      }

      if (shouldCreateHolders && numberOfHolders > 0) {
        status = 'Creating holders...';
        holdersAccounts = await createHolders(
          distributorAccount,
          numberOfHolders,
          balancePerHolder ? balancePerHolder.toString() : '',
          asset
        );

        if (isFrozenAsset) {
          status = 'Holders created...';
          for (const holderAccount of holdersAccounts) {
            await submitDisableTrustlineTransactionForFrozenAsset(
              assetCode,
              holderAccount.publicKey,
              issuer,
              issuerAccount.secretKey
            );
          }
        }
      }

      if (typeof result.successful) {
        assetCodeForCoinInfo = assetCode;
        isTransactionSuccessful = true;

        distributor = await server.loadAccount(distributorAccount.publicKey);

        issuer = await server.loadAccount(issuerAccount.publicKey);

        status = `Transaction successful. Distributor account balance: ${distributor.balances[0].balance} ${assetCode}`;

        let assetForSave: IAsset = {
          code: assetCode,
          issuer: issuerAccount.publicKey,
          issuerSecret: issuerAccount.secretKey
        };
        assetService.set(assetForSave);
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
  <form class="flex flex-col" on:submit|preventDefault={prepare}>
    <Card title="Inputs">
      <div class="flex flex-col">
        <label for="asset-code" class="block mb-1"
          >Asset Code <span class="text-red-500">*</span>
          <Input
            dataCy="asset-code-input"
            bind:value={assetCode}
            maxlength={12}
            handleInput={allowOnlyAlphanumeric}
            disabled={isLoading}
            required
          />
        </label>
        <label for="payment-amount" class="block mb-1"
          >Payment to distributor account
          <Input
            dataCy="distributor-payment-amount-input"
            type="number"
            bind:value={paymentAmount}
            disabled={isLoading}
            required
          />
          <Checkbox
            dataCy="clawback-enabled"
            label="Clawback enabled"
            bind:checked={isClawbackEnabled}
            disabled={isLoading}
          />
          <Checkbox dataCy="frozen-asset" label="Frozen asset" bind:checked={isFrozenAsset} disabled={isLoading} />
          <Checkbox
            dataCy="create-holders"
            label="Create holders"
            bind:checked={shouldCreateHolders}
            disabled={isLoading}
          />
          <div class="ml-4">
            <label for="number-of-holders">
              How many?<Input
                dataCy="number-of-holders-input"
                type="number"
                bind:value={numberOfHolders}
                disabled={!shouldCreateHolders || isLoading}
                required={shouldCreateHolders}
              /></label
            >

            <p>Balance per holder:</p>
            <label for="balance-value" />
            <Input
              dataCy="balance-per-holder-input"
              type="number"
              bind:value={balancePerHolder}
              disabled={!shouldCreateHolders || isLoading}
              required={shouldCreateHolders}
            />
          </div>
          <div class="flex justify-center items-center">
            <Button dataCy="prepare-button" label={isLoading ? 'Preparing...' : 'Prepare!'} disabled={isLoading} />
          </div>
          <div data-cy="status" class="min-h-[50px] overflow-auto mt-4">{status}</div>
        </label>
      </div>
    </Card>
  </form>

  <Card title="Output">
    {#if isTransactionSuccessful}
      <CoinInfo {assetCodeForCoinInfo} issuerPublicKey={accounts[0].publicKey} dataCy="coin-info-link" />
    {/if}

    {#each accounts as { publicKey, secretKey }, i (publicKey)}
      <div class="mt-4" data-cy={i === 0 ? 'issuer-container' : 'distributor-container'}>
        <h3 class="text-lg mb-2">
          {i === 0 ? 'Issuer' : 'Distributor'}
          <AccountDetails dataCy={i === 0 ? 'issuer-info-link' : 'distributor-info-link'} {publicKey} />
        </h3>
        <label for={i === 0 ? 'issuerPublicKey' : 'distributorPublicKey'} class="block mb-2"
          >Public Key
          <AssetOutput value={publicKey} />
        </label>
        <label for={i === 0 ? 'issuerSecretKey' : 'distributorSecretKey'} class="block">
          Secret Key
          <AssetOutput value={secretKey} />
        </label>
      </div>
    {/each}

    {#if holdersAccounts.length > 0}
      <Button
        dataCy="toggle-holders-button"
        label={showHolders ? 'Hide Holders' : 'Show Holders'}
        onClick={() => {
          showHolders = !showHolders;
        }}
      />
    {/if}

    {#if showHolders}
      {#each holdersAccounts as { publicKey, secretKey }, i (publicKey)}
        <div class="mt-4" data-cy="holder-{i + 1}-container">
          <h3 class="text-lg mb-2">Holder {i + 1} <AccountDetails dataCy="holder-{i + 1}-info-link" {publicKey} /></h3>
          <label for="holder-{i + 1}PublicKey" class="block mb-2"
            >Public Key
            <AssetOutput value={publicKey} />
          </label>
          <label for="holder-{i + 1}SecretKey" class="block">
            Secret Key
            <AssetOutput value={secretKey} />
          </label>
        </div>
      {/each}
    {/if}
  </Card>
</div>
