<script lang="ts">
  import { Keypair, Operation, xdr } from 'stellar-sdk';
  import Button from '../../../components/salient/Button.svelte';
  import Card from '../../../components/salient/Card.svelte';
  import JsonBlock from '../../../components/salient/JsonBlock.svelte';
  import { buildTransaction, server } from '../../../services/stellar/utils';
  import TextArea from '../../../components/salient/TextArea.svelte';

  interface IAccount {
    publicKey: string;
    secretKey: string;
    funder?: { publicKey: string; secretKey: string };
    sponsor?: { publicKey: string; secretKey: string };
  }

  let accounts: any[] = [];
  let isFundedWithFriendbot = false;
  let accountsAmount: number;
  let funderSecretKey: string;
  let startingBalance: string;
  let sponsor: string | undefined;
  let textArea = {
    value: '',
    isError: false
  };

  function toggleFondedWithFriendbot() {
    isFundedWithFriendbot = !isFundedWithFriendbot;
  }

  async function handleGenerateAndFund() {
    textArea.isError = false;

    try {
      const keypairs = generateKeypairs();
      if (isFundedWithFriendbot) {
        await fundKeypairsWithFriendBot(keypairs);
        return;
      }

      const sourceKeypair = Keypair.fromSecret(funderSecretKey);
      const uniqueSecrets = new Set<string>();
      let operations: xdr.Operation[] = [];
      let sponsorKeypair: Keypair | undefined;

      uniqueSecrets.add(sourceKeypair.secret());

      keypairs.map((keypair) => {
        let account: IAccount = {
          publicKey: keypair.publicKey(),
          secretKey: keypair.secret(),
          funder: {
            publicKey: sourceKeypair.publicKey(),
            secretKey: sourceKeypair.secret()
          }
        };
        const operation = getCreateAccountOperation(keypair.publicKey(), startingBalance.toString());

        if (sponsor) {
          sponsorKeypair = Keypair.fromSecret(sponsor);
          account.sponsor = {
            publicKey: sponsorKeypair.publicKey(),
            secretKey: sponsorKeypair.secret()
          };

          uniqueSecrets.add(sponsorKeypair.secret());
          uniqueSecrets.add(keypair.secret());
          operations.push(...getSponsorWrapperOperations(operation, keypair.publicKey(), sponsorKeypair.publicKey()));
        } else {
          operations.push(operation);
        }

        accounts.push(account);
      });

      const transaction = buildTransaction(await server.loadAccount(sourceKeypair.publicKey()), operations);
      const uniqueKeypairs = [...uniqueSecrets].map((secret) => Keypair.fromSecret(secret));

      transaction.sign(...uniqueKeypairs);
      await server.submitTransaction(transaction);

      accounts = accounts;
      textArea.value = 'Transaction successfully submitted';
    } catch (e) {
      textArea.isError = true;
      textArea.value = `Transaction failed: ${e}`;
    }
  }

  async function fundKeypairsWithFriendBot(keypairs: Keypair[]) {
    keypairs.map(async (keypair) => {
      await server.friendbot(keypair.publicKey()).call();
      accounts.push({ publicKey: keypair.publicKey(), secretKey: keypair.secret(), funder: 'friendbot' });
      accounts = accounts;
    });
  }

  function getCreateAccountOperation(destination: string, startingBalance: string) {
    return Operation.createAccount({
      destination,
      startingBalance
    });
  }

  function getSponsorWrapperOperations(operation: xdr.Operation, sponsoredId: string, source: string) {
    return [
      Operation.beginSponsoringFutureReserves({
        sponsoredId,
        source
      }),
      operation,
      Operation.endSponsoringFutureReserves({
        source: sponsoredId
      })
    ];
  }

  function handleGenerateKeypairs() {
    const keypairs = generateKeypairs();
    keypairs.map((keypair) => {
      accounts.push({ publicKey: keypair.publicKey(), secretKey: keypair.secret() });
      accounts = accounts;
    });
  }

  function generateKeypairs() {
    let keypairs = [];

    for (let i = 0; i < accountsAmount; i++) {
      keypairs.push(Keypair.random());
    }

    return keypairs;
  }
</script>

<div class="flex flex-row w-full justify-center items-start gap-10 px-28">
  <Card className="w-1/2">
    <h2 class="text-2xl">Create accounts</h2>

    <div class="flex flex-col mt-5 gap-10">
      <label class="flex flex-col gap-2">
        How many accounts do you want?
        <input type="number" bind:value={accountsAmount} />
      </label>

      <div class="flex flex-col gap-2">
        <div class="flex flex-row items-center gap-5">
          <p>Funder</p>
          <Button
            className="h-8 w-24"
            color={isFundedWithFriendbot ? 'blue' : 'white'}
            onClick={toggleFondedWithFriendbot}
          >
            Friendbot
          </Button>
        </div>

        {#if !isFundedWithFriendbot}
          <label class="flex flex-col gap-2">
            <p class="text-sm text-gray-600">Secret key</p>
            <input
              type="text"
              placeholder="SC5PJDQDA24ISLU4YLJ33FVYZYNLAZI27PU4TBVNTHT5MJMV4GV7WT55"
              bind:value={funderSecretKey}
            />
          </label>

          <label class="flex flex-col gap-2">
            <p class="text-sm text-gray-600">Starting balance</p>
            <input type="number" placeholder="10000" bind:value={startingBalance} />
          </label>
        {/if}
      </div>

      <label class="flex flex-col gap-2">
        <p>Sponsor <span class="text-gray-600">(Optional)</span></p>
        <input
          type="text"
          placeholder="SC5PJDQDA24ISLU4YLJ33FVYZYNLAZI27PU4TBVNTHT5MJMV4GV7WT55"
          bind:value={sponsor}
        />
      </label>
    </div>

    <div class="flex flex-col gap-5 w-52 mt-7">
      <Button color="white" onClick={handleGenerateKeypairs}>Generate Keypairs</Button>
      <Button onClick={handleGenerateAndFund}>Generate and Fund</Button>
    </div>

    <div class="mt-7">
      <TextArea isError={textArea.isError} value={textArea.value} />
    </div>
  </Card>

  <Card className="w-1/2">
    <h2 class="text-2xl">Result:</h2>

    {#if accounts.length}
      <div class="mt-5">
        <a href="data:text/json;charset=utf-8, {JSON.stringify(accounts)}" download={'accounts.json'}>Download JSON</a>
        <JsonBlock>{JSON.stringify(accounts, null, 2)}</JsonBlock>
      </div>
    {/if}
  </Card>
</div>
