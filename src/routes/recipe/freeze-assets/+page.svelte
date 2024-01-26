<script lang="ts">
  import { Operation, Asset, Keypair } from 'stellar-sdk';

  import { Account } from '../../../services/stellar/Account';
  import AssetStorageService from '../../../services/asset/Asset';
  import { buildTransaction, server, submitTransaction } from '../../../services/stellar/utils';
  import { prepareFreezeAssetTransaction } from '../../../services/stellar/transactions/prepareFreezeAssetTransaction';

  import Card from '../../../components/Card.svelte';
  import Input from '../../../components/Input.svelte';
  import Button from '../../../components/Button.svelte';

  const assetService = new AssetStorageService();
  let assetsOnLocalStorage = assetService.getAll();
  let assetCode = '';
  let issuerSecretKey = '';
  let assetHolderPublicKey = '';
  let isLoading = false;
  let status = '';
  let transactionLink = '';

  $: {
    const selectedAsset = assetsOnLocalStorage.find((asset) => asset.code === assetCode);
    issuerSecretKey = selectedAsset ? selectedAsset.issuerSecret : '';
  }

  async function freezeAsset() {
    isLoading = true;
    status = '';
    transactionLink = '';
    try {
      status = 'Freezing asset...';
      // Derive the public key from the issuer secret key
      const issuerKeypair = Keypair.fromSecret(issuerSecretKey);
      const issuerPublicKey = issuerKeypair.publicKey();

      // Fetch the accounts from the server to be used in the transaction
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

      // Define operations
      const operations = [];

      // Add operations to set the AUTHORIZATION REQUIRED and AUTHORIZATION REVOCABLE flags
      operations.push(
        Operation.setOptions({
          setFlags: 1 // AUTH_REQUIRED_FLAG
        }),
        Operation.setOptions({
          setFlags: 2 // AUTH_REVOCABLE_FLAG
        }),
        Operation.allowTrust({
          trustor: assetHolderPublicKey,
          assetCode: assetCode,
          authorize: false
        })
      );

      // Build the transaction
      let transaction = buildTransaction(sourceAccount, operations);

      // Sign the transaction
      transaction.sign(issuerKeypair);

      // Submit the transaction
      const transactionResult = await submitTransaction(transaction);
      if (transactionResult.successful) {
        const transactionHash = transactionResult.hash;
        transactionLink = `https://stellar.expert/explorer/testnet/tx/${transactionHash}`;
        status = `Asset frozen successfully! `;
      }
    } catch (error) {
      status = `Error: ${String(error)}`;
      console.error('An error occurred:', error);
      isLoading = false;
    } finally {
      isLoading = false;
    }
  }

  function allowOnlyAlphanumeric(inputValue: string) {
    return inputValue.replace(/[^a-zA-Z0-9]/g, '');
  }
</script>

<div class="flex justify-center">
  <form class="flex flex-col" on:submit|preventDefault={freezeAsset}>
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
        <Input dataCy="issuer-secret-key-input" bind:value={issuerSecretKey} required disabled={isLoading} />

        Asset Holder Public Key
        <Input dataCy="asset-holder-public-key-input" bind:value={assetHolderPublicKey} required disabled={isLoading} />
        <div>
          <Button dataCy="freeze-button" label={isLoading ? 'Freezing...' : 'Freeze Asset'} disabled={isLoading} />
          <div data-cy="status" class="min-h-[50px] overflow-auto mt-4">
            <p>{status}</p>
            {#if transactionLink}
              <p>
                <a
                  data-cy="transaction-link"
                  class="text-blue-500 hover:text-blue-800 ml-1 underline"
                  href={transactionLink}
                  target="_blank">View transaction</a
                >
              </p>
            {/if}
          </div>
        </div>
      </div>
    </Card>
  </form>
</div>
