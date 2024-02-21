<script lang="ts">
  import Input from '../Input.svelte';
  import Button from '../Button.svelte';

  export let onSubmit: (event: Event) => void;
  export let sponsorPublicKey = '';
  export let sponsoredPublicKey = '';
  export let isLoading = false;
</script>

<form on:submit={onSubmit}>
  <label for="sponsorAccount">
    Sponsor Account
    <Input bind:value={sponsorPublicKey} readonly name="sponsorAccount" required />
  </label>

  <label for="sponsoredAccount">
    Sponsored Account
    <Input bind:value={sponsoredPublicKey} readonly name="sponsoredAccount" required />
  </label>

  <label for="assetCode">
    Asset Code
    <Input name="assetCode" required maxlength={12} />
  </label>

  <label for="limit">
    Limit
    <input type="number" name="limit" />
  </label>

  <div class="flex justify-center p-4">
    <Button label="Submit" disabled={isLoading} />
  </div>
</form>
