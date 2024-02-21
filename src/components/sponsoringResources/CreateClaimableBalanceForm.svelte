<script lang="ts">
  import Input from '../Input.svelte';
  import Button from '../Button.svelte';
  import ClaimantForm from '../claimant/Claimant.svelte';
  import { claimants } from '../../utils/stores/claimant';

  export let sponsorPublicKey = '';
  export let sponsoredPublicKey = '';
  export let isLoading = false;
  export let onSubmit: (event: Event) => void;
  let assetType = 'native';

  function addClaimant() {
    $claimants.push({ destination: '', predicate: { type: undefined } });
    $claimants = $claimants;
  }

  function removeClaimant(index: number) {
    $claimants = $claimants.filter((_claimant, i) => i !== index);
  }
</script>

<div class="flex flex-col items-center">
  <form on:submit={onSubmit} class="w-full">
    <label for="sponsorAccount">
      Sponsor Account
      <Input bind:value={sponsorPublicKey} readonly name="sponsorAccount" required />
    </label>

    <label for="sponsoredAccount">
      Sponsored Account
      <Input bind:value={sponsoredPublicKey} readonly name="sponsoredAccount" required />
    </label>

    <label for="assetType" class="block">
      <strong class="block mb-1 text-lg">Asset Type</strong>
      <select
        bind:value={assetType}
        name="assetType"
        required
        disabled={isLoading}
        class="w-full p-2 border border-gray-300 rounded mb-1"
      >
        <option value="native">native</option>
        <option value="alphanumeric4">Alphanumeric 4</option>
        <option value="alphanumeric12">Alphanumeric 12</option>
      </select>
    </label>

    {#if !(assetType === 'native')}
      <label for="assetCode" class="block">
        <strong class="block mb-1 text-lg">Asset Code</strong>
        <Input
          type="text"
          name="assetCode"
          required
          disabled={isLoading}
          maxlength={assetType === 'alphanumeric4' ? 4 : 12}
        />
      </label>
      <label for="issuerAccount" class="block">
        <strong class="block mb-1 text-lg">Asset Issuer Account</strong>
        <Input type="text" name="issuerAccount" required disabled={isLoading} maxlength={56} />
      </label>
    {/if}

    <label for="amount" class="block">
      <strong class="block text-lg mb-1">
        Amount: <Input type="number" value="0" name="amount" required disabled={isLoading} />
      </strong>
    </label>

    <label for="$claimants">
      <h2 class="text-xl font-bold mb-5 p-3">
        <span>Claimants</span>
      </h2>
      <div class="flex flex-col">
        <div class="flex flex-row justify-start">
          <button
            type="button"
            on:click={() => addClaimant()}
            class="bg-green-500 hover:bg-green-600 text-white py-2 border border-green-500 w-20 mx-2 rounded transition duration-200 ease-in-out mb-4"
          >
            Add Claimant
          </button>
        </div>
        {#each $claimants as claimant, i}
          <div class="flex flex-col border-4 m-1 p-1 border-black rounded shadow-lg">
            <div>
              <strong>Claimant {i + 1}</strong>
              <button type="button" on:click={() => removeClaimant(i)}>Remove</button>
            </div>

            <label for="destination" class="block">
              Destination
              <Input type="text" bind:value={claimant.destination} required disabled={isLoading} maxlength={56} />
            </label>
            <ClaimantForm {claimant} isFirstNested={false} isSecondNested={false} nestedLevel={0} id={`${i + 1}`} />
          </div>
        {/each}
      </div>
    </label>
    <Button label="Submit" disabled={isLoading} />
  </form>
</div>
