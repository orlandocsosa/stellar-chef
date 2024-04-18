<script lang="ts">
  import type { Horizon } from 'stellar-sdk';
  import Card from '../base/Card.svelte';

  export let claimableBalances: Horizon.ServerApi.ClaimableBalanceRecord[];
</script>

<Card className="w-[650px] font-light">
  <div class="flex flex-col gap-10">
    {#each claimableBalances as { id, amount, asset, claimants }}
      <div class="flex flex-col gap-2 bg-gray-50 border border-gray-200 p-5 rounded-md">
        <p class="break-words">ID: <span class="text-gray-600">{id}</span></p>
        <p>Amount: <span class="text-gray-600">{amount}</span></p>
        <p class="break-words">Asset: <span class="text-gray-600">{asset}</span></p>

        {#each claimants as { destination, predicate }, i}
          <div class="flex flex-col gap-2">
            <p class="text-lg">
              Claimant #{i + 1}: <span class="text-gray-600 text-base break-words">{destination}</span>
            </p>

            <p>Predicate:</p>
            <pre class="text-gray-600 break-words">{JSON.stringify(predicate, null, 2)}</pre>
          </div>
        {/each}
      </div>
    {/each}
  </div>
</Card>
