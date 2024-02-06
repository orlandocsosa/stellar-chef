<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  import { buildCreateAccountOperation } from '../../services/stellar/operations/createAccount';
  import Input from '../Input.svelte';
  import Button from '../Button.svelte';

  const dispatch = createEventDispatcher();

  function handleSubmit(event: Event) {
    event.preventDefault();
    const formData = new FormData(event.target as HTMLFormElement);
    const operation = buildCreateAccountOperation(formData);
    dispatch('formSubmission', { operation });
  }
</script>

<form on:submit={handleSubmit}>
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
