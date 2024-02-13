<script lang="ts">
  import Input from '../Input.svelte';
  import Button from '../Button.svelte';
  import Claimant from '../claimant/Claimant.svelte';

  export let sponsorPublicKey: string = '';
  export let sponsoreePublicKey: string = '';
  export let isLoading: boolean = false;

  export let onSubmit: (event: Event) => void;

  let assetType: string = 'native';
  let totalClaimants: number = 0;

  let claimants = [];

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
      <strong class="block text-lg mb-1"
        >Amount: <Input type="number" value="0" name="amount" required disabled={isLoading} />
      </strong>
    </label>

    <label for="claimants">
      <h2 class="text-xl font-bold mb-5 p-3">
        <span>Claimants</span>
      </h2>
      <div class="flex flex-col">
        <div class="flex flex-row justify-start">
          <button
            type="button"
            on:click={() => updateClaimants('add')}
            class="bg-green-500 hover:bg-green-600 text-white py-2 border border-green-500 w-20 mx-2 rounded transition duration-200 ease-in-out mb-4"
          >
            Add Claimant
          </button>
          <button
            type="button"
            on:click={() => updateClaimants('remove')}
            class:disabled={totalClaimants === 0}
            class="bg-red-500 hover:bg-red-600 text-white py-2 border border-red-500 w-20 mx-2 rounded transition duration-200 ease-in-out mb-4 {totalClaimants ===
            0
              ? 'opacity-50 cursor-not-allowed'
              : ''}"
            disabled={totalClaimants === 0}
          >
            Remove claimant
          </button>
        </div>
        {#each Array(totalClaimants) as _, i}
          <div class="flex flex-col border-4 m-1 p-1 border-black rounded shadow-lg">
            <strong>Claimant {i + 1}</strong>
            <label for="destination" class="block">
              Destination
              <Input type="text" name="destination" required disabled={isLoading} maxlength={56} />
            </label>
            <Claimant
              claimant={{ predicate: undefined }}
              isFirstNested={false}
              isSecondNested={false}
              nestedLevel={0}
              id={`claimant${i + 1}`}
            />
          </div>
        {/each}
      </div>
    </label>
    <Button label="Submit" disabled={isLoading} />
  </form>
</div>
