<script lang="ts">
  export let label = '';
  export let value = 0;
  export let id = '';
</script>

<label class="block mb-2" for={id}>{label}</label>
<input {id} type="number" bind:value class="border-2 border-black rounded mb-2" />
