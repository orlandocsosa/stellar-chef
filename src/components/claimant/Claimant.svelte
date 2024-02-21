<script lang="ts">
  import type { PredicateType } from '../../services/stellar/claimants/predicateFactory';
  import TimeClaimant from './TimeClaimant.svelte';
  import { type Claimant } from '../../utils/stores/claimantsStore';

  export let claimant: Claimant;
  export let isFirstNested = false;
  export let isSecondNested = false;
  export let nestedLevel = 0;
  export let id = '';

  let predicateButtonSelected: 'conditional' | 'unconditional' | undefined = undefined;
  let menus = {
    and: false,
    or: false,
    not: false,
    time: false
  };

  function toggleConditionalMenu(type: 'conditional' | 'unconditional') {
    predicateButtonSelected = type;
  }

  function togglePredicateMenu(key: string) {
    for (const menu in menus) {
      menus[menu as keyof typeof menus] = false;
    }

    menus[key as keyof typeof menus] = true;
  }

  function updatePredicate(type: PredicateType['type']): PredicateType {
    switch (type) {
      case 'unconditional':
        return {
          type
        };

      case 'and':
        return {
          type,
          firstPredicate: { type: undefined },
          secondPredicate: { type: undefined }
        };

      case 'or':
        return {
          type,
          firstPredicate: { type: undefined },
          secondPredicate: { type: undefined }
        };

      case 'not':
        return {
          type,
          firstPredicate: { type: undefined }
        };

      case 'time':
        return {
          type,
          timeType: undefined,
          value: undefined
        };
      default:
        return {
          type: undefined
        };
    }
  }

  function updateClaimant(predicate: PredicateType) {
    if (isFirstNested && 'firstPredicate' in claimant.predicate) {
      claimant.predicate.firstPredicate = predicate;
      return;
    }

    if (isSecondNested && 'secondPredicate' in claimant.predicate) {
      claimant.predicate.secondPredicate = predicate;
      return;
    }

    claimant.predicate = predicate;
  }
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
          updateClaimant(updatePredicate('unconditional'));
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
          class="px-4 py-2 rounded {menus.time
            ? 'bg-indigo-600 hover:bg-indigo-700 text-white '
            : 'bg-gray-200 hover:bg-gray-300'}"
          on:click={() => {
            updateClaimant(updatePredicate('time'));
            togglePredicateMenu('time');
          }}
        >
          Time
        </button>

        {#if nestedLevel < 2}
          <button
            type="button"
            class="px-4 py-2 rounded {menus.and
              ? 'bg-indigo-600 hover:bg-indigo-700 text-white  '
              : 'bg-gray-200 hover:bg-gray-300'}"
            on:click={() => {
              updateClaimant(updatePredicate('and'));
              togglePredicateMenu('and');
            }}
          >
            AND
          </button>
          <button
            type="button"
            class="px-4 py-2 rounded {menus.or
              ? 'bg-indigo-600 hover:bg-indigo-700 text-white '
              : 'bg-gray-200 hover:bg-gray-300'}"
            on:click={() => {
              updateClaimant(updatePredicate('or'));
              togglePredicateMenu('or');
            }}
          >
            OR
          </button>
          <button
            type="button"
            class="px-4 py-2 rounded {menus.not
              ? 'bg-indigo-600 hover:bg-indigo-700 text-white '
              : 'bg-gray-200 hover:bg-gray-300'}"
            on:click={() => {
              updateClaimant(updatePredicate('not'));
              togglePredicateMenu('not');
            }}
          >
            NOT
          </button>
        {/if}
      </div>
    {/if}
  </div>

  {#if menus.time}
    <TimeClaimant {claimant} {isFirstNested} {isSecondNested} />
  {/if}

  {#if menus.or}
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

  {#if menus.and}
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

  {#if menus.not}
    <div class="flex flex-col">
      <strong class="ml-5">Predicate:</strong>
      <svelte:self {claimant} isFirstNested={true} nestedLevel={nestedLevel + 1} />
    </div>
  {/if}
</div>
