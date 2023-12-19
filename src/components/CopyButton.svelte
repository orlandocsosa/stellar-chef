<script lang="ts">
  export let textToCopy: string | number;

  function copyToClipboard() {
    navigator.clipboard.writeText(textToCopy.toString());
  }
</script>

<button
  on:click={copyToClipboard}
  class="ml-2 p-1 text-xs rounded text-black hover:bg-gray-200 transform translate-y-[-2px]">Copy</button
>
