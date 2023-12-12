<script lang="ts">
  import { Account } from "../../services/stellar/Account";
  import { server } from "../../services/stellar/utils";

  let account: Account | null = null;
  let balance = "";
  let isLoading = false;
  let error = "";

  function handleError(e: any, functionName: string) {
    if (e instanceof Error) {
      error = `${functionName}: ${e.message}`;
    } else {
      error = `${functionName}: An error occurred`;
    }
  }

  async function createAccount() {
    error = "";
    isLoading = true;
    try {
      account = await Account.create();
    } catch (e) {
      handleError(e, "createAccount");
    }
    isLoading = false;
  }

  async function fundAccount() {
    error = "";
    if (!account) {
      return;
    }
    isLoading = true;
    try {
      await account.fundWithFriendBot();
      await getBalance(account.publicKey);
    } catch (e) {
      handleError(e, "fundAccount");
    }
    isLoading = false;
  }

  async function getBalance(publicKey: string) {
    try {
      const account = await server.loadAccount(publicKey);
      balance = account.balances[0].balance;
    } catch (e) {
      if (e instanceof Error && e.message.includes("Not Found")) {
        balance = "0";
      } else {
        handleError(e, "getBalance");
      }
    }
  }

  $: if (account) {
    getBalance(account.publicKey);
  }
</script>

<button on:click={createAccount} disabled={isLoading}>
  {isLoading ? "Processing..." : "Create Account"}
</button>
<button on:click={fundAccount} disabled={isLoading}>
  {isLoading ? "Processing..." : "Fund Account"}
</button>

<section class="log-box">
  <p>Account: {account ? account.publicKey : "No account"}</p>
  <p>XLM Balance: {balance ? balance : "No balance"}</p>
  {#if error}
    <p>Error: {error}</p>
  {/if}
</section>

<style>
  button {
    color: white;
    background-color: blue;
    border: none;
    padding: 10px 20px;
    margin: 10px;
    cursor: pointer;
    width: 150px;
    border-radius: 5px;
  }

  .log-box {
    border: 1px solid #ccc;
    padding: 10px;
    margin-top: 20px;
    background-color: #f9f9f9;
    border-radius: 5px;
  }
</style>
