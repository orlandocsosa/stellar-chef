<script lang="ts">
  import Label from '../Label.svelte';
  import Button from '../salient/Button.svelte';

  export let onWithdraw: (sharesAmount: string) => Promise<void>;
  export let isLoading = false;

  function handleOnWithdraw(e: Event) {
    const formData = new FormData(e.target as HTMLFormElement);
    onWithdraw(formData.get('sharesAmount') as string);
  }
</script>

<form class="flex flex-col gap-3" on:submit|preventDefault={handleOnWithdraw}>
  <Label>
    Shares to withdraw
    <input type="number" name="sharesAmount" />
  </Label>

  <Button className={isLoading ? 'animate-pulse' : ''} disabled={isLoading} type="submit">Withdraw</Button>
</form>
