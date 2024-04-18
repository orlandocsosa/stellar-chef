<script lang="ts">
  import type IAsset from '../../services/asset/IAsset';
  import { sliceString } from '../../utils';
  import Select from '../base/Select.svelte';

  export let value: number | null = null;
  export let assets: IAsset[];
</script>

<Select className="h-8" color={value !== null ? 'blue' : 'white'} emptyOptionText="Select a stored asset" bind:value>
  {#each assets as { code, issuer }, i}
    <option class="bg-white text-black" value={i}>{`${code}|${sliceString(issuer)}`}</option>
  {/each}
</Select>
