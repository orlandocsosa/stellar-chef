<script>
  import { Asset, Horizon, Keypair, Networks, Operation, TransactionBuilder } from 'stellar-sdk';
  import { buildTransaction, server } from '../../services/stellar/utils';

  async function workingSubmit() {
    const server = new Horizon.Server('https://horizon-testnet.stellar.org');
    const account1Keypair = Keypair.random();
    const account2Keypair = Keypair.random();
    await server.friendbot(account1Keypair.publicKey()).call();
    await server.friendbot(account2Keypair.publicKey()).call();
    const paymentOp = Operation.payment({
      amount: '100',
      asset: Asset.native(),
      destination: account2Keypair.publicKey()
    });

    const transaction = new TransactionBuilder(await server.loadAccount(account1Keypair.publicKey()), {
      networkPassphrase: Networks.TESTNET,
      fee: '100'
    })
      .setTimeout(30)
      .addOperation(paymentOp)
      .build();

    transaction.sign(Keypair.fromSecret(account1Keypair.secret()));
    await server.submitTransaction(transaction);
  }

  async function failingSubmit() {
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

  async function prepare() {
    await workingSubmit();
    await failingSubmit();
  }
</script>

<button on:click={prepare}>Prepare</button>
