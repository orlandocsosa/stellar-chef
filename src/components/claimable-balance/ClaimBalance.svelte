<script lang="ts">
  import Button from '../base/Button.svelte';
  import Card from '../base/Card.svelte';

  export let balanceId: string;
  export let secretKey: string;
  export let onClick: () => void;
</script>

<Card>
  <h2 class="font-semibold text-2xl mb-8 mt-7">Claim balance</h2>

  <div class="flex flex-col gap-3">
    <label>
      <p class="text-sm font-light text-black/50">Claimable Balance ID</p>
      <input name="claimableBalanceId" type="text" class="w-full" bind:value={balanceId} />
    </label>

    <label>
      <p class="text-sm font-light text-black/50">Secret Key</p>
      <input name="secretKey" type="text" class="w-full" bind:value={secretKey} />
    </label>
  </div>

  <Button className="h-10 text-lg mt-7" {onClick}>Claim</Button>
</Card>
