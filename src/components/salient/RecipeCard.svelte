<script lang="ts">
  export let title = '';
  export let link = '';
  export let description = '';
</script>

<li class="bg-gray-50 border border-gray-200 rounded-md p-3">
  <h3 class="text-xl"><a href={link}>{title}</a></h3>
  <p class="text-gray-600">{description}</p>
</li>
