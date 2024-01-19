<script>
  import { Asset, Keypair, Operation } from 'stellar-sdk';
  import { buildTransaction, server } from '../../services/stellar/utils';

  async function prepare() {
    const account1Keypair = Keypair.random();
    const account2Keypair = Keypair.random();
    await server.friendbot(account1Keypair.publicKey()).call();
    await server.friendbot(account2Keypair.publicKey()).call();

    const transaction = buildTransaction(await server.loadAccount(account1Keypair.publicKey()), [
      Operation.payment({
        amount: '100',
        asset: Asset.native(),
        destination: account2Keypair.publicKey()
      })
    ]);

    transaction.sign(Keypair.fromSecret(account1Keypair.secret()));
    await server.submitTransaction(transaction);
  }
</script>

<button on:click={prepare}>Prepare</button>
