<script lang="ts">
  import AssetStorageService from '../../../services/asset/Asset';

  import Card from '../../../components/Card.svelte';
  import Input from '../../../components/Input.svelte';
  import Button from '../../../components/Button.svelte';

  const assetService = new AssetStorageService();
  let assetsOnLocalStorage = assetService.getAll();
  let assetCode = '';
  let issuerSecretKey = '';
  let assetHolderPublicKey = '';
  let isLoading = false;

  $: {
    const selectedAsset = assetsOnLocalStorage.find((asset) => asset.code === assetCode);
    issuerSecretKey = selectedAsset ? selectedAsset.issuerSecret : '';
  }

  async function freezeAsset() {}

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

        <Button dataCy="freeze-button" label={isLoading ? 'Freezing...' : 'Freeze Asset'} disabled={isLoading} />
      </div>
    </Card>
  </form>
</div>
