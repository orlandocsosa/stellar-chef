<script lang="ts">
  export let label = '';
  export let onClick = () => {};
  export let disabled = false;
  export let dataCy = '';
</script>

<button
  data-cy={dataCy}
  {disabled}
  class="bg-indigo-500 hover:bg-indigo-600 text-white py-2 px-4 border border-indigo-500 w-10/12 mx-2 rounded transition duration-200 ease-in-out"
  on:click={onClick}
>
  {label}
</button>
