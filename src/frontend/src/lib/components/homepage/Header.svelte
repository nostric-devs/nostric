<script>
  import Logo from "$lib/components/logo/Logo.svelte";
  import { ArrowDown } from "svelte-feathers";
  import { scroll } from "$lib/utils/scroll";
</script>

<header class="text-gray-600 body-font">
  <div
    class="container mx-auto flex flex-wrap p-5 flex-col md:flex-row items-center"
  >
    <a
      href="/"
      class="flex title-font font-medium items-center text-gray-900 mb-4 md:mb-0"
    >
      <Logo />
      <span class="ml-3 text-4xl font-bold text-white">Nostric</span>
    </a>
    <nav
      class="md:mr-auto md:ml-4 md:py-1 md:pl-4 md:border-l md:border-gray-400 flex flex-wrap items-center text-gray-400 justify-center"
    >
      <a
        href="/"
        class="mr-5 text-white hover:text-gray-400 hover:underline cursor-pointer"
      >
        Home
      </a>
      <a
        on:click|preventDefault={() => scroll("#features")}
        href="/"
        class="mr-5 text-white hover:text-gray-400 hover:underline cursor-pointer"
      >
        Features
      </a>
      <a
        href="/"
        class="mr-5 text-white hover:text-gray-400 hover:underline cursor-pointer"
      >
        Blog
      </a>
      <a
        on:click|preventDefault={() => scroll("#contact")}
        href="/"
        class="mr-5 text-white hover:text-gray-400 hover:underline cursor-pointer"
      >
        Contact
      </a>
    </nav>
    <button
      on:click|preventDefault={() => scroll("#signup")}
      class="btn variant-filled-primary inline-flex items-center focus:outline-none rounded mt-4 md:mt-0 font-medium text-md"
      >Open App
      <ArrowDown class="m-1" size="18" />
    </button>
  </div>
</header>
