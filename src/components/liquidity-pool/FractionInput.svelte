<script lang="ts">
  export let isFraction = false;
</script>

{#if isFraction}
  <label class="flex flex-col gap-1">
    <p class="text-sm text-gray-600">Fraction</p>

    <div class="flex flex-row gap-3 items-center">
      <input type="text" name="numerator" placeholder="Numerator" />
      <div>/</div>
      <input type="text" name="denominator" placeholder="Denominator" />
    </div>
  </label>
{:else}
  <label class="flex flex-col gap-1">
    <p class="text-sm text-gray-600">Amount</p>
    <input type="text" name="amount" />
  </label>
{/if}
