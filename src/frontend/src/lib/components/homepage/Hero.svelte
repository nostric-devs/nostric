<script>
  import { ArrowDown } from "svelte-feathers";
  import { scrollTo } from "./ScrollTo";
</script>

<section class="text-gray-600 body-font" id="home">
  <div
    class="container mx-auto flex px-5 py-24 items-center justify-center flex-col"
  >
    <img
      class="lg:w-4/6 md:w-4/6 w-5/6 mb-10 object-cover object-center rounded"
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
          on:click|preventDefault={() => scrollTo("#signup")}
          class="btn btn-lg variant-filled-primary inline-flex items-center focus:outline-none rounded mt-4 md:mt-0 font-medium text-md"
          >Try Nostric
          <ArrowDown class="m-1" size="18" />
        </button>
        <!-- <button class="ml-4 inline-flex text-gray-700 bg-gray-100 border-0 py-2 px-6 focus:outline-none hover:bg-gray-200 rounded text-lg">Button</button> -->
      </div>
    </div>
  </div>
</section>
