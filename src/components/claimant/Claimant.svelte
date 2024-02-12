<script lang="ts">
  import { onMount } from 'svelte';
  import type { PredicateType } from '../../services/stellar/claimants/predicateFactory';
  import TimeClaimant from './TimeClaimant.svelte';

  export let claimant: PredicateType;
  export let isFirstNested = false;
  export let isSecondNested = false;
  export let nestedLevel = 0;

  let isConditional = false;
  let isTimeMenuVisible = false;
  let isAndMenuVisible = false;
  let isOrMenuVisible = false;
  let isNotMenuVisible = false;

  function toggleConditionalMenu() {
    isConditional = !isConditional;
  }

  function toggleTimeMenu() {
    isTimeMenuVisible = !isTimeMenuVisible;
  }

  function toggleAndMenu() {
    isAndMenuVisible = !isAndMenuVisible;
  }

  function toggleOrMenu() {
    isOrMenuVisible = !isOrMenuVisible;
  }

  function toggleNotMenu() {
    isNotMenuVisible = !isNotMenuVisible;
  }

  function setUnconditionalType() {
    claimant.predicate = 'unconditional';
  }

  function setTimePredicate() {
    claimant.predicate = 'time';
    toggleTimeMenu();
  }

  function setAndPredicate() {
    claimant.predicate = 'and';

    if (claimant.predicate === 'and') {
      claimant.firstPredicate = { predicate: undefined };
      claimant.secondPredicate = { predicate: undefined };
    }

    toggleAndMenu();
  }

  function setOrPredicate() {
    claimant.predicate = 'or';

    if (claimant.predicate === 'or') {
      claimant.firstPredicate = { predicate: undefined };
      claimant.secondPredicate = { predicate: undefined };
    }

    toggleOrMenu();
  }

  function setNotPredicate() {
    claimant.predicate = 'not';

    if (claimant.predicate === 'not') {
      claimant.firstPredicate = { predicate: undefined };
    }

    toggleNotMenu();
  }

  onMount(() => {
    if (isFirstNested && 'firstPredicate' in claimant) claimant = claimant.firstPredicate;
    if (isSecondNested && 'secondPredicate' in claimant) claimant = claimant.secondPredicate;
  });
</script>

<div class="flex flex-col items-center justify-center w-96">
  <div class="flex flex-col">
    <button on:click={() => setUnconditionalType()}>Unconditional</button>
    <button on:click={toggleConditionalMenu}>Conditional</button>

    {#if isConditional}
      <div class="flex gap-5">
        <button on:click={setTimePredicate}>Time</button>

        {#if nestedLevel < 2}
          <button on:click={setAndPredicate}>AND</button>
          <button on:click={setOrPredicate}>OR</button>
          <button on:click={setNotPredicate}>NOT</button>
        {/if}
      </div>
    {/if}
  </div>

  {#if isTimeMenuVisible && claimant.predicate === 'time'}
    <TimeClaimant {claimant} />
  {/if}

  {#if isAndMenuVisible && claimant.predicate === 'and'}
    <div class="flex flex-row">
      <svelte:self {claimant} isFirstNested={true} nestedLevel={nestedLevel + 1} />
      <svelte:self {claimant} isSecondNested={true} nestedLevel={nestedLevel + 1} />
    </div>
  {/if}

  {#if isOrMenuVisible && claimant.predicate === 'or'}
    <div class="flex flex-row">
      <svelte:self {claimant} isFirstNested={true} nestedLevel={nestedLevel + 1} />
      <svelte:self {claimant} isSecondNested={true} nestedLevel={nestedLevel + 1} />
    </div>
  {/if}

  {#if isNotMenuVisible && claimant.predicate === 'not'}
    <div class="flex flex-row">
      <svelte:self {claimant} isFirstNested={true} nestedLevel={nestedLevel + 1} />
    </div>
  {/if}
</div>
