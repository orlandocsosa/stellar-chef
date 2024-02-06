<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  import { buildChangeTrustOperation } from '../../services/stellar/operations/changeTrust';
  import Input from '../Input.svelte';
  import Button from '../Button.svelte';

  const dispatch = createEventDispatcher();

  function handleChangeTrustFormSubmit(event: Event) {
    event.preventDefault();
    const formData = new FormData(event.target as HTMLFormElement);
    const operation = buildChangeTrustOperation(formData);
    dispatch('formSubmission', { operation });
  }
</script>

<form on:submit={handleChangeTrustFormSubmit}>
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
