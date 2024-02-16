<script lang="ts">
  import { onMount } from 'svelte';
  import type { PredicateType } from '../../services/stellar/claimants/predicateFactory';
  import TimeClaimant from './TimeClaimant.svelte';
  import { claimantsStore } from '../../utils/stores/claimantsStore';

  export let claimant: any;
  export let isFirstNested = false;
  export let isSecondNested = false;
  export let nestedLevel = 0;
  export let id = '';

  // $: {
  //   if (claimant) {
  //     const targetIndex = claimantsStore.update((c) => {
  //       const index = c.findIndex((item) => item.claimantNumber === parseInt(id, 10));
  //       if (index !== -1) {
  //         c[index].predicate = claimant;
  //       }
  //       return c;
  //     });
  //   }
  // }

  let predicateButtonSelected: 'conditional' | 'unconditional' | undefined = undefined;
  let isTimeMenuVisible = false;
  let isAndMenuVisible = false;
  let isOrMenuVisible = false;
  let isNotMenuVisible = false;
  function toggleConditionalMenu(type: 'conditional' | 'unconditional') {
    predicateButtonSelected = type;
  }
  function toggleTimeMenu() {
    isTimeMenuVisible = true;
  }
  function toggleAndMenu() {
    isAndMenuVisible = true;
  }
  function toggleOrMenu() {
    isOrMenuVisible = true;
  }
  function toggleNotMenu() {
    isNotMenuVisible = true;
  }
  function setUnconditionalType() {
    toggleConditionalMenu('unconditional');
    claimant = 'unconditional';
  }
  function setTimePredicate() {
    claimant = {
      predicate: 'time',
      timeType: undefined,
      value: undefined
    };
    toggleTimeMenu();
  }
  function setAndPredicate() {
    claimant = {
      predicate: 'and',
      firstPredicate: { predicate: undefined },
      secondPredicate: { predicate: undefined }
    };
    toggleAndMenu();
  }
  function setOrPredicate() {
    claimant = {
      predicate: 'or',
      firstPredicate: { predicate: undefined },
      secondPredicate: { predicate: undefined }
    };
    toggleOrMenu();
  }
  function setNotPredicate() {
    claimant = {
      predicate: 'not',
      firstPredicate: { predicate: undefined }
    };
    toggleNotMenu();
  }
  onMount(() => {
    if (isFirstNested && 'firstPredicate' in claimant) claimant = claimant.firstPredicate;
    if (isSecondNested && 'secondPredicate' in claimant) claimant = claimant.secondPredicate;
  });
</script>

<div {id} class=" border border-black rounded shadow-lg m-5 flex flex-col items-center justify-center">
  <div class="flex flex-col">
    <p class="ml-2">Predicate:</p>
    <div class="flex">
      <button
        type="button"
        class="m-2 rounded w-32 h-10 flex items-center justify-center {predicateButtonSelected === 'unconditional'
          ? 'bg-indigo-600 text-white hover:bg-indigo-700'
          : 'bg-gray-200 hover:bg-gray-300'}"
        on:click={() => {
          setUnconditionalType();
          toggleConditionalMenu('unconditional');
        }}
      >
        Unconditional
      </button>

      <button
        type="button"
        class="m-2 rounded w-32 h-10 flex items-center justify-center {predicateButtonSelected === 'conditional'
          ? 'bg-indigo-600 text-white hover:bg-indigo-700'
          : 'bg-gray-200 hover:bg-gray-300'}"
        on:click={() => {
          toggleConditionalMenu('conditional');
          claimant = { predicate: undefined };
        }}
      >
        Conditional
      </button>
    </div>
    {#if predicateButtonSelected === 'conditional'}
      Predicate Type:
      <div class="flex gap-5">
        <button
          type="button"
          class="px-4 py-2 rounded {claimant.predicate === 'time'
            ? 'bg-indigo-600 hover:bg-indigo-700 text-white '
            : 'bg-gray-200 hover:bg-gray-300'}"
          on:click={setTimePredicate}>Time</button
        >

        {#if nestedLevel < 2}
          <button
            type="button"
            class="px-4 py-2 rounded {claimant.predicate === 'and'
              ? 'bg-indigo-600 hover:bg-indigo-700 text-white  '
              : 'bg-gray-200 hover:bg-gray-300'}"
            on:click={setAndPredicate}>AND</button
          >
          <button
            type="button"
            class="px-4 py-2 rounded {claimant.predicate === 'or'
              ? 'bg-indigo-600 hover:bg-indigo-700 text-white '
              : 'bg-gray-200 hover:bg-gray-300'}"
            on:click={setOrPredicate}>OR</button
          >
          <button
            type="button"
            class="px-4 py-2 rounded {claimant.predicate === 'not'
              ? 'bg-indigo-600 hover:bg-indigo-700 text-white '
              : 'bg-gray-200 hover:bg-gray-300'}"
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
      <strong class="ml-5">
        {#if nestedLevel > 0} Nested {/if} Predicate 1:</strong
      >
      <svelte:self {claimant} isFirstNested={true} nestedLevel={nestedLevel + 1} />
      <strong class="ml-5">
        {#if nestedLevel > 0} Nested {/if} Predicate 2:</strong
      >
      <svelte:self {claimant} isSecondNested={true} nestedLevel={nestedLevel + 1} />
    </div>
  {/if}

  {#if isOrMenuVisible && claimant.predicate === 'or'}
    <div class="flex flex-col">
      <strong class="ml-5">
        {#if nestedLevel > 0} Nested {/if} Predicate 1:</strong
      >
      <svelte:self {claimant} isFirstNested={true} nestedLevel={nestedLevel + 1} />
      <strong class="ml-5">
        {#if nestedLevel > 0} Nested {/if} Predicate 2:</strong
      >
      <svelte:self {claimant} isSecondNested={true} nestedLevel={nestedLevel + 1} />
    </div>
  {/if}

  {#if isNotMenuVisible && claimant.predicate === 'not'}
    <div class="flex flex-col">
      <strong class="ml-5">Predicate:</strong>
      <svelte:self {claimant} isFirstNested={true} nestedLevel={nestedLevel + 1} />
    </div>
  {/if}
</div>
