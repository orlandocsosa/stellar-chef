<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();
  const colorVariants: { [key: string]: string } = {
    blue: 'bg-blue-600 active:bg-blue-800 active:text-blue-100 focus-visible:outline-blue-600 text-white',
    white:
      'bg-white text-slate-900 hover:bg-slate-50 active:bg-slate-200 active:text-slate-600 focus-visible:outline-white border border-slate-200'
  };

  export let color = 'blue';
  export let className = '';
  export let value: string | number | null;
  export let emptyOptionText = '';

  $: if (value) {
    dispatch('selected', value);
  }
</script>

<select
  bind:value
  class="{colorVariants[
    color
  ]} {className} text-sm font-light group inline-flex items-center justify-center rounded-full py-1 px-4 focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2"
>
  {#if emptyOptionText}
    <option class="bg-white text-black" value={null}>{emptyOptionText}</option>
  {/if}
  <slot />
</select>
