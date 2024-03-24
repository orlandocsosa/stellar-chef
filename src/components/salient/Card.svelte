<script>
  export let className = '';
</script>

<div class="{className && `${className} `}rounded-2xl bg-white p-6 shadow-xl border shadow-slate-900/10">
  <slot />
</div>
