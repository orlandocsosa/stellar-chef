<script lang="ts">
  import type { Horizon } from 'stellar-sdk';
  import Span from '../Span.svelte';
  import Title from '../base/Title.svelte';

  export let liquidityPool: Horizon.ServerApi.LiquidityPoolRecord;
</script>

<div class="flex flex-col gap-5 break-words">
  <div>
    <p>Total trustlines: <Span>{liquidityPool.total_trustlines}</Span></p>
    <p>Total shares: <Span>{liquidityPool.total_shares}</Span></p>
  </div>

  <div class="flex flex-col">
    <Title tag="h3">Asset A Reserves</Title>
    <Span>{liquidityPool.reserves[0].asset}</Span>
    <Span>{liquidityPool.reserves[0].amount}</Span>
  </div>

  <div class="flex flex-col">
    <Title tag="h3">Asset B Reserves</Title>
    <Span>{liquidityPool.reserves[1].asset}</Span>
    <Span>{liquidityPool.reserves[1].amount}</Span>
  </div>
</div>
