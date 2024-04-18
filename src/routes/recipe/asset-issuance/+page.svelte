<script lang="ts">
  import { Asset, AuthClawbackEnabledFlag, AuthRevocableFlag, Keypair, Operation } from 'stellar-sdk';

  import Label from '../../../components/base/Label.svelte';
  import Button from '../../../components/base/Button.svelte';
  import Card from '../../../components/base/Card.svelte';
  import Title from '../../../components/base/Title.svelte';
  import { Account } from '../../../services/stellar/Account';
  import { parseEntriesValues, sliceString } from '../../../utils';
  import { buildTransaction, server } from '../../../services/stellar/utils';
  import useToast from '../../../composables/useToast';
  import Span from '../../../components/base/Span.svelte';
  import LoadingSpinner from '../../../components/base/LoadingSpinner.svelte';
  import JsonBlock from '../../../components/base/JsonBlock.svelte';
  import Link from '../../../components/base/Link.svelte';
  import AssetService from '../../../services/asset/Asset';

  interface IAssetIssuanceForm {
    code: string;
    amount: string;
    clawback?: boolean;
    frozen?: boolean;
    'holders-amount'?: string;
    'holders-balance'?: string;
  }

  interface IOutputItem {
    code: string;
    issuer: {
      publicKey: string;
      privateKey: string;
    };
    distributor: {
      publicKey: string;
      privateKey: string;
    };
    holders: { publicKey: string; privateKey: string }[];
  }

  const { showToast } = useToast();
  const assetService = new AssetService();
  let jsonValue: object | null = null;
  let isLoading = false;
  let outputs: IOutputItem[] = [];
  let isHolderSectionVisible = false;

  async function handleOnSubmit(e: Event) {
    jsonValue = null;
    isLoading = true;

    try {
      const formData = new FormData(e.target as HTMLFormElement);
      const {
        code,
        amount,
        'holders-amount': holdersAmount,
        'holders-balance': holdersBalance,
        clawback,
        frozen
      } = parseEntriesValues<IAssetIssuanceForm>(formData);

      const issuer = await Account.create().fundWithFriendBot();
      const distributor = await Account.create().fundWithFriendBot();

      const asset = new Asset(code, issuer.publicKey);

      const changeDistributorTrustOp = Operation.changeTrust({
        asset,
        source: distributor.publicKey
      });
      const paymentOp = Operation.payment({
        destination: distributor.publicKey,
        asset,
        amount
      });

      let operations = [];
      let holdersOperations = [];
      let tempHolders = [];

      if (clawback || frozen)
        operations.push(
          Operation.setOptions({
            setFlags: AuthRevocableFlag,
            source: issuer.publicKey
          })
        );

      if (clawback)
        operations.push(
          Operation.setOptions({
            setFlags: AuthClawbackEnabledFlag,
            source: issuer.publicKey
          })
        );

      if (holdersAmount && holdersBalance) {
        for (let i = 0; i < +holdersAmount; i++) {
          const account = await Account.create().fundWithFriendBot();

          holdersOperations.push(
            ...[
              Operation.changeTrust({
                asset,
                source: account.publicKey
              }),
              Operation.payment({
                destination: account.publicKey,
                asset,
                amount: holdersBalance,
                source: issuer.publicKey
              })
            ]
          );

          tempHolders.push({
            publicKey: account.publicKey,
            privateKey: account.secretKey!
          });
        }
      }

      const transaction = buildTransaction(await server.loadAccount(issuer.publicKey), [
        ...operations,
        ...holdersOperations,
        changeDistributorTrustOp,
        paymentOp
      ]);
      transaction.sign(
        ...[
          Keypair.fromSecret(issuer.secretKey!),
          Keypair.fromSecret(distributor.secretKey!),
          ...tempHolders.map((acc) => Keypair.fromSecret(acc.privateKey))
        ]
      );

      const result = await server.submitTransaction(transaction);
      jsonValue = result;

      assetService.set({ code, issuer: issuer.publicKey, issuerSecret: issuer.secretKey! });

      showToast('Asset created and stored in Local Storage', 'success');

      outputs.push({
        code,
        issuer: {
          publicKey: issuer.publicKey,
          privateKey: issuer.secretKey!
        },
        distributor: {
          publicKey: distributor.publicKey,
          privateKey: distributor.secretKey!
        },
        holders: tempHolders
      });

      outputs = outputs;
    } catch (e) {
      showToast(`Something went wrong: ${e}`, 'danger');
    } finally {
      isLoading = false;
    }
  }
