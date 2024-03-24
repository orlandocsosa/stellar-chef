<script lang="ts">
  export let href: string;
  export let target = '_blank';
</script>

<a class="text-blue-500 hover:text-blue-800" {href} {target}>
  <slot />
</a>
