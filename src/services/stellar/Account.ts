import { Keypair, Horizon } from 'stellar-sdk';


const STELLAR_NETWORK_URL = import.meta.env.VITE_STELLAR_NETWORK_URL;
const server = new Horizon.Server(STELLAR_NETWORK_URL);

class Account {
    public publicKey: string;
    public secretKey: string;

    constructor(keypair: Keypair) {
        this.publicKey = keypair.publicKey();
        this.secretKey = keypair.secret();
    }

    async fundWithFriendBot(): Promise<Account> {
        await server.friendbot(this.publicKey).call();
        return this;
    }

    static async generateKeypair(options: { hasToBeFounded: boolean } = { hasToBeFounded: false }): Promise<Account> {
        const keypair = Keypair.random();
        const account = new Account(keypair);

        if (options.hasToBeFounded) {
            await account.fundWithFriendBot();
        }

        return account;
    }
}

export { Account };