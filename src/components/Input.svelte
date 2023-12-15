<script lang="ts">
  export let id: string;
  export let value: string;
  export let label: string;
  export let readonly: boolean = false;
</script>

<div>
  <label for={id} class="block mb-2">{label}:</label>
  <input {id} type="text" bind:value class="w-full p-2 border-4 border-black mb-4" {readonly} />
</div>
