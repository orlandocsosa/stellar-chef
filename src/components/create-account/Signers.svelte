<script lang="ts">
  import { onMount } from 'svelte';
  import { signers, addSigner, removeSigner } from '../../store/signers';
  import Span from '../Span.svelte';
  import Button from '../salient/Button.svelte';

  onMount(() => {
    $signers = [];
  });
</script>

<div>
  <button on:click={addSigner} class="text-blue-600 hover:text-blue-800">Add signer</button>

  {#each $signers as _signer, i}
    <div class="flex flex-row gap-3 mt-3 items-center">
      <p>Signer <Span>{i + 1}</Span></p>
      <Button color="white" className="h-7" onClick={() => removeSigner(i)}>Remove</Button>
    </div>

    <div class="mt-2 flex flex-col gap-3">
      <label>
        <Span class="text-sm">Public key</Span>
        <input class="w-full" type="text" bind:value={$signers[i].publicKey} />
      </label>

      <label>
        <Span class="text-sm">Weight</Span>
        <input class="w-full" type="number" placeholder="0 - 255" bind:value={$signers[i].weight} />
      </label>
    </div>
  {/each}
</div>
