<script lang="ts">
  import Button from '../salient/Button.svelte';
  import Label from '../Label.svelte';

  export let onSearchLiquidityPool: (id: string) => {};
  export let isLoading = false;

  function handleOnSubmit(e: Event) {
    const formData = new FormData(e.target as HTMLFormElement);
    const liquidityPoolId = formData.get('id');
    onSearchLiquidityPool(liquidityPoolId as string);
  }
</script>

<form class="flex flex-col gap-5" on:submit|preventDefault={handleOnSubmit}>
  <Label>
    Search Liquidity Pool by ID
    <input type="text" name="id" />
  </Label>

  <Button className={isLoading ? 'animate-pulse' : ''} disabled={isLoading} type="submit">Search</Button>
</form>
