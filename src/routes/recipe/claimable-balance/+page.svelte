<script lang="ts">
  import { Asset, Operation, Claimant as StellarClaimant, Keypair, Horizon } from 'stellar-sdk';
  import Card from '../../../components/salient/Card.svelte';
  import Claimant from '../../../components/claimable-balance/Claimant.svelte';
  import createPredicate from '../../../services/stellar/predicateFactory';
  import { claimants } from '../../../store/claimants';
  import { buildTransaction, findClaimableBalance, server } from '../../../services/stellar/utils';
  import CheckClaimableBalance from '../../../components/claimable-balance/CheckClaimableBalance.svelte';
  import ClaimBalance from '../../../components/claimable-balance/ClaimBalance.svelte';
  import TextArea from '../../../components/salient/TextArea.svelte';
  import ClaimableBalancesRecords from '../../../components/claimable-balance/ClaimableBalancesRecords.svelte';
  import CreateClaimableBalance from '../../../components/claimable-balance/CreateClaimableBalance.svelte';

  let isNative = false;
  let findClaimableBalancePublicKey: string;
  let findClaimableBalanceSecretKey: string;
  let balanceId: string;
  let claimableBalances: Horizon.ServerApi.ClaimableBalanceRecord[] = [];
  let textArea = {
    value: '',
    isError: false,
    transaction: ''
  };

  function removeClaimant(index: number) {
    $claimants = $claimants.filter((_, i) => i !== index);
  }

  async function handleFindClaimableBalances() {
    claimableBalances = await findClaimableBalance(findClaimableBalancePublicKey);
  }

  async function handleClaimClaimableBalance() {
    textArea.isError = false;
    textArea.transaction = 'claim';

    try {
      const operation = Operation.claimClaimableBalance({
        balanceId
      });
      const keypair = Keypair.fromSecret(findClaimableBalanceSecretKey);
      const transaction = buildTransaction(await server.loadAccount(keypair.publicKey()), [operation]);

      transaction.sign(keypair);
      const result = await server.submitTransaction(transaction);
      textArea.value = result.successful ? 'Transaction successfully submitted' : 'Transaction failed';
    } catch (error) {
      textArea.isError = true;
      textArea.value = `${error}`;
    }
  }

  async function handleCreateClaimableBalance(e: SubmitEvent & { currentTarget: EventTarget & HTMLFormElement }) {
    textArea.isError = false;
    textArea.transaction = 'create';

    try {
      const formData = new FormData(e.currentTarget);
      let obj: Record<string, string> = {};

      for (const [key, value] of formData.entries()) {
        obj[key] = value.toString();
      }

      const keypair = Keypair.fromSecret(obj.secret);
      const operation = Operation.createClaimableBalance({
        amount: obj.amount,
        asset: isNative ? Asset.native() : new Asset(obj.code, obj.issuer),
        claimants: $claimants.map(
          (claimant) => new StellarClaimant(claimant.destination, createPredicate(claimant.predicate))
        )
      });

      const transaction = buildTransaction(await server.loadAccount(keypair.publicKey()), [operation]);
      transaction.sign(keypair);

      const result = await server.submitTransaction(transaction);
      textArea.value = result.successful ? 'Transaction successfully submitted' : 'Transaction failed';
    } catch (error) {
      textArea.isError = true;
      textArea.value = `${error}`;
    }
  }
</script>

<div class="flex justify-center">
  <div class="grid grid-cols-2 gap-10 max-lg:grid-cols-1">
    <form on:submit|preventDefault={handleCreateClaimableBalance}>
      <CreateClaimableBalance bind:isNative>
        <div class="w-full mt-8">
          <TextArea isError={textArea.isError} value={textArea.transaction === 'create' ? textArea.value : ''} />
        </div>
      </CreateClaimableBalance>

      {#each $claimants as claimant, i}
        <Card className="mt-5">
          <Claimant {claimant} index={i} onRemoveClaimant={() => removeClaimant(i)} />
        </Card>
      {/each}
    </form>

    <div class="flex flex-col gap-10">
      <CheckClaimableBalance bind:publicKey={findClaimableBalancePublicKey} onClick={handleFindClaimableBalances} />

      <ClaimBalance bind:balanceId bind:secretKey={findClaimableBalanceSecretKey} onClick={handleClaimClaimableBalance}>
        <div class="w-full mt-8">
          <TextArea isError={textArea.isError} value={textArea.transaction === 'claim' ? textArea.value : ''} />
        </div>
      </ClaimBalance>

      {#if claimableBalances.length}
        <ClaimableBalancesRecords {claimableBalances} />
      {/if}
    </div>
  </div>
</div>
