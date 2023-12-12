<script lang="ts">
  import { Account } from "../../services/stellar/Account";

  const STELLAR_NETWORK_URL = import.meta.env.VITE_STELLAR_NETWORK_URL;
  let account: Account | null = null;
  let balance = "";
  let loading = false;
  let error = "";

  async function createAccount() {
    loading = true;
    try {
      account = await Account.generateKeypair();
      await fetchBalance(account.publicKey);
    } catch (e) {
      if (e instanceof Error) {
        error = e.message;
      } else {
        error = "An error occurred";
      }
    }
    loading = false;
  }

  async function fundAccount() {
    if (!account) {
      return;
    }
    loading = true;
    try {
      await account.fundWithFriendBot();
      await fetchBalance(account.publicKey);
    } catch (e) {
      if (e instanceof Error) {
        error = e.message;
      } else {
        error = "An error occurred";
      }
    }
    loading = false;
  }

  async function fetchBalance(publicKey: string) {
    const url = `${STELLAR_NETWORK_URL}/accounts/${publicKey}`;
    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        if (data.balances && data.balances.length > 0) {
          balance = data.balances[0].balance;
        } else {
          balance = "Account has no funds";
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        error = error.message;
      });
  }

  $: if (account) {
    fetchBalance(account.publicKey);
  }
</script>

<button on:click={createAccount} disabled={loading}>
  {loading ? "Creating Account..." : "Create Account"}
</button>
<button on:click={fundAccount} disabled={loading}>
  {loading ? "Funding Account..." : "Fund Account"}
</button>

<section class="log-box">
  <p>Account: {account ? account.publicKey : "No account"}</p>
  <p>Balance: {balance}</p>
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
  }

  .log-box {
    border: 1px solid #ccc;
    padding: 10px;
    margin-top: 20px;
    background-color: #f9f9f9;
    border-radius: 5px;
  }
</style>
