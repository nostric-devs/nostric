<script lang="ts">
  import Header from "../lib/components/homepage/Header.svelte";
  import Hero from "$lib/components/homepage/Hero.svelte";
  import Features from "$lib/components/homepage/Features.svelte";
  import Comparison from "$lib/components/homepage/Comparison.svelte";
  import Footer from "$lib/components/homepage/Footer.svelte";
  import SignInCrossroad from "$lib/components/homepage/SignInCrossroad.svelte";
  import { onMount } from "svelte";

  import { setModeCurrent } from "@skeletonlabs/skeleton";

  onMount(() => {
    // set this page to always be in a dark mode
    // must be in mount because it uses document object, otherwise not available
    setModeCurrent(false);
  });
</script>

<Header />
<Hero />
<Features />
<Comparison />
<SignInCrossroad />
<Footer />
