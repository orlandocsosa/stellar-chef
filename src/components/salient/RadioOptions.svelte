<script lang="ts">
  export let group: string | boolean | null;
  export let options: {
    label: string;
    value: string | boolean;
    checked: boolean;
    disabled?: boolean;
  }[];
</script>

{#each options as { checked, label, value, disabled }}
  <label
    class="cursor-pointer py-2 px-2 border-black/20 border-[1px]
    first:rounded-l-full first:pl-3
    last:rounded-r-full last:pr-3
    {checked ? 'text-white bg-blue-600' : 'bg-slate-100'}
    {disabled && 'cursor-not-allowed text-black/50 bg-slate-100'}"
  >
    {label}
    <input type="radio" {value} name="predicate" class="hidden" bind:group {disabled} />
  </label>
{/each}
