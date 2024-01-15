<script lang="ts">
  export let publicKey = '';
  export let id: string;
</script>

<a
  {id}
  href={`https://stellar.expert/explorer/testnet/account/${publicKey}`}
  target="_blank"
  class="text-blue-500 hover:text-blue-800 ml-1 underline"
>
  Account Details
</a>
