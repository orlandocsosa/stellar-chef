<script lang="ts">
  import { xdr } from 'stellar-sdk';
  import { type Claimant } from '../../utils/stores/claimant';

  export let claimant: Claimant;
  export let isFirstNested = false;
  export let isSecondNested = false;

  interface ITime {
    type: 'relative' | 'absolute' | undefined;
    value: string;
  }

  let time: ITime = {
    type: undefined,
    value: ''
  };

  function setTimeType(type: ITime['type']) {
    time.type = type;
  }

  $: if (time) {
    if (isFirstNested && 'firstPredicate' in claimant.predicate) {
      claimant.predicate.firstPredicate = { type: 'time', timeType: time.type, value: new xdr.Int64(time.value) };
    } else if (isSecondNested && 'secondPredicate' in claimant.predicate) {
      claimant.predicate.secondPredicate = { type: 'time', timeType: time.type, value: new xdr.Int64(time.value) };
    } else {
      claimant.predicate = { type: 'time', timeType: time.type, value: new xdr.Int64(time.value) };
    }
  }
</script>

<div class="flex m-2 justify-between space-x-4">
  <p>Time type:</p>

  <div class="flex flex-col bg-gray-200">
    <button
      type="button"
      class={time.type === 'relative'
        ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
        : 'bg-gray-200 hover:bg-gray-300'}
      on:click={() => setTimeType('relative')}>Relative</button
    >
    <button
      type="button"
      class={time.type === 'absolute'
        ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
        : 'bg-gray-200 hover:bg-gray-300'}
      on:click={() => setTimeType('absolute')}>Absolute</button
    >
    <input type="number" class="w-32 h-7" min="0" bind:value={time.value} />
  </div>
</div>
