<script lang="ts">
  import RadioOptions from '../salient/RadioOptions.svelte';

  export let group: 'deposit' | 'withdraw' = 'deposit';
</script>

<div>
  <RadioOptions
    bind:group
    options={[
      {
        label: 'Deposit',
        checked: group === 'deposit',
        value: 'deposit'
      },
      {
        label: 'Withdraw',
        checked: group === 'withdraw',
        value: 'withdraw'
      }
    ]}
  />
</div>
