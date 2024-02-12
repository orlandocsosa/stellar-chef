<script lang="ts">
  import { Asset, Claimant, Operation } from 'stellar-sdk';
  import ClaimantComponent from '../../components/claimant/Claimant.svelte';
  import type { PredicateType } from '../../services/stellar/claimants/predicateFactory';
  import createPredicate from '../../services/stellar/claimants/predicateFactory';

  let claimants: PredicateType[] = [];

  function addClaimant() {
    claimants.push({ predicate: undefined });
    claimants = claimants;
  }

  function handleOnSubmit() {
    const createdClaimants = claimants.map((claimant) => {
      return new Claimant('GALOKSSOICIGGPDIIWZ5IYN2KTYXKT57X2I22TE24DFOMQJP5GNTOWFY', createPredicate(claimant));
    });

    Operation.createClaimableBalance({
      amount: '1000',
      asset: Asset.native(),
      claimants: createdClaimants
    });

    console.log(createdClaimants);
  }
</script>

<form>
  <button on:click={addClaimant}>Add claimant</button>

  {#each claimants as claimant, i}
    <p>{'claimant' + i}</p>
    <ClaimantComponent {claimant} />
  {/each}

  <button type="button" on:click={handleOnSubmit}> Submit </button>
</form>
