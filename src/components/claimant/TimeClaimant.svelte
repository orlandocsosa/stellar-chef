<script lang="ts">
  import type { ITimePredicate } from '../../services/stellar/claimants/predicateFactory';

  export let claimant: ITimePredicate;

  function setTimeType(type: ITimePredicate['timeType']) {
    claimant.timeType = type;
  }
</script>

<button on:click={() => setTimeType('relative')}>Relative</button>
<button on:click={() => setTimeType('absolute')}>Absolute</button>
<input type="number" bind:value={claimant.value} />
