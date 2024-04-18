<script lang="ts">
  export let tag: 'h1' | 'h2' | 'h3' = 'h1';

  const tagStyles = {
    h1: 'text-2xl',
    h2: 'text-xl',
    h3: 'text-lg'
  };
</script>

<svelte:element this="h1" class={tagStyles[tag]}><slot /></svelte:element>
