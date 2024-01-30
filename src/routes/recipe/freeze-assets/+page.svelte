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

  const SET_FLAGS = {
    FREEZE: 1,
    UNFREEZE: 2
  };

  async function loadAccounts(issuerPublicKey: string, assetHolderPublicKey: string) {
    try {
      const sourceAccount = await server.loadAccount(issuerPublicKey);
      const assetHolder = await server.loadAccount(assetHolderPublicKey);
      return { sourceAccount, assetHolder };
    } catch (error) {
      throw new Error(`Failed to load account: ${String(error)}`);
    }
  }

  async function performAssetAction() {
    isLoading = true;
    status = '';
    isTransactionSuccessful = false;
    transactionHash = '';

    try {
      const issuerKeypair = Keypair.fromSecret(issuerSecretKey);
      const { sourceAccount } = await loadAccounts(issuerKeypair.publicKey(), assetHolderPublicKey);

      const operations = [
        Operation.setOptions({
          [shouldFreezeAsset ? 'setFlags' : 'clearFlags']: SET_FLAGS.FREEZE
        }),
        Operation.setOptions({
          [shouldFreezeAsset ? 'setFlags' : 'clearFlags']: SET_FLAGS.UNFREEZE
        }),
        Operation.allowTrust({
          trustor: assetHolderPublicKey,
          assetCode: assetCode,
          authorize: !shouldFreezeAsset
        })
      ];

      status = 'Performing transaction...';
      let transaction = buildTransaction(sourceAccount, operations);
      transaction.sign(issuerKeypair);

      const transactionResult = await submitTransaction(transaction);
      isTransactionSuccessful = transactionResult.successful;

      status = `Transaction ${isTransactionSuccessful ? 'succeeded' : 'failed'}.`;

      if (isTransactionSuccessful) {
        transactionHash = transactionResult.hash;
        status = `Asset ${shouldFreezeAsset ? 'frozen' : 'unfrozen'} successfully! `;
      }
    } catch (error) {
      status = `Error: ${String(error)}`;
      isTransactionSuccessful = false;
    } finally {
      isLoading = false;
    }
  }

  function allowOnlyAlphanumeric(inputValue: string) {
    return inputValue.replace(/[^a-zA-Z0-9]/g, '');
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
            <Switch bind:checked={shouldFreezeAsset} dataCy="freeze-switch" disabled={isLoading} />
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
