<script lang="ts">
  import { parseEntriesValues } from '../../utils';
  import Label from '../base/Label.svelte';
  import Button from '../base/Button.svelte';

  interface IDepositForm {
    depositA: string;
    depositB: string;
    minSlippage: string;
    maxSlippage: string;
  }

  export let onDeposit: (depositA: string, depositB: string, minSlippage: string, maxSlippage: string) => Promise<void>;
  export let isLoading = false;

  function handleOnDeposit(e: Event) {
    const formData = new FormData(e.target as HTMLFormElement);
    const { depositA, depositB, minSlippage, maxSlippage } = parseEntriesValues<IDepositForm>(formData);

    onDeposit(depositA, depositB, minSlippage, maxSlippage);
  }
</script>

<form class="flex flex-col gap-3" on:submit|preventDefault={handleOnDeposit}>
  <Label>
    Deposit A
    <input type="number" name="depositA" />
  </Label>

  <Label>
    Deposit B
    <input type="number" name="depositB" />
  </Label>

  <Label>
    Min amount slippage
    <input type="text" name="minSlippage" value="0.1" />
  </Label>

  <Label>
    Max amount slippage
    <input type="text" name="maxSlippage" value="0.1" />
  </Label>

  <Button className={isLoading ? 'animate-pulse' : ''} disabled={isLoading} type="submit">Deposit</Button>
</form>
