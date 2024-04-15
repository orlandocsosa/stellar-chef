import { writable } from 'svelte/store';
import type INetwork from '../services/network/INetwork';
import NetworkService from '../services/network/NetworkService';

const networkService = new NetworkService();
const network = writable<INetwork>();

function refreshNetwork(): void {
  const networks = networkService.getAll();
  network.set(networks[networkService.getSelectedNetwork()]);
}

refreshNetwork();

export { network, refreshNetwork };
