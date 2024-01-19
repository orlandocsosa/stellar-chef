<script>
  import { Asset, Keypair, Operation, TransactionBuilder } from 'stellar-sdk';
  import { Account } from '../../services/stellar/Account';
  import { buildTransaction, server } from '../../services/stellar/utils';

  async function prepare() {
    const account1 = await Account.create().fundWithFriendBot();
    const account2 = await Account.create().fundWithFriendBot();

    const transaction = buildTransaction(await server.loadAccount(account1.publicKey), [
      Operation.payment({
        amount: '100',
        asset: Asset.native(),
        destination: account2.publicKey
      })
    ]);

    transaction.sign(Keypair.fromSecret(account1.secretKey));
    await server.submitTransaction(transaction);
  }
</script>

<button on:click={prepare}>Prepare</button>
