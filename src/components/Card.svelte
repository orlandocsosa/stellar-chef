<script lang="ts">
  export let title: string;
  export let content = '';
</script>

<div class="border-4 border-black w-72 mx-2 bg-gray-100 shadow-lg mt-5 rounded overflow-auto h-600px">
  <h1 class="text-xl font-bold mb-5 bg-indigo-500 text-white p-5">{title}</h1>
  <div class="p-2">
    <p>{content}</p>
    <slot />
  </div>
</div>
