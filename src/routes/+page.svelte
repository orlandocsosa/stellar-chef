<script>
  import RecipeCard from '../components/salient/RecipeCard.svelte';

  const recipes = [
    {
      title: 'Asset issuance',
      link: 'asset-issuance',
      description: 'Asset creation with distributor and holders'
    },
    {
      title: 'Offers',
      link: 'offers',
      description: 'Create and manage offers'
    },
    {
      title: 'Claimable balance',
      link: 'claimable-balance',
      description: 'Claim, search, and, create claimable balances'
    },
    {
      title: 'Clawback',
      link: 'clawback',
      description: 'Asset clawback'
    },
    {
      title: 'Create accounts',
      link: 'create-account',
      description: 'Create accounts'
    },
    {
      title: 'Freeze assets',
      link: 'freeze-assets',
      description: 'Freeze assets'
    },
    {
      title: 'Change trust',
      link: 'change-trust',
      description: 'Change trust'
    }
  ];
</script>

<svelte:head>
  <title>Stellar Chef</title>
</svelte:head>

<div class="flex flex-col w-[500px] m-auto gap-5 justify-center">
  <h2 class="text-2xl">Recipes</h2>

  <ul class="flex flex-col gap-5">
    {#each recipes as { description, link, title }}
      <RecipeCard {title} link={`/stellar-chef/recipe/${link}`} {description} />
    {/each}
  </ul>
</div>
