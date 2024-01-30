<script>
  import TransactionInfo from './TransactionInfo.svelte';

  export let status = '';
  export let isTransactionSuccessful = false;
  export let transactionHash = '';
</script>

<div data-cy="status" class="min-h-[50px] overflow-auto mt-4 w-full justify-center">
  <p>{status}</p>
  {#if isTransactionSuccessful}
    <p>
      <TransactionInfo {transactionHash} />
    </p>
  {/if}
</div>
