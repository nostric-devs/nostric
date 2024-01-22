<script lang="ts">
  import { ArrowDown, Check, CheckCircle } from "svelte-feathers";
  import { scroll } from "$lib/utils/scroll";
</script>

<section class="body-font overflow-hidden">
  <div class="container px-5 py-24 mx-auto">
    <div class="flex flex-col text-center w-full mb-20">
      <h1 class="sm:text-4xl text-3xl font-medium mb-2 text-white">
        Nostric variants
      </h1>
      <p class="lg:w-2/3 mx-auto leading-relaxed text-base text-white">
        Whatever cardigan tote bag tumblr hexagon brooklyn asymmetrical.
      </p>
    </div>
    <div class="flex flex-wrap -m-4">
      <div class="p-4 xl:w-1/3 md:w-1/2 w-full">
        <div
          class="h-full p-6 rounded-lg border-2 border-gray-300 flex flex-col relative overflow-hidden"
        >
          <h2 class="text-sm tracking-widest mb-1 font-medium">
            Anonymous user
          </h2>
          <h1
            class="text-5xl text-white pb-4 mb-4 border-b border-gray-200 leading-none"
          >
            Free
          </h1>
          <p class="flex items-center mb-2">
            <span
              class="w-4 h-4 mr-2 inline-flex items-center justify-center text-white rounded-full flex-shrink-0"
            >
              <CheckCircle />
            </span>Vexillologist pitchfork
          </p>
          <p class="flex items-center mb-2">
            <span
              class="w-4 h-4 mr-2 inline-flex items-center justify-center text-white rounded-full flex-shrink-0"
            >
              <CheckCircle />
            </span>Tumeric plaid portland
          </p>
          <p class="flex items-center mb-6">
            <span
              class="w-4 h-4 mr-2 inline-flex items-center justify-center text-white rounded-full flex-shrink-0"
            >
              <CheckCircle />
            </span>Mixtape chillwave tumeric
          </p>
          <button
            on:click|preventDefault={() => scroll("#signup")}
            class="btn variant-filled-tertiary flex items-center mt-auto border-0 py-2 px-4 w-full focus:outline-non rounded"
            >Create your account
            <ArrowDown class="w-4 h-4 ml-auto" />
          </button>
          <p class="text-xs text-gray-500 mt-3">
            Literally you probably haven't heard of them jean shorts.
          </p>
        </div>
      </div>
      <div class="p-4 xl:w-1/3 md:w-1/2 w-full">
        <div
          class="h-full p-6 rounded-lg border-2 border-tertiary-500 flex flex-col relative overflow-hidden"
        >
          <span
            class="variant-filled-tertiary text-white px-3 py-1 tracking-widest text-xs absolute right-0 top-0 rounded-bl"
          >
            Recommended
          </span>
          <h2 class="text-sm tracking-widest mb-1 font-medium">Standard</h2>
          <h1
            class="text-5xl text-white leading-none flex items-center pb-4 mb-4 border-b border-gray-200"
          >
            <span>Free</span>
            <span class="text-lg ml-1 font-normal text-gray-500">
              *Requires invitation
            </span>
          </h1>
          <p class="flex items-center mb-2">
            <span
              class="w-4 h-4 mr-2 inline-flex items-center justify-center text-white rounded-full flex-shrink-0"
            >
              <CheckCircle />
            </span>Vexillologist pitchfork
          </p>
          <p class="flex items-center mb-2">
            <span
              class="w-4 h-4 mr-2 inline-flex items-center justify-center text-white rounded-full flex-shrink-0"
            >
              <CheckCircle />
            </span>Tumeric plaid portland
          </p>
          <p class="flex items-center mb-2">
            <span
              class="w-4 h-4 mr-2 inline-flex items-center justify-center text-white rounded-full flex-shrink-0"
            >
              <CheckCircle />
            </span>Hexagon neutra unicorn
          </p>
          <p class="flex items-center mb-6">
            <span
              class="w-4 h-4 mr-2 inline-flex items-center justify-center text-white rounded-full flex-shrink-0"
            >
              <CheckCircle />
            </span>Mixtape chillwave tumeric
          </p>
          <button
            on:click|preventDefault={() => scroll("#signup")}
            class="btn variant-filled-tertiary flex items-center mt-auto text-whit border-0 py-2 px-4 w-full focus:outline-none rounded"
            >Create your account
            <ArrowDown class="w-4 h-4 ml-auto" />
          </button>
          <p class="text-xs text-gray-500 mt-3">
            Literally you probably haven't heard of them jean shorts.
          </p>
        </div>
      </div>
      <div class="p-4 xl:w-1/3 md:w-1/2 w-full">
        <div
          class="h-full p-6 rounded-lg border-2 border-gray-300 flex flex-col relative overflow-hidden"
        >
          <h2 class="text-sm tracking-widest mb-1 font-medium">Pro</h2>
          <h1
            class="text-5xl text-white leading-none flex items-center pb-4 mb-4 border-b border-gray-200"
          >
            <span>$10</span>
            <span class="text-lg ml-1 font-normal text-gray-500">/year</span>
          </h1>
          <p class="flex items-center mb-2">
            <span
              class="w-4 h-4 mr-2 inline-flex items-center justify-center text-white rounded-full flex-shrink-0"
            >
              <CheckCircle />
            </span>Vexillologist pitchfork
          </p>
          <p class="flex items-center mb-2">
            <span
              class="w-4 h-4 mr-2 inline-flex items-center justify-center text-white rounded-full flex-shrink-0"
            >
              <CheckCircle />
            </span>Tumeric plaid portland
          </p>
          <p class="flex items-center mb-2">
            <span
              class="w-4 h-4 mr-2 inline-flex items-center justify-center text-white rounded-full flex-shrink-0"
            >
              <CheckCircle />
            </span>Hexagon neutra unicorn
          </p>
          <p class="flex items-center mb-2">
            <span
              class="w-4 h-4 mr-2 inline-flex items-center justify-center text-white rounded-full flex-shrink-0"
            >
              <CheckCircle />
            </span>Vexillologist pitchfork
          </p>
          <p class="flex items-center mb-6">
            <span
              class="w-4 h-4 mr-2 inline-flex items-center justify-center text-white rounded-full flex-shrink-0"
            >
              <CheckCircle />
            </span>Mixtape chillwave tumeric
          </p>
          <button
            on:click|preventDefault={() => scroll("#signup")}
            class="btn variant-filled-tertiary flex items-center mt-auto border-0 py-2 px-4 w-full focus:outline-non rounded"
            >Create your account
            <ArrowDown class="w-4 h-4 ml-auto" />
          </button>
          <p class="text-xs text-gray-500 mt-3">
            Literally you probably haven't heard of them jean shorts.
          </p>
        </div>
      </div>
    </div>
  </div>
</section>
