<script lang="ts">
  import { Router } from "svelte-router-spa";
  import { routes } from "./router/routes";

  let options = { gaPageviews: true};

</script>

<Router {routes} {options}/>

<style lang="postcss" global>
  @tailwind base;
  @tailwind components;
  @tailwind utilities;

  html {
    scroll-behavior: smooth;
  }

  * {
   color: white;
  }

</style>
