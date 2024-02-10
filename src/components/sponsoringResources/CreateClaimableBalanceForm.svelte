<script lang="ts">
  import Input from '../Input.svelte';
  import Button from '../Button.svelte';

  export let sponsorPublicKey: string = '';
  export let sponsoreePublicKey: string = '';
  export let isLoading: boolean = false;

  export let onSubmit: (event: Event) => void;

  let assetType: string = 'native';

  let totalClaimants: number = 0;
  function updateClaimants(action: 'add' | 'remove') {
    if (action === 'add') {
      totalClaimants += 1;
    }
    if (action === 'remove' && totalClaimants > 0) {
      totalClaimants -= 1;
    }
  }
</script>

<div class="flex flex-col items-center">
  <form on:submit={onSubmit} class="w-full">
    <label for="sponsorAccount">
      Sponsor Account
      <Input bind:value={sponsorPublicKey} readonly name="sponsorAccount" required />
    </label>

    <label for="sponsoreeAccount">
      Sponsoree Account
      <Input bind:value={sponsoreePublicKey} readonly name="sponsoreeAccount" required />
    </label>

    <label for="assetType" class="block">
      Asset:
      <select bind:value={assetType} name="assetType" required disabled={isLoading} class="mt-1 block w-full">
        <option value="native">native</option>
        <option value="alphanumeric4">Alphanumeric 4</option>
        <option value="alphanumeric12">Alphanumeric 12</option>
      </select>
    </label>

    {#if !(assetType === 'native')}
      <label for="assetCode" class="block">
        Asset Code
        <Input
          type="text"
          name="assetCode"
          required
          disabled={isLoading}
          maxlength={assetType === 'alphanumeric4' ? 4 : 12}
        />
      </label>
      <label for="issuerAccount" class="block">
        Asset Issuer Account
        <Input type="text" name="issuerAccount" required disabled={isLoading} maxlength={56} />
      </label>
    {/if}

    <label for="amount" class="block">
      Amount
      <Input type="number" value="0" name="amount" required disabled={isLoading} />
    </label>

    <label for="claimants">
      Claimants
      <div class="flex flex-col">
        <button
          type="button"
          on:click={() => updateClaimants('add')}
          class="bg-green-500 hover:bg-green-600 text-white py-2 px-4 border border-green-500 w-10/12 mx-2 rounded transition duration-200 ease-in-out mb-4"
        >
          Add Claimant
        </button>
        {#each Array(totalClaimants) as _, i}
          <div id={`claimant${i}`} class="mb-4 border border-black p-4 shadow-md">
            <h2><bold>Claimant {i + 1}</bold></h2>
            <label for={`destinationClaimant${i}`}>
              Destination
              <Input type="text" name={`destinationClaimant${i}`} required disabled={isLoading} />
            </label>
            <label for={`predicateClaimant${i}`} class="block">
              Predicate
              <select name={`predicateClaimant${i}`} required disabled={isLoading} class="mt-1 block w-full">
                <option value="unconditional">Unconditional</option>
                <option value="conditional">Conditional</option>
              </select>
            </label>
            <button
              type="button"
              on:click={() => updateClaimants('remove')}
              class="mt-4 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
            >
              Remove
            </button>
          </div>
        {/each}
      </div>
    </label>
    <Button label="Submit" disabled={isLoading} />
  </form>
</div>
