<script lang="ts">
  import { allowOnlyAlphanumeric as cleanInput } from '../utils';
  export let value: string | number = '';
  export let disabled: boolean = false;
  export let readonly: boolean = false;
  export let type: string = 'text';
  export let maxlength: number = 80;
  export let required: boolean = false;
  export let dataCy = '';
  export let name = '';
  export let allowOnlyAlphanumeric: boolean = true;

  const typeProp = {
    type
  };

  function updateValue(event: Event) {
    let inputValue = (event.target as HTMLInputElement).value;
    value = allowOnlyAlphanumeric ? cleanInput(inputValue) : inputValue;
  }
</script>

<input
  data-cy={dataCy}
  bind:value
  {...typeProp}
  {disabled}
  {readonly}
  {maxlength}
  {required}
  {name}
  class={type === 'text' ? 'mb-4 border-4 w-full p-2 border-black' : 'mb-2 ml-1 border-2 rounded'}
  on:input={updateValue}
/>
