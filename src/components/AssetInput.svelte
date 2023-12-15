<script lang="ts">
  export let value: string;
  export let label: string;
  export let id: string;

  function handleInput(event: Event & { currentTarget: HTMLInputElement }) {
    value = event.currentTarget.value.replace(/\s/g, '');
  }
</script>

<label for={id}>{label}</label>
<input {id} bind:value on:input={handleInput} class="w-full p-2 border-4 border-black mb-4" />
