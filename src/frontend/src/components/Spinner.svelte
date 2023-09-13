<script>
  import { onMount } from "svelte";

  let colors = ["#ED1E79", "#522785", "#29ABE2", "#F15A24", "#FBB03B"];
  let initial = 0;
  let current_color;
  $: current_color = colors[initial];

  export let width = 2.5;

  onMount(() => {
    setInterval(() => {
      initial = (initial + 1) % colors.length;
    }, 1000);
  });

</script>

<span
  class="loading loading-infinity transition-colors ease-in duration-1000"
  style="color: {current_color}; width: {width}rem;"
></span>

