<script>
  export let label = '';
  export let onClick = () => {};
  export let id = '';
  export let disabled = false;

  function handleClick() {
    onClick();
  }
</script>

<button
  {id}
  {disabled}
  class="bg-white hover:bg-gray-200 text-black py-2 px-4 border border-black w-full mx-2"
  on:click={handleClick}
  style="box-shadow: 3px 3px 0px 0px black;"
>
  {label}
</button>
