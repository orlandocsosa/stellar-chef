import { writable } from 'svelte/store';
import type INetwork from '../services/network/INetwork';
import NetworkService from '../services/network/NetworkService';

const networkService = new NetworkService();
const network = writable<INetwork>();

function refreshNetwork(): void {
  const networks = networkService.getAll();

  if (networks.length === 0) {
    networkService.defaultNetworks.map((network) => networkService.set(network));
    networkService.setSelectedNetwork(0);
    network.set(networkService.defaultNetworks[0]);
  } else {
    network.set(networks[networkService.getSelectedNetwork()]);
  }
}

refreshNetwork();

export { network, refreshNetwork };
