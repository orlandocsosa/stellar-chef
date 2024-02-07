<script lang="ts">
  import Input from '../Input.svelte';
  import Button from '../Button.svelte';

  export let sponsorPublicKey = '';
  export let sponsoreePublicKey = '';
  export let isLoading = false;

  export let onSubmit: (event: Event) => void;
</script>

<div class="flex flex-col items-center">
  <form on:submit={onSubmit}>
    <label for="sponsorAccount">
      Sponsor Account
      <Input bind:value={sponsorPublicKey} readonly name="sponsorAccount" required />
    </label>

    <label for="sponsoreeAccount">
      Sponsoree Account
      <Input bind:value={sponsoreePublicKey} readonly name="sponsoreeAccount" required />
    </label>

    <label for="startingBalance">
      Starting Balance
      <Input type="number" value="0" name="startingBalance" required disabled={isLoading} />
    </label>

    <div class="flex justify-center">
      <Button label="Submit" disabled={isLoading} />
    </div>
  </form>
</div>
