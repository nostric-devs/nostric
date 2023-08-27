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

  .hero-background {
    background: rgb(167,147,254);
    background: linear-gradient(180deg, rgba(167,147,254,1) 0%, rgba(255,255,255,1) 100%);
  }

  html {
    scroll-behavior: smooth;
  }

</style>
