<script lang="ts">
  import { onMount } from 'svelte';
  import Label from '../../components/Label.svelte';
  import Button from '../../components/salient/Button.svelte';
  import Card from '../../components/salient/Card.svelte';
  import Select from '../../components/salient/Select.svelte';
  import Title from '../../components/salient/Title.svelte';
  import NetworkService from '../../services/network/NetworkService';
  import Span from '../../components/Span.svelte';
  import { parseEntriesValues } from '../../utils';
  import type INetwork from '../../services/network/INetwork';
  import useToast from '../../composables/useToast';
  import { refreshNetwork } from '../../store/network';

  const { showToast } = useToast();
  const networkService = new NetworkService();
  const defaultNetworks = [
    { name: 'Testnet', url: 'https://horizon-testnet.stellar.org', passphrase: 'Test SDF Network ; September 2015' },
    {
      name: 'Public',
      url: 'https://horizon.stellar.org',
      passphrase: 'Public Global Stellar Network ; September 2015'
    },
    {
      name: 'Futurenet',
      url: 'https://horizon-futurenet.stellar.org',
      passphrase: 'Test SDF Future Network ; October 2022'
    }
  ];

  let selectedNetwork = networkService.getSelectedNetwork();
  let networks = networkService.getAll();

  $: if (selectedNetwork >= 0) {
    networkService.setSelectedNetwork(selectedNetwork);
    refreshNetwork();
  }

  function handleAddNetwork(e: Event) {
    const formData = new FormData(e.target as HTMLFormElement);
    const network = parseEntriesValues<INetwork>(formData);
    networkService.set(network);
    networks = networkService.getAll();
    networks = networks;

    showToast(`Network ${network.name} added`, 'success');
  }

  onMount(() => {
    if (!networks.length) {
      defaultNetworks.map((network) => {
        networkService.set(network);
        networks = networkService.getAll();
        networks = networks;
      });
    }
  });
</script>

<Card className="w-[600px] m-auto flex flex-col gap-3">
  <Title>Network Selector</Title>
  <Select className="h-8" color="blue" bind:value={selectedNetwork}>
    {#each networks as { name }, i}
      <option class="bg-white text-black" value={i}>{name}</option>
    {/each}
  </Select>

  <div>
    <p>URL: <Span>{networks[selectedNetwork].url}</Span></p>
    <p>Passphrase: <Span>{networks[selectedNetwork].passphrase}</Span></p>
  </div>
</Card>

<Card className="w-[600px] m-auto mt-5 flex flex-col gap-3">
  <form class="flex flex-col gap-3" on:submit|preventDefault={handleAddNetwork}>
    <Title tag="h3">Add custom network</Title>

    <Label>
      Name
      <input type="text" name="name" />
    </Label>

    <Label>
      URL
      <input type="text" name="url" />
    </Label>

    <Label>
      Passphrase
      <input type="text" name="passphrase" />
    </Label>

    <Button type="submit">Add</Button>
  </form>
</Card>
