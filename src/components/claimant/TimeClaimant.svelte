<script lang="ts">
  import type { ITimePredicate } from '../../services/stellar/claimants/predicateFactory';
  export let predicate: any;

  function setTimeType(type: ITimePredicate['timeType']) {
    predicate.timeType = type;
  }
</script>

<div class="flex m-2 justify-between space-x-4">
  <p>Time type:</p>

  <div class="flex flex-col bg-gray-200">
    <button
      type="button"
      class={predicate.timeType === 'relative'
        ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
        : 'bg-gray-200 hover:bg-gray-300'}
      on:click={() => setTimeType('relative')}>Relative</button
    >
    <button
      type="button"
      class={predicate.timeType === 'absolute'
        ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
        : 'bg-gray-200 hover:bg-gray-300'}
      on:click={() => setTimeType('absolute')}>Absolute</button
    >
    <input type="number" class="w-32 h-7" min="0" bind:value={predicate.value} />
  </div>
</div>
