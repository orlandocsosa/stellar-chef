<script lang="ts">
  import Input from '../Input.svelte';
  import Button from '../Button.svelte';

  export let onSubmit: (event: Event) => void;
</script>

<form on:submit={onSubmit}>
  <label for="sponsorAccount">
    Sponsor Account
    <Input name="sponsorAccount" required />
  </label>

  <label for="sponsoreeAccount">
    Sponsoree Account
    <Input name="sponsoreeAccount" required />

    <label for="assetCode">
      Asset Code
      <Input name="assetCode" required />
    </label>

    <label for="limit">
      Limit
      <input type="number" name="limit" />
    </label>
    <Button label="Submit" />
  </label>
</form>
