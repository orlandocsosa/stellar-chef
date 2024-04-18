<script lang="ts">
  import Button from '../base/Button.svelte';
  import Card from '../base/Card.svelte';

  export let publicKey: string;
  export let onClick: () => void;
</script>

<Card className="w-[650px] h-fit font-light">
  <h2 class="font-semibold text-2xl">Check claimable balances</h2>

  <div class="flex flex-col gap-3 mt-8">
    <h3 class="text-lg">Account</h3>

    <label>
      <p class="text-sm font-light text-black/50">Public Key</p>
      <input name="publicKey" type="text" class="w-full" bind:value={publicKey} />
    </label>
  </div>

  <Button className="h-10 text-lg mt-7" {onClick}>Find</Button>
</Card>
