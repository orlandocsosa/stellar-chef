<script lang="ts">
  import Label from '../../../components/Label.svelte';
  import Span from '../../../components/Span.svelte';
  import AssetSelector from '../../../components/asset-selector/AssetSelector.svelte';
  import Button from '../../../components/salient/Button.svelte';
  import Card from '../../../components/salient/Card.svelte';
  import RadioOptions from '../../../components/salient/RadioOptions.svelte';
  import Title from '../../../components/salient/Title.svelte';
  import useToast from '../../../composables/useToast';
  import useUserAsset from '../../../composables/useUserAsset';
  import AssetService from '../../../services/asset/Asset';
  import LoadingSpinner from '../../../components/LoadingSpinner.svelte';
  import { parseEntriesValues } from '../../../utils';
  import { buildTransaction, server, submitTransaction } from '../../../services/stellar/utils';
  import { Keypair, Operation } from 'stellar-sdk';

  interface IFreezeForm {
    secret: string;
    holder: string;
  }

  const SET_FLAGS = {
    FREEZE: 1,
    UNFREEZE: 2
  };

  const assetService = new AssetService();
  const assets = assetService.getAll();
  const { code, getAsset, issuer, selectedAsset } = useUserAsset(assets);
  const { showToast } = useToast();
  let radioInputValue = true;
  let isLoading = false;

  async function handleOnSubmit(e: Event) {
    isLoading = true;

    try {
      const formData = new FormData(e.target as HTMLFormElement);
      const { holder, secret } = parseEntriesValues<IFreezeForm>(formData);
      const asset = getAsset();

      const account = await server.loadAccount(holder);
      const issuerAccount = await server.loadAccount(asset.issuer);

      const operations = [
        Operation.setOptions({
          [radioInputValue ? 'setFlags' : 'clearFlags']: SET_FLAGS.FREEZE
        }),
        Operation.setOptions({
          [radioInputValue ? 'setFlags' : 'clearFlags']: SET_FLAGS.UNFREEZE
        }),
        Operation.allowTrust({
          trustor: account.accountId(),
          assetCode: asset.code,
          authorize: !radioInputValue
        })
      ];

      const transaction = buildTransaction(issuerAccount, operations);
      transaction.sign(Keypair.fromSecret(secret));

      await submitTransaction(transaction);
      showToast(`Asset ${asset.code} has been ${radioInputValue ? 'frozen' : 'unfrozen'}`, 'success');
    } catch (e) {
      showToast(`Something went wrong: ${e}`, 'danger');
      console.error(e);
    } finally {
      isLoading = false;
    }
  }
</script>

<Card className="flex flex-col m-auto w-[600px]">
  <Title>Freeze Assets</Title>

  <form class="flex flex-col gap-5" on:submit|preventDefault={handleOnSubmit}>
    <div class="flex flex-row gap-3 items-center">
      <Title tag="h3">Asset</Title>
      <AssetSelector {assets} bind:value={$selectedAsset} />
    </div>

    {#if $selectedAsset === null}
      <div>
        <Label>
          <Span>Code</Span>
          <input type="text" bind:value={$code} />
        </Label>

        <Label>
          <Span>Issuer</Span>
          <input type="text" bind:value={$issuer} />
        </Label>
      </div>
    {/if}

    <Label>
      Issuer Secret
      <input type="text" name="secret" value={$selectedAsset !== null ? assets[$selectedAsset].issuerSecret : ''} />
    </Label>

    <Label>
      Holder Account
      <input type="text" name="holder" />
    </Label>

    <div>
      <RadioOptions
        bind:group={radioInputValue}
        options={[
          { label: 'Freeze', value: true, checked: radioInputValue },
          { label: 'Unfreeze', value: false, checked: !radioInputValue }
        ]}
      />
    </div>

    <Button type="submit" className="mt-8 h-10 w-full">
      {#if isLoading}
        <div class="w-8"><LoadingSpinner /></div>
      {:else}
        Submit
      {/if}
    </Button>
  </form>
</Card>
