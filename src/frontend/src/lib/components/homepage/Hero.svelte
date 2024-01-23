<script>
  import { ArrowDown } from "svelte-feathers";
  import { scroll } from "$lib/utils/scroll";
</script>

<section id="home">
  <div
    class="container mx-auto flex px-5 py-24 items-center justify-center flex-col"
  >
    <img
      class="lg:w-4/6 md:w-4/6 w-5/6 object-cover object-center rounded"
      alt="hero"
      src="/img/nostricscreen.png"
    />
    <div class="text-center lg:w-2/3 w-full">
      <h1 class="title-font sm:text-4xl text-3xl mb-4 font-medium text-white">
        The most user-friendly Nostr client
      </h1>
      <p class="mb-8 leading-relaxed text-gray-400">
        Meggings kinfolk echo park stumptown DIY, kale chips beard jianbing
        tousled. Chambray dreamcatcher trust fund, kitsch vice godard disrupt
        ramps hexagon mustache umami snackwave tilde chillwave ugh. Pour-over
        meditation PBR&amp;B pickled ennui celiac mlkshk freegan photo booth af
        fingerstache pitchfork.
      </p>
      <div class="flex justify-center">
        <button
          on:click|preventDefault={() => scroll("#signup")}
          class="btn btn-lg variant-filled-primary inline-flex items-center focus:outline-none rounded mt-4 md:mt-0 font-medium text-md"
        >
          Try Nostric
          <ArrowDown class="m-1" size="18" />
        </button>
      </div>
    </div>
  </div>
</section>
<section>
  <div class="container px-5 py-4 mx-auto">
    <div class="flex flex-wrap -m-4 text-center">
      <div class="p-4 sm:w-1/4 w-1/2">
        <h2 class="title-font font-medium sm:text-4xl text-3xl">2.7K</h2>
        <p class="leading-relaxed">Users</p>
      </div>
      <div class="p-4 sm:w-1/4 w-1/2">
        <h2 class="title-font font-medium sm:text-4xl text-3xl">189K</h2>
        <p class="leading-relaxed">Posts</p>
      </div>
      <div class="p-4 sm:w-1/4 w-1/2">
        <h2 class="title-font font-medium sm:text-4xl text-3xl">35</h2>
        <p class="leading-relaxed">Subscribers</p>
      </div>
      <div class="p-4 sm:w-1/4 w-1/2">
        <h2 class="title-font font-medium sm:text-4xl text-3xl">40</h2>
        <p class="leading-relaxed">GB of data</p>
      </div>
    </div>
  </div>
</section>
