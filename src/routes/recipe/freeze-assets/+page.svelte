<script lang="ts">
  import { Operation, Keypair } from 'stellar-sdk';

  import AssetStorageService from '../../../services/asset/Asset';
  import { buildTransaction, server, submitTransaction } from '../../../services/stellar/utils';
  import TransactionInfo from '../../../components/TransactionInfo.svelte';
  import Card from '../../../components/Card.svelte';
  import Input from '../../../components/Input.svelte';
  import Button from '../../../components/Button.svelte';
  import Switch from '../../../components/Switch.svelte';

  const assetService = new AssetStorageService();
  let assetsOnLocalStorage = assetService.getAll();
  let assetCode = '';
  let issuerSecretKey = '';
  let assetHolderPublicKey = '';
  let isLoading = false;
  let status = '';
  let isTransactionSuccessful = false;
  let transactionHash = '';
  let shouldFreezeAsset = true;

  $: {
    const selectedAsset = assetsOnLocalStorage.find((asset) => asset.code === assetCode);
    issuerSecretKey = selectedAsset ? selectedAsset.issuerSecret : '';
  }

  async function freezeAsset() {
    isLoading = true;
    status = '';
    isTransactionSuccessful = false;
    transactionHash = '';
    try {
      status = 'Freezing asset...';
      const issuerKeypair = Keypair.fromSecret(issuerSecretKey);
      const issuerPublicKey = issuerKeypair.publicKey();

      let sourceAccount;
      let assetHolder;
      try {
        sourceAccount = await server.loadAccount(issuerPublicKey);
        assetHolder = await server.loadAccount(assetHolderPublicKey);
      } catch (error) {
        status = `Error: ${String(error)}`;
        console.error('Failed to load account:', error);
        return;
      }
      status = 'Setting freeze flags...';
      const operations = [];

      operations.push(
        Operation.setOptions({
          setFlags: 1
        }),
        Operation.setOptions({
          setFlags: 2
        }),
        Operation.allowTrust({
          trustor: assetHolderPublicKey,
          assetCode: assetCode,
          authorize: false
        })
      );
      status = 'Performing transaction...';
      let transaction = buildTransaction(sourceAccount, operations);

      transaction.sign(issuerKeypair);

      const transactionResult = await submitTransaction(transaction);
      isTransactionSuccessful = transactionResult.successful;

      status = `Transaction ${isTransactionSuccessful ? 'succeeded' : 'failed'}.`;

      if (isTransactionSuccessful) {
        transactionHash = transactionResult.hash;
        status = `Asset frozen successfully! `;
      }
    } catch (error) {
      status = `Error: ${String(error)}`;
      console.error('An error occurred:', error);
      isTransactionSuccessful = false;
      isLoading = false;
    } finally {
      isLoading = false;
    }
  }

  async function unfreezeAsset() {
    isLoading = true;
    status = '';
    isTransactionSuccessful = false;
    transactionHash = '';
    try {
      status = 'Unfreezing asset...';
      const issuerKeypair = Keypair.fromSecret(issuerSecretKey);
      const issuerPublicKey = issuerKeypair.publicKey();

      let sourceAccount;
      let assetHolder;
      try {
        sourceAccount = await server.loadAccount(issuerPublicKey);
        assetHolder = await server.loadAccount(assetHolderPublicKey);
      } catch (error) {
        status = `Failed to load account: ${String(error)}`;
        console.error('Failed to load account:', error);
        return;
      }
      status = 'Clearing freeze flags...';
      const operations = [];

      operations.push(
        Operation.setOptions({
          clearFlags: 1
        }),
        Operation.setOptions({
          clearFlags: 2
        }),
        Operation.allowTrust({
          trustor: assetHolderPublicKey,
          assetCode: assetCode,
          authorize: true
        })
      );
      status = 'Performing transaction...';
      let transaction = buildTransaction(sourceAccount, operations);

      transaction.sign(issuerKeypair);

      const transactionResult = await submitTransaction(transaction);
      isTransactionSuccessful = transactionResult.successful;

      status = `Transaction ${transactionResult.successful ? 'succeeded' : 'failed'}.`;

      if (isTransactionSuccessful) {
        transactionHash = transactionResult.hash;
        status = `Asset unfrozen successfully! `;
      }
    } catch (error) {
      status = `Error: ${String(error)}`;
      console.error('An error occurred:', error);
      isTransactionSuccessful = false;
      isLoading = false;
    } finally {
      isLoading = false;
    }
  }

  function allowOnlyAlphanumeric(inputValue: string) {
    return inputValue.replace(/[^a-zA-Z0-9]/g, '');
  }
  function performAssetAction() {
    return shouldFreezeAsset ? freezeAsset() : unfreezeAsset();
  }
</script>

<div class="flex justify-center">
  <form class="flex flex-col" on:submit|preventDefault={performAssetAction}>
    <Card title="Freeze Asset">
      <div class="flex flex-col">
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

        Asset Code
        <Input
          dataCy="asset-code-input"
          handleInput={allowOnlyAlphanumeric}
          bind:value={assetCode}
          maxlength={12}
          required
        />

        Issuer Secret Key
        <Input
          dataCy="issuer-secret-key-input"
          bind:value={issuerSecretKey}
          required
          disabled={isLoading}
          handleInput={allowOnlyAlphanumeric}
        />

        Asset Holder Public Key
        <Input
          dataCy="asset-holder-public-key-input"
          bind:value={assetHolderPublicKey}
          required
          disabled={isLoading}
          handleInput={allowOnlyAlphanumeric}
        />

        <div class="flex flex-col items-center justify-center">
          <div class="flex items-center m-2">
            <Switch bind:checked={shouldFreezeAsset} />
            <p class="ml-3">{shouldFreezeAsset ? 'Freeze' : 'Unfreeze'}</p>
          </div>
          <Button
            dataCy="perform-button"
            label={isLoading ? (shouldFreezeAsset ? 'Freezing Asset...' : 'Unfreezing Asset...') : 'Perform'}
            disabled={isLoading}
            on:click={performAssetAction}
          />
        </div>

        <div data-cy="status" class="min-h-[50px] overflow-auto mt-4 w-full justify-center">
          <p>{status}</p>
          {#if isTransactionSuccessful}
            <p>
              <TransactionInfo {transactionHash} />
            </p>
          {/if}
        </div>
      </div></Card
    >
  </form>
</div>
