<script lang="ts">
  import Input from '../Input.svelte';
  import Button from '../Button.svelte';

  export let sponsorPublicKey = '';
  export let sponsoreePublicKey = '';
  export let isLoading = false;

  export let onSubmit: (event: Event) => void;
</script>

<form on:submit={onSubmit}>
  <label for="sponsorAccount">
    Sponsor Account
    <Input bind:value={sponsorPublicKey} readonly name="sponsorAccount" required />
  </label>

  <label for="sponsoreeAccount">
    Sponsoree Account
    <Input bind:value={sponsoreePublicKey} readonly name="sponsoreeAccount" required />
  </label>

  <label for="entryName">
    Entry Name
    <Input name="entryName" required disabled={isLoading} allowOnlyAlphanumeric={false} maxlength={64} />
  </label>

  <label for="entryValue">
    Entry Value
    <Input name="entryValue" disabled={isLoading} allowOnlyAlphanumeric={false} maxlength={64} />
  </label>

  <Button label="Submit" disabled={isLoading} />
</form>
