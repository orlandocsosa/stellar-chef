<script lang="ts">
  export let label = '';
  export let checked = false;
  export let id = '';
</script>

<label class="block mb-2">
  <input {id} type="checkbox" bind:checked />
  {label}
</label>
