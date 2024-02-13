<script lang="ts">
  import { onMount } from 'svelte';
  import type { PredicateType } from '../../services/stellar/claimants/predicateFactory';
  import TimeClaimant from './TimeClaimant.svelte';
  export let claimant: PredicateType;
  export let isFirstNested = false;
  export let isSecondNested = false;
  export let nestedLevel = 0;
  export let id = '';

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
    toggleConditionalMenu();
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

<div {id} class=" border border-black rounded shadow-lg m-5 flex flex-col items-center justify-center">
  <div class="flex flex-col">
    <div class="flex">
      <button
        type="button"
        class="m-2 rounded w-32 h-10 flex items-center justify-center {!isConditional
          ? 'bg-blue-600 text-white '
          : 'bg-gray-200'}"
        on:click={() => setUnconditionalType()}>Unconditional</button
      >

      <button
        type="button"
        class="m-2 rounded w-32 h-10 flex items-center justify-center {isConditional
          ? 'bg-blue-600 text-white '
          : 'bg-gray-200'}"
        on:click={toggleConditionalMenu}>Conditional</button
      >
    </div>

    {#if isConditional}
      <div class="flex gap-5">
        <button
          type="button"
          class="px-4 py-2 rounded {claimant.predicate === 'time' ? 'bg-blue-600 text-white ' : 'bg-gray-200'}"
          on:click={setTimePredicate}>Time</button
        >

        {#if nestedLevel < 2}
          <button
            type="button"
            class="px-4 py-2 rounded {claimant.predicate === 'and' ? 'bg-blue-600 text-white ' : 'bg-gray-200'}"
            on:click={setAndPredicate}>AND</button
          >
          <button
            type="button"
            class="px-4 py-2 rounded {claimant.predicate === 'or' ? 'bg-blue-600 text-white ' : 'bg-gray-200'}"
            on:click={setOrPredicate}>OR</button
          >
          <button
            type="button"
            class="px-4 py-2 rounded {claimant.predicate === 'not' ? 'bg-blue-600 text-white ' : 'bg-gray-200'}"
            on:click={setNotPredicate}>NOT</button
          >
        {/if}
      </div>
    {/if}
  </div>

  {#if isTimeMenuVisible && claimant.predicate === 'time'}
    <TimeClaimant {claimant} />
  {/if}

  {#if isAndMenuVisible && claimant.predicate === 'and'}
    <div class="flex flex-col">
      <strong
        >{#if nestedLevel > 0} Nested {/if} Predicate 1:</strong
      >
      <svelte:self {claimant} isFirstNested={true} nestedLevel={nestedLevel + 1} />
      <strong
        >{#if nestedLevel > 0} Nested {/if} Predicate 2:</strong
      >
      <svelte:self {claimant} isSecondNested={true} nestedLevel={nestedLevel + 1} />
    </div>
  {/if}

  {#if isOrMenuVisible && claimant.predicate === 'or'}
    <div class="flex flex-col">
      <strong>
        {#if nestedLevel > 0} Nested {/if} Predicate 1:</strong
      >
      <svelte:self {claimant} isFirstNested={true} nestedLevel={nestedLevel + 1} />
      <strong
        >{#if nestedLevel > 0} Nested {/if} Predicate 2:</strong
      >
      <svelte:self {claimant} isSecondNested={true} nestedLevel={nestedLevel + 1} />
    </div>
  {/if}

  {#if isNotMenuVisible && claimant.predicate === 'not'}
    <div class="flex flex-col">
      <strong>Predicate:</strong>
      <svelte:self {claimant} isFirstNested={true} nestedLevel={nestedLevel + 1} />
    </div>
  {/if}
</div>
