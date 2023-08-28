<script>
  import { onMount } from "svelte";

  let colors = ["#ED1E79", "#522785", "#29ABE2", "#F15A24", "#FBB03B"];
  let initial = 0;
  let current_color;
  $: current_color = colors[initial];

  let show_spinner = false;

  onMount(() => {
    setTimeout(() => {
      show_spinner = true;
    }, 250);
    setInterval(() => {
      initial = (initial + 1) % colors.length;
    }, 1000);
  });

</script>

{#if show_spinner}
  <span class="transition-opacity ease-in-out duration-750 { !show_spinner ? 'opacity-0' : 'opacity-100' }">
    <span
      class="loading loading-infinity loading-lg transition-colors ease-in duration-1000"
      style="color: {current_color};"
    ></span>
  </span>
{/if}
