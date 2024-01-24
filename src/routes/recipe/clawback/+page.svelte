<script lang="ts">
  import { Operation, Asset, Keypair } from 'stellar-sdk';

  import { Account } from '../../../services/stellar/Account';
  import AssetStorageService from '../../../services/asset/Asset';
  import { buildTransaction, server, submitTransaction } from '../../../services/stellar/utils';
  import Card from '../../../components/Card.svelte';
  import Input from '../../../components/Input.svelte';
  import Button from '../../../components/Button.svelte';
  import TransactionInfo from '../../../components/TransactionInfo.svelte';
  import Checkbox from '../../../components/Checkbox.svelte';

  const assetService = new AssetStorageService();
  let assetsOnLocalStorage = assetService.getAll();
  let assetCode: string;
  let issuerSecretKey: string;
  let clawbackAccount: string;
  let isLoading = false;
  let status = '';
  let amountForClawback: string;
  let isClawbackAllEnabled = true;
  let isTransactionSuccessful = false;
  let transactionHash: string;

  $: {
    const selectedAsset = assetsOnLocalStorage.find((asset) => asset.code === assetCode);
    issuerSecretKey = selectedAsset ? selectedAsset.issuerSecret : '';
  }

  async function performClawback() {
    isTransactionSuccessful = false;
    transactionHash = '';
    status = '';
    isLoading = true;

    try {
      const issuerAccount = new Account(Keypair.fromSecret(issuerSecretKey));
      const sourceAccount = await server.loadAccount(issuerAccount.publicKey);
      const clawbackAccountInfo = await server.loadAccount(clawbackAccount);
      const clawbackableAssetAmount = clawbackAccountInfo.balances.find(
        (balance) =>
          'asset_code' in balance &&
          balance.asset_code === assetCode &&
          balance.asset_issuer === issuerAccount.publicKey
      )?.balance;

      if (!clawbackableAssetAmount) {
        throw new Error('Error occurred while processing your request. Please check your inputs and try again.');
      }
      if (clawbackableAssetAmount) {
        const amountToClawback = isClawbackAllEnabled ? clawbackableAssetAmount : amountForClawback;

        if (parseFloat(amountToClawback) > parseFloat(clawbackableAssetAmount)) {
          throw new Error(
            `The amount for clawback (${amountToClawback}) is greater than the available balance (${clawbackableAssetAmount})`
          );
        }

        status = `Performing clawback of ${amountToClawback} ${assetCode} from ${clawbackAccount} to ${issuerSecretKey}`;

        const clawbackOperation = Operation.clawback({
          asset: new Asset(assetCode, issuerAccount.publicKey),
          from: clawbackAccount,
          amount: amountToClawback.toString()
        });
        const transaction = buildTransaction(sourceAccount, [clawbackOperation]);
        transaction.sign(Keypair.fromSecret(issuerAccount.secretKey));
        const transactionResponse = await submitTransaction(transaction);
        transactionHash = transactionResponse.hash;
        isTransactionSuccessful = transactionResponse.successful;

        if (!isTransactionSuccessful) {
          status = `Clawback of ${amountToClawback} ${assetCode} failed.`;
          throw new Error(`Clawback of ${amountToClawback} ${assetCode} failed.`);
        }
      }
    } catch (error: any) {
      status = `An error occurred: ${error.message}`;
    } finally {
      isLoading = false;
    }
  }
</script>

<div class="flex justify-center">
  <form on:submit|preventDefault={performClawback}>
    <Card title="Clawback Asset ">
      <label for="asset-code-select">
        <select
          id="asset-code-select"
          bind:value={assetCode}
          disabled={isLoading}
          class="mb-4 border-4 w-full p-2 border-black"
        >
          <option disabled selected value={null}>Select an asset</option>
          {#each assetsOnLocalStorage as asset, i (`${asset.code}-${i}`)}
            <option value={asset.code}>{asset.code}</option>
          {/each}
        </select>
      </label>

      <label for="asset-code-input">
        Asset Code
        <Input dataCy="asset-code-input" bind:value={assetCode} disabled={isLoading} required />
      </label>

      <label for="issuer-secret-key">
        Issuer Secret Key
        <Input dataCy="issuer-secret-key-input" bind:value={issuerSecretKey} required disabled={isLoading} />
      </label>
      <label for="clawback-account">
        Clawback Account
        <Input dataCy="clawback-account-input" bind:value={clawbackAccount} disabled={isLoading} required />
      </label>
      <label for="amount">
        Amount
        <Input
          dataCy="amount-input"
          bind:value={amountForClawback}
          type="number"
          disabled={isLoading || isClawbackAllEnabled}
          required
        />
      </label>
      <Checkbox
        dataCy="is-clawback-all-enabled-checkbox"
        label="Clawback all"
        bind:checked={isClawbackAllEnabled}
        disabled={isLoading}
      />

      <div class="flex justify-center mt-5">
        <Button
          dataCy="clawback-button"
          label={isLoading ? 'Performing...' : 'Perform Clawback'}
          disabled={isLoading}
        />
      </div>
      <div id="status" class="min-h-[50px] overflow-auto mt-4">
        {#if isTransactionSuccessful}
          Transaction successful <TransactionInfo {transactionHash} />
        {:else}
          {status}
        {/if}
      </div>
    </Card>
  </form>
</div>
