<script lang="ts">
  const colorVariants: { [key: string]: string } = {
    blue: 'bg-blue-600 hover:bg-blue-500 active:bg-blue-800 active:text-blue-100 focus-visible:outline-blue-600 hover:text-slate-100 text-white',
    white:
      'bg-white text-slate-900 hover:bg-slate-50 active:bg-slate-200 active:text-slate-600 focus-visible:outline-white border border-slate-200'
  };

  export let color = 'blue';
  export let onClick = () => {};
  export let className = '';
  export let type: 'button' | 'submit' = 'button';
</script>

<button
  {type}
  on:click={onClick}
  class="{colorVariants[
    color
  ]} {className} font-light group inline-flex items-center justify-center rounded-full py-2 px-4 focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2"
>
  <slot />
</button>
