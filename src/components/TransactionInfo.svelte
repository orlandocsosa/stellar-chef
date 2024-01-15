<script>
  export let transactionHash = '';
</script>

<div class="flex items-center">
  <a
    href={`https://stellar.expert/explorer/testnet/tx/${transactionHash}`}
    target="_blank"
    class="text-blue-500 hover:text-blue-800 underline ml-1">See details</a
  >
</div>
