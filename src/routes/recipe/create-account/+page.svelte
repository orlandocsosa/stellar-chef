<script lang="ts">
  import { Keypair, Operation, xdr } from 'stellar-sdk';
  import Button from '../../../components/salient/Button.svelte';
  import Card from '../../../components/salient/Card.svelte';
  import CheckBoxButton from '../../../components/salient/CheckBoxButton.svelte';
  import JsonBlock from '../../../components/salient/JsonBlock.svelte';
  import {
    buildTransaction,
    getSponsorWrapperOperations,
    server,
    submitTransaction
  } from '../../../services/stellar/utils';
  import TextArea from '../../../components/salient/TextArea.svelte';
  import { signers } from '../../../store/signers';
  import { thresholds } from '../../../store/thresholds';
  import Signers from '../../../components/create-account/Signers.svelte';
  import useToast from '../../../composables/useToast';
  import Thresholds from '../../../components/create-account/Thresholds.svelte';

  interface IAccount {
    publicKey: string;
    secretKey: string;
    funder?: { publicKey: string; secretKey: string };
    sponsor?: { publicKey: string; secretKey: string };
  }

  const { showToast, toggleLoadingToast } = useToast();
  let accounts: any[] = [];
  let isFundedWithFriendbot = false;
  let accountsAmount: number;
  let funderSecretKey: string;
  let startingBalance: string;
  let sponsorSecret: string | undefined;
  let masterWeight: number | undefined = undefined;
  let isSetOptionsChecked = false;
  let textArea = {
    value: '',
    isError: false
  };

  async function handleOnSubmit() {
    textArea.value = '';
    toggleLoadingToast(true, 'Creating accounts...');

    try {
      let tempAccounts = [];
      let operations: xdr.Operation[] = [];
      let uniqueSecrets = new Set<string>();

      for (let i = 0; i < accountsAmount; i++) {
        const accountKeypair = Keypair.random();
        const account = {
          publicKey: accountKeypair.publicKey(),
          secretKey: accountKeypair.secret()
        };

        let funder: { type: string; publicKey?: string; secretKey?: string } = { type: '' };
        let sponsor: { publicKey: string; secretKey: string } | undefined = undefined;

        if (isFundedWithFriendbot) {
          funder.type = 'friendbot';
          await server.friendbot(account.publicKey).call();
        } else {
          funder.type = 'account';
          const funderKeypair = Keypair.fromSecret(funderSecretKey);
          funder.publicKey = funderKeypair.publicKey();
          funder.secretKey = funderKeypair.secret();
          uniqueSecrets.add(funder.secretKey);

          const createAccountOperation = Operation.createAccount({
            destination: account.publicKey,
            startingBalance: startingBalance.toString(),
            source: funder.publicKey
          });

          if (sponsorSecret || isSetOptionsChecked) uniqueSecrets.add(account.secretKey);

          if (!sponsorSecret) {
            operations.push(createAccountOperation);
          } else {
            const sponsorKeypair = Keypair.fromSecret(sponsorSecret);
            sponsor = {
              publicKey: sponsorKeypair.publicKey(),
              secretKey: sponsorKeypair.secret()
            };
            uniqueSecrets.add(sponsor.secretKey);

            operations.push(
              ...getSponsorWrapperOperations(createAccountOperation, account.publicKey, sponsor.publicKey)
            );
          }
        }

        if (isSetOptionsChecked) {
          operations.push(
            Operation.setOptions({
              masterWeight,
              source: account.publicKey,
              lowThreshold: $thresholds.low || undefined,
              medThreshold: $thresholds.med || undefined,
              highThreshold: $thresholds.high || undefined
            })
          );

          for (const signer of $signers) {
            operations.push(
              Operation.setOptions({
                signer: {
                  ed25519PublicKey: signer.publicKey,
                  weight: signer.weight
                },
                source: account.publicKey
              })
            );
          }
        }

        tempAccounts.push({
          ...account,
          funder,
          ...(sponsor && { sponsor }),
          ...(isSetOptionsChecked && {
            weight: masterWeight,
            thresholds: { ...$thresholds },
            signers: [$signers.map((signer) => ({ ...signer }))]
          })
        });
      }

      if (operations.length) {
        const transaction = buildTransaction(
          await server.loadAccount(tempAccounts[0].funder.publicKey || tempAccounts[0].publicKey),
          operations
        );
        transaction.sign(...[...uniqueSecrets].map((secret) => Keypair.fromSecret(secret)));
        const result = await submitTransaction(transaction);
        textArea.value = JSON.stringify(result, null, 2);
      }

      accounts.push(...tempAccounts);
      accounts = accounts;
      toggleLoadingToast(false);
      showToast('Accounts created', 'success');
    } catch (e) {
      toggleLoadingToast(false);
      showToast('Something went wrong', 'danger');
      console.error(e);
    }
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
          <CheckBoxButton bind:checked={isFundedWithFriendbot} text="Friendbot" />
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
          bind:value={sponsorSecret}
        />
      </label>

      <div class="flex flex-col gap-2">
        <label class="w-fit">
          <input type="checkbox" bind:checked={isSetOptionsChecked} />
          Set options
        </label>

        {#if isSetOptionsChecked}
          <label class="flex flex-col gap-2">
            <p class="text-sm text-gray-600">Master weight</p>
            <input type="number" placeholder="0 - 255" bind:value={masterWeight} />
          </label>

          <Thresholds />

          <Signers />
        {/if}
      </div>
    </div>

    <div class="flex flex-col gap-5 w-52 mt-7">
      <Button onClick={handleOnSubmit}>Generate and Fund</Button>
    </div>

    {#if textArea.value}
      <div class="mt-7">
        <JsonBlock>{textArea.value}</JsonBlock>
      </div>
    {/if}
  </Card>

  <Card className="w-1/2">
    <h2 class="text-2xl">Result:</h2>

    <div class="mt-5">
      <div class="mb-5">
        <a href="data:text/json;charset=utf-8, {JSON.stringify(accounts, null, 2)}" download={'accounts.json'}>
          Download JSON
        </a>

        <Button className="h-8" onClick={() => (accounts = [])}>Clear</Button>
      </div>
      <JsonBlock>{accounts.length ? JSON.stringify(accounts, null, 2) : ''}</JsonBlock>
    </div>
  </Card>
</div>
