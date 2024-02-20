<script lang="ts">
  import { server } from '../../services/stellar/utils';

  let reserves: number;
  let publicKey: string = 'GDMKN4H35FC737XSIYYTMLR62FQQRZ5MDR5SP3VLPY7QCTDF4BEIJBRF';

  async function getAccountReserves() {
    const account = await server.accounts().accountId(publicKey).call();

    const baseReserve = 0.5;
    const defaultReserve = 2;

    reserves = (defaultReserve + account.subentry_count + account.num_sponsoring - account.num_sponsored) * baseReserve;
  }
</script>

<div>
  <div>
    <label>
      Public Key
      <input type="text" bind:value={publicKey} />
    </label>

    <button on:click={getAccountReserves}>Get Account</button>
  </div>

  <div>
    {#if reserves}
      <p>Account reserves: <span>{reserves}</span></p>
    {/if}
  </div>
</div>
