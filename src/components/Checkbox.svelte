<script lang="ts">
  export let label = '';
  export let checked = false;
  export let disabled = false;
  export let dataCy = '';
</script>

<label class="block mb-2">
  <input data-cy={dataCy} type="checkbox" {disabled} bind:checked />
  {label}
</label>
