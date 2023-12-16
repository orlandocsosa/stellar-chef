<script lang="ts">
  export let value: string | number;
  export let id: string;
  export let disabled: boolean = false;
  export let readonly: boolean = false;
  export let type: string = 'text';

  function handleInput(event: Event & { currentTarget: HTMLInputElement }) {
    if (type === 'number') {
      value = parseFloat(event.currentTarget.value);
    } else {
      value = event.currentTarget.value.toString().replace(/\s/g, '');
    }
  }
</script>

{#if type === 'text'}
  <input
    {id}
    bind:value
    on:input={handleInput}
    type="text"
    {disabled}
    {readonly}
    class="w-full p-2 border-4 border-black mb-4"
  />
{:else if type === 'number'}
  <input
    {id}
    bind:value
    on:input={handleInput}
    type="number"
    {disabled}
    {readonly}
    class="border-2 border-black rounded mb-2"
  />
{/if}
