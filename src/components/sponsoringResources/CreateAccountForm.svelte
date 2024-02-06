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
  </label>
  <br />
  <label for="startingBalance">
    Starting Balance
    <Input name="startingBalance" required />
  </label>

  <Button label="Submit" />
</form>
