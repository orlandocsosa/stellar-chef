<script>
  import '../app.css';
  import { SvelteToast } from '@zerodevx/svelte-toast';
</script>

<head>
  <title>Stellar Chef</title>
</head>

<header class="w-full flex flex-row items-center justify-center gap-16 bg-blue-600 h-20 mb-10">
  <a class="text-white" href="/stellar-chef/">Recipes</a>
  <a class="text-white" href="/stellar-chef/faucet">Faucet</a>
</header>
<SvelteToast />
<slot />
