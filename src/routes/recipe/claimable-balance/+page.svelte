<script lang="ts">
  import { Asset, Operation, Claimant as StellarClaimant, Keypair, Horizon } from 'stellar-sdk';
  import Button from '../../../components/salient/Button.svelte';
  import Card from '../../../components/salient/Card.svelte';
  import Claimant from '../../../components/salient/Claimant.svelte';
  import createPredicate from '../../../services/stellar/predicateFactory';
  import { claimants } from '../../../store/claimants';
  import { buildTransaction, findClaimableBalance, server } from '../../../services/stellar/utils';

  let isNative = false;
  let findClaimableBalancePublicKey: string;
  let findClaimableBalanceSecretKey: string;
  let balanceId: string;
  let claimableBalances: Horizon.ServerApi.ClaimableBalanceRecord[] = [];
  let textArea = {
    value: '',
    isError: false,
    transaction: ''
  };

  function addClaimant() {
    $claimants.push({ destination: '', predicate: { type: '' } });
    $claimants = $claimants;
  }

  function toggleIsNative() {
    isNative = !isNative;
  }

  function removeClaimant(index: number) {
    $claimants = $claimants.filter((_, i) => i !== index);
  }

  async function handleFindClaimableBalances() {
    claimableBalances = await findClaimableBalance(findClaimableBalancePublicKey);
  }

  async function handleClaimClaimableBalance() {
    textArea.isError = false;
    textArea.transaction = 'claim';

    try {
      const operation = Operation.claimClaimableBalance({
        balanceId
      });
      const keypair = Keypair.fromSecret(findClaimableBalanceSecretKey);
      const transaction = buildTransaction(await server.loadAccount(keypair.publicKey()), [operation]);

      transaction.sign(keypair);
      const result = await server.submitTransaction(transaction);
      textArea.value = result.successful ? 'Transaction successfully submitted' : 'Transaction failed';
    } catch (error) {
      textArea.isError = true;
      textArea.value = `${error}`;
    }
  }

  async function handleOnSubmit(e: SubmitEvent & { currentTarget: EventTarget & HTMLFormElement }) {
    textArea.isError = false;
    textArea.transaction = 'create';

    try {
      const formData = new FormData(e.currentTarget);
      let obj: Record<string, string> = {};

      for (const [key, value] of formData.entries()) {
        obj[key] = value.toString();
      }

      const keypair = Keypair.fromSecret(obj.secret);
      const operation = Operation.createClaimableBalance({
        amount: obj.amount,
        asset: isNative ? Asset.native() : new Asset(obj.code, obj.issuer),
        claimants: $claimants.map(
          (claimant) => new StellarClaimant(claimant.destination, createPredicate(claimant.predicate))
        )
      });

      const transaction = buildTransaction(await server.loadAccount(keypair.publicKey()), [operation]);
      transaction.sign(keypair);

      const result = await server.submitTransaction(transaction);
      textArea.value = result.successful ? 'Transaction successfully submitted' : 'Transaction failed';
    } catch (error) {
      textArea.isError = true;
      textArea.value = `${error}`;
    }
  }
</script>

