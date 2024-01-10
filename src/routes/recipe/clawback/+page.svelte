<script>
  import { Operation, Asset, Keypair } from 'stellar-sdk';
  import { Account } from '../../../services/stellar/Account';
  import { buildTransaction, server, submitTransaction } from '../../../services/stellar/utils';
  import Card from '../../../components/Card.svelte';
  import Input from '../../../components/Input.svelte';
  import Button from '../../../components/Button.svelte';

  let assetCode = '';
  let issuerSecretKey = '';
  let clawbackAccount = '';
  let isLoading = false;
  let status = '';
  let amountForClawback = '';
  let isClawbackAllEnabled = false;

  async function performClawback() {
    status = '';
    isLoading = true;
    try {
      const issuerAccount = new Account(Keypair.fromSecret(issuerSecretKey));
      const sourceAccount = await server.loadAccount(issuerAccount.publicKey);
      const clawbackAccountInfo = await server.loadAccount(clawbackAccount);
      const clawbackAssetBalance = clawbackAccountInfo.balances.find(
        (balance) =>
          'asset_code' in balance &&
          balance.asset_code === assetCode &&
          balance.asset_issuer === issuerAccount.publicKey
      )?.balance;

      if (clawbackAssetBalance) {
        const amountToClawback = isClawbackAllEnabled ? clawbackAssetBalance : amountForClawback;
        status = `Performing clawback of ${amountToClawback} ${assetCode} from ${clawbackAccount} to ${issuerSecretKey}`;
        const clawbackOperation = Operation.clawback({
          asset: new Asset(assetCode, issuerAccount.publicKey),
          from: clawbackAccount,
          amount: amountToClawback.toString()
        });
        const transaction = buildTransaction(sourceAccount, [clawbackOperation]);
        transaction.sign(Keypair.fromSecret(issuerAccount.secretKey));
        await submitTransaction(transaction);
        status = `Clawback of ${amountToClawback} ${assetCode} successful`;
      } else {
        status = `No ${assetCode} balance found in ${clawbackAccount}`;
        throw new Error(`No ${assetCode} balance found in ${clawbackAccount}`);
      }
    } catch (error) {
      status = `Error: ${String(error)}`;
    } finally {
      isLoading = false;
    }
  }
</script>

<div class="flex justify-center">
  <Card title="Clawback Asset ">
    <label for="asset-code">
      Asset Code
      <Input id="asset-code" bind:value={assetCode} disabled={isLoading} />
    </label>
    <label for="issuer-secret-key">
      Issuer Secret Key
      <Input id="issuer-secret-key" bind:value={issuerSecretKey} disabled={isLoading} />
    </label>
    <label for="clawback-account">
      Clawback Account
      <Input id="clawback-account" bind:value={clawbackAccount} disabled={isLoading} />
    </label>
    <label for="amount">
      Amount
      <Input id="amount" bind:value={amountForClawback} type="number" disabled={isLoading || isClawbackAllEnabled} />
    </label>
    <label for="is-clawback-all-enabled">
      Clawback All
      <input type="checkbox" id="is-clawback-all-enabled" bind:checked={isClawbackAllEnabled} disabled={isLoading} />
    </label>
    <div class="flex justify-center mt-5">
      <Button
        id="clawback-button"
        label={isLoading ? 'Performing...' : 'Perform Clawback'}
        onClick={performClawback}
        disabled={isLoading}
      />
    </div>
    <div id="status" class="h-auto max-h-12 overflow-y-auto overflow-x-hidden mt-4">
      {@html status}
    </div>
  </Card>
</div>