</script>

<svelte:head>
  <title>Asset Issuance</title>
</svelte:head>

<div class="flex flex-row gap-10 justify-center items-start">
  <Card className="w-[650px]">
    <Title tag="h2">Create an asset</Title>

    <form class="flex flex-col gap-5" on:submit|preventDefault={handleOnSubmit}>
      <Label>
        Asset code
        <input type="text" name="code" />
      </Label>

      <Label>
        Distributor amount
        <input type="number" name="amount" value="1000000" />
      </Label>

      <div class="flex flex-col gap-2">
        <label>
          <input type="checkbox" value={true} name="clawback" />
          CLawback
        </label>

        <label>
          <input type="checkbox" value={true} name="frozen" />
          Frozen
        </label>

        <label>
          <input type="checkbox" bind:checked={isHolderSectionVisible} />
          Holders
        </label>
      </div>

      {#if isHolderSectionVisible}
        <Label>
          Amount of holders
          <input type="number" name="holders-amount" />
        </Label>

        <Label>
          Balance per holder
          <input type="number" name="holders-balance" value="100" />
        </Label>
      {/if}

      <Button type="submit" className="mt-8 h-10 w-full">
        {#if isLoading}
          <div class="w-8"><LoadingSpinner /></div>
        {:else}
          Create asset
        {/if}
      </Button>
    </form>

    {#if jsonValue}
      <div class="mt-8">
        <JsonBlock>{JSON.stringify(jsonValue, null, 2)}</JsonBlock>
      </div>
    {/if}
  </Card>

  <Card className="w-[650px]">
    <div class="flex flex-row gap-3 items-center">
      <Title tag="h2">Output</Title>
      {#if outputs.length}
        <a href="data:text/json;charset=utf-8, {JSON.stringify(outputs, null, 2)}" download={'accounts.json'}>
          Download JSON
        </a>
      {/if}
    </div>

    <ul class="flex flex-col gap-5">
      {#each outputs as { code, issuer, distributor, holders }, i}
        <li>
          <div class="flex flex-col gap-3 bg-gray-50 border border-gray-200 p-5 rounded-md">
            <div class="flex flex-row gap-3">
              <Title tag="h3">{code}</Title>
              <Link href="https://stellar.expert/explorer/testnet/asset/{code}-{issuer.publicKey}">Stellar expert</Link>
              <Link href="/stellar-chef/faucet?code={code}&issuer={issuer.publicKey}&secret={issuer.privateKey}">
                Faucet
              </Link>
            </div>

            <div class="flex flex-col">
              <p>Issuer: <Span>{sliceString(issuer.publicKey)}</Span></p>
              <p>
                Issuer secret: <Span>{sliceString(issuer.privateKey)}</Span>
              </p>
            </div>
            <div class="flex flex-col">
              <p>Distributor: <Span>{sliceString(distributor.publicKey)}</Span></p>
              <p>
                Distributor secret: <Span>{sliceString(distributor.privateKey)}</Span>
              </p>
            </div>
            <p>Holders: <Span>{holders.length}</Span></p>
            <a href="data:text/json;charset=utf-8, {JSON.stringify(outputs[i], null, 2)}" download={'accounts.json'}>
              Download JSON
            </a>
          </div>
        </li>
      {/each}
    </ul>
  </Card>
</div>
