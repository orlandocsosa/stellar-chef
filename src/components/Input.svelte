<script lang="ts">
  export let value: string | number;
  export let id: string;
  export let disabled: boolean = false;
  export let readonly: boolean = false;
  export let type: string = 'text';
  export let hasToAcceptSpaces: boolean = false;
  export let maxlength: number = 50;

  function handleSpaces(event: Event & { currentTarget: HTMLInputElement }) {
    value = event.currentTarget.value;
    if (!hasToAcceptSpaces) {
      value = value.toString().replace(/\s/g, '');
    }
  }
</script>

<input
  {id}
  {value}
  on:input={handleSpaces}
  {type}
  {disabled}
  {readonly}
  {maxlength}
  class={type === 'text' ? 'mb-4 border-4 w-full p-2 border-black' : 'mb-2 border-2 rounded'}
/>
