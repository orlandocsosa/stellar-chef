<script lang="ts">
  export let checked = false;
</script>

<label>
  <p
    class="{checked ? 'text-blue-600 border-blue-600' : 'text-gray-600 border-gray-200'} 
      border-2 rounded-full py-1 px-2 cursor-pointer"
  >
    Native
  </p>
  <input class="hidden" type="checkbox" bind:checked />
</label>
