<script lang="ts">
  import { Router } from "svelte-router-spa";
  import { routes } from "./router/routes";
  import { onDestroy } from "svelte";
  import { nostr_service } from "./store/auth";

  let options = { gaPageviews: true};

  onDestroy(() => {
    nostr_service.close_relay_pool();
  })

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
