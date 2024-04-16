import LocalStorage from '../storage/LocalStorage';
import type INetwork from './INetwork';

export default class NetworkService {
  private readonly storage: LocalStorage;
  public defaultNetworks = [
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

  constructor() {
    this.storage = new LocalStorage();
  }

  public getAll(): INetwork[] {
    const networksString = this.storage.get('networks');

    if (networksString === null) {
      return [];
    }

    return JSON.parse(networksString);
  }

  set(network: INetwork): INetwork[] {
    const networks = this.getAll();
    networks.push(network);

    this.storage.set('networks', JSON.stringify(networks));
    return networks;
  }

  getSelectedNetwork(): number {
    const index = this.storage.get('selectedNetwork');
    if (index === null) {
      return 0;
    }
    return JSON.parse(index);
  }

  setSelectedNetwork(index: number): void {
    this.storage.set('selectedNetwork', JSON.stringify(index));
  }
}
