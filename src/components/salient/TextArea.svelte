<script lang="ts">
  export let isError = false;
  export let value = '';
  export let title = 'Result:';
</script>

<p class="font-normal">{title}</p>
<textarea
  class="bg-gray-50 w-full px-2 py-1 border border-gray-200 rounded-md font-normal {isError
    ? 'text-red-600'
    : 'text-black'}"
  readonly={true}
  {value}
/>
