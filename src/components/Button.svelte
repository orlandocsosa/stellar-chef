<script>
  export let label = '';
  export let onClick = () => {};

  function handleClick() {
    console.log('Button clicked!');
    onClick();
  }
</script>

<button
  class="bg-white hover:bg-gray-200 text-black py-2 px-4 border border-black w-full mx-2"
  on:click={handleClick}
  style="box-shadow: 3px 3px 0px 0px black;"
>
  {label}
</button>