<div class="flex justify-center">
  <div class="grid grid-cols-2 gap-10 max-lg:grid-cols-1">
    <form on:submit|preventDefault={handleOnSubmit}>
      <Card className="w-[650px] font-light">
        <h2 class="font-semibold text-2xl">Create a claimable balance</h2>

        <div class="flex flex-col gap-3 mt-8">
          <div class="flex flex-row items-center gap-3">
            <h3 class="text-lg">Asset</h3>
            <Button onClick={toggleIsNative} color={isNative ? 'blue' : 'white'} className="h-8">Native</Button>
          </div>

          {#if !isNative}
            <label>
              <p class="text-sm font-light text-black/50">Code</p>
              <input name="code" type="text" class="w-full" />
            </label>

            <label>
              <p class="text-sm font-light text-black/50">Issuer</p>
              <input name="issuer" type="text" class="w-full" />
            </label>
          {/if}
        </div>

        <div class="flex flex-col gap-3 mt-8">
          <h3 class="text-lg">Amount</h3>
          <input name="amount" type="text" />
        </div>

        <div class="flex flex-col gap-3 mt-8">
          <h3 class="text-lg">Source Account</h3>
          <label>
            <p class="text-sm font-light text-black/50">Secret Key</p>
            <input name="secret" type="text" class="w-full" />
          </label>
        </div>

        <div class="flex flex-col gap-5 mt-8">
          <div class="flex flex-row gap-5 items-center">
            <Button onClick={addClaimant} className="font-normal   text-sm">ADD</Button>
            <p class="text-lg">
              Claimants<span class="text-black/50">{$claimants.length > 0 ? `: ${$claimants.length}` : ''}</span>
            </p>
          </div>
        </div>

        <div class="flex flex-col gap-8 mt-8 items-center">
          <Button type="submit" className="h-10 w-full text-lg">Prepare!</Button>

          <div class="w-full">
            <p>Result:</p>
            <textarea
              class="bg-gray-50 w-full px-2 py-1 border border-gray-200 rounded-md
              {textArea.isError ? 'text-red-600' : 'text-black'}"
              readonly={true}
              value={textArea.transaction === 'create' ? textArea.value : ''}
            />
          </div>
        </div>
      </Card>

      {#each $claimants as claimant, i}
        <Card className="mt-5">
          <Claimant {claimant} index={i} onRemoveClaimant={() => removeClaimant(i)} />
        </Card>
      {/each}
    </form>

    <div class="flex flex-col gap-10">
      <Card className="w-[650px] h-fit font-light">
        <h2 class="font-semibold text-2xl">Check claimable balances</h2>

        <div class="flex flex-col gap-3 mt-8">
          <h3 class="text-lg">Account</h3>

          <label>
            <p class="text-sm font-light text-black/50">Public Key</p>
            <input name="publicKey" type="text" class="w-full" bind:value={findClaimableBalancePublicKey} />
          </label>
        </div>

        <Button className="h-10 text-lg mt-7" onClick={handleFindClaimableBalances}>Find</Button>

        <h2 class="font-semibold text-2xl mb-8 mt-7">Claim balance</h2>

        <div class="flex flex-col gap-3">
          <label>
            <p class="text-sm font-light text-black/50">Claimable Balance ID</p>
            <input name="claimableBalanceId" type="text" class="w-full" bind:value={balanceId} />
          </label>

          <label>
            <p class="text-sm font-light text-black/50">Secret Key</p>
            <input name="secretKey" type="text" class="w-full" bind:value={findClaimableBalanceSecretKey} />
          </label>
        </div>

        <Button className="h-10 text-lg mt-7" onClick={handleClaimClaimableBalance}>Claim</Button>

        <div class="w-full mt-8">
          <p>Result:</p>
          <textarea
            class="bg-gray-50 w-full px-2 py-1 border border-gray-200 rounded-md
            {textArea.isError ? 'text-red-600' : 'text-black'}"
            readonly={true}
            value={textArea.transaction === 'claim' ? textArea.value : ''}
          />
        </div>
      </Card>

      {#if claimableBalances.length}
        <Card className="w-[650px] font-light">
          <div class="flex flex-col gap-10">
            {#each claimableBalances as { id, amount, asset, claimants }}
              <div class="flex flex-col gap-2 bg-gray-50 border border-gray-200 p-5 rounded-md">
                <p class="break-words">ID: <span class="text-gray-600">{id}</span></p>
                <p>Amount: <span class="text-gray-600">{amount}</span></p>
                <p class="break-words">Asset: <span class="text-gray-600">{asset}</span></p>

                {#each claimants as { destination, predicate }, i}
                  <div class="flex flex-col gap-2">
                    <p class="text-lg">
                      Claimant #{i + 1}: <span class="text-gray-600 text-base break-words">{destination}</span>
                    </p>

                    <p>Predicate:</p>
                    <pre class="text-gray-600 break-words">{JSON.stringify(predicate, null, 2)}</pre>
                  </div>
                {/each}
              </div>
            {/each}
          </div>
        </Card>
      {/if}
    </div>
  </div>
</div>
