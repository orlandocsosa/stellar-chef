<script>
  import { Operation, Asset, Keypair } from 'stellar-sdk';
  import { Account } from '../../../services/stellar/Account';
  import { buildTransaction, server, submitTransaction } from '../../../services/stellar/utils';
  import Card from '../../../components/Card.svelte';
  import Input from '../../../components/Input.svelte';
  import Button from '../../../components/Button.svelte';
  import TransactionInfo from '../../../components/TransactionInfo.svelte';

  let assetCode = '';
  let issuerSecretKey = '';
  let clawbackAccount = '';
  let isLoading = false;
  let status = '';
  let amountForClawback = '';
  let isClawbackAllEnabled = false;
  let isTransactionSuccessful = false;
  let transactionHash = '';

  async function performClawback() {
    isTransactionSuccessful = false;
    transactionHash = '';
    status = '';
    isLoading = true;
    try {
      const issuerAccount = new Account(Keypair.fromSecret(issuerSecretKey));
      const sourceAccount = await server.loadAccount(issuerAccount.publicKey);
      const clawbackAccountInfo = await server.loadAccount(clawbackAccount);
      const clawbackableAssetAmount = clawbackAccountInfo.balances.find(
        (balance) =>
          'asset_code' in balance &&
          balance.asset_code === assetCode &&
          balance.asset_issuer === issuerAccount.publicKey
      )?.balance;

      if (clawbackableAssetAmount) {
        const amountToClawback = isClawbackAllEnabled ? clawbackableAssetAmount : amountForClawback;

        if (parseFloat(amountToClawback) > parseFloat(clawbackableAssetAmount)) {
          throw new Error(
            `The amount for clawback (${amountToClawback}) is greater than the available balance (${clawbackableAssetAmount})`
          );
        }

        status = `Performing clawback of ${amountToClawback} ${assetCode} from ${clawbackAccount} to ${issuerSecretKey}`;

        const clawbackOperation = Operation.clawback({
          asset: new Asset(assetCode, issuerAccount.publicKey),
          from: clawbackAccount,
          amount: amountToClawback.toString()
        });
        const transaction = buildTransaction(sourceAccount, [clawbackOperation]);
        transaction.sign(Keypair.fromSecret(issuerAccount.secretKey));
        const transactionResponse = await submitTransaction(transaction);
        transactionHash = transactionResponse.hash;
        isTransactionSuccessful = transactionResponse.successful;

        if (!isTransactionSuccessful) {
          status = `Clawback of ${amountToClawback} ${assetCode} failed.`;
          throw new Error(`Clawback of ${amountToClawback} ${assetCode} failed.`);
        }
      }
    } catch (error) {
      status = `Error: ${String(error)}`;
    } finally {
      isLoading = false;
    }
  }
</script>

<div class="flex justify-center">
  <form on:submit|preventDefault={performClawback}>
    <Card title="Clawback Asset ">
      <label for="asset-code">
        Asset Code
        <Input id="asset-code" bind:value={assetCode} disabled={isLoading} required />
      </label>
      <label for="issuer-secret-key">
        Issuer Secret Key
        <Input id="issuer-secret-key" bind:value={issuerSecretKey} disabled={isLoading} required />
      </label>
      <label for="clawback-account">
        Clawback Account
        <Input id="clawback-account" bind:value={clawbackAccount} disabled={isLoading} required />
      </label>
      <label for="amount">
        Amount
        <Input
          id="amount"
          bind:value={amountForClawback}
          type="number"
          disabled={isLoading || isClawbackAllEnabled}
          required
        />
      </label>
      <label for="is-clawback-all-enabled">
        Clawback All
        <input type="checkbox" id="is-clawback-all-enabled" bind:checked={isClawbackAllEnabled} disabled={isLoading} />
      </label>

      <div class="flex justify-center mt-5">
        <Button id="clawback-button" label={isLoading ? 'Performing...' : 'Perform Clawback'} disabled={isLoading} />
      </div>
      <div id="status" class="h-auto max-h-12 overflow-y-auto overflow-x-hidden mt-4">
        {#if isTransactionSuccessful}
          Transaction successful <TransactionInfo {transactionHash} />
        {:else}
          {status}
        {/if}
      </div>
    </Card>
  </form>
</div>
