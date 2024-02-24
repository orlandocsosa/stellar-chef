<script lang="ts">
  import { xdr } from 'stellar-sdk';
  import type { IPredicate } from '../../services/stellar/types';
  import RadioOptions from '../salient/RadioOptions.svelte';

  export let title = '';
  export let previousPredicate = '';
  export let predicate: IPredicate;
  export let nestedLevel = 0;

  let conditional: boolean;
  let selectedPredicate: string;
  let timeType: 'relative' | 'absolute' | null;
  let timeValue: number | null;

  function setPredicate(type: string) {
    clearObject(predicate);
    predicate.type = type;

    if (type === 'conditional') {
      predicate.type = '';
      conditional = true;
    }

    if (type === 'unconditional') {
      conditional = false;
    }

    if (type === 'and' || type === 'or') {
      predicate.predicates = [{ type: '' }, { type: '' }];
    }

    if (type === 'not') {
      predicate.predicates = [{ type: '' }];
    }

    if (type === 'time') {
      timeType = null;
    }
  }

  function clearObject(data: object) {
    Object.keys(data).forEach((key) => {
      delete data[key as keyof typeof data];
    });
  }

  $: if (selectedPredicate) {
    setPredicate(selectedPredicate);
  }

  $: if (timeType) {
    timeValue = null;
    predicate.time = {
      type: timeType
    };
  }

  $: if (timeValue && predicate.time) {
    predicate.time.value = new xdr.Int64(timeValue);
  }
</script>

<div class="flex flex-col">
  <h3>{title}</h3>

  <div class="flex flex-row justify-center text-sm mt-5">
    <RadioOptions
      bind:group={selectedPredicate}
      options={[
        { label: 'Conditional', value: 'conditional', checked: conditional },
        { label: 'Unconditional', value: 'unconditional', checked: conditional === false }
      ]}
    />
  </div>

  {#if conditional}
    <div class="flex flex-row justify-center text-sm mt-5">
      <RadioOptions
        bind:group={selectedPredicate}
        options={[
          { label: 'Time', value: 'time', checked: selectedPredicate === 'time' },
          { label: 'AND', value: 'and', checked: selectedPredicate === 'and', disabled: nestedLevel >= 2 },
          { label: 'OR', value: 'or', checked: selectedPredicate === 'or', disabled: nestedLevel >= 2 },
          { label: 'NOT', value: 'not', checked: selectedPredicate === 'not', disabled: nestedLevel >= 2 }
        ]}
      />
    </div>
  {/if}

  {#if conditional && selectedPredicate === 'time'}
    <div class="flex flex-row justify-center text-sm mt-5">
      <RadioOptions
        bind:group={timeType}
        options={[
          { label: 'Relative', value: 'relative', checked: timeType === 'relative' },
          { label: 'Absolute', value: 'absolute', checked: timeType === 'absolute' }
        ]}
      />
    </div>

    {#if timeType}
      <label class="flex flex-col justify-start items-center m-auto mt-5">
        <p>Value</p>
        <input type="number" bind:value={timeValue} class="w-48" />
      </label>
    {/if}

    {#if timeType === 'relative'}
      <p class="w-48 m-auto mt-7 text-gray-600">
        A relative deadline for when the claimable balance can be claimed. The value represents the number of seconds
        since the close time of the ledger which created the claimable balance.
      </p>
    {/if}

    {#if timeType === 'absolute'}
      <p class="w-48 m-auto mt-7 text-gray-600">
        Unix epoch as a string representing a deadline for when the claimable balance can be claimed. If the balance is
        claimed before the date then this clause of the condition is satisfied.
      </p>
    {/if}
  {/if}

  {#key conditional && selectedPredicate}
    <div class="flex {nestedLevel === 1 ? 'flex-col' : 'flex-row'} justify-around mt-10 gap-10">
      {#if predicate.predicates}
        <svelte:self
          predicate={predicate.predicates[0]}
          previousPredicate={selectedPredicate}
          nestedLevel={nestedLevel + 1}
          title={previousPredicate
            ? `${previousPredicate.toUpperCase()}:${selectedPredicate.toUpperCase()} Predicate 1`
            : `${selectedPredicate.toUpperCase()} Predicate 1`}
        />

        {#if selectedPredicate !== 'not'}
          <svelte:self
            predicate={predicate.predicates[1]}
            previousPredicate={selectedPredicate}
            nestedLevel={nestedLevel + 1}
            title={previousPredicate
              ? `${previousPredicate.toUpperCase()}:${selectedPredicate.toUpperCase()} Predicate 2`
              : `${selectedPredicate.toUpperCase()} Predicate 2`}
          />
        {/if}
      {/if}
    </div>
  {/key}
</div>
