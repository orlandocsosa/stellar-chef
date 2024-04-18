<script lang="ts">
  let className = '';
  export { className as class };
</script>

<span class="{className} text-gray-400">
  <slot />
</span>
