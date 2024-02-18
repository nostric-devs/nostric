<script>
  import { ArrowRight, Database, Image, Lock } from "svelte-feathers";
</script>

<section class="text-gray-600 body-font" id="features">
  <div class="container px-5 py-24 mx-auto">
    <h1
      class="sm:text-3xl text-2xl font-medium title-font text-center text-white mb-20"
    >
      Explore our features
    </h1>
    <div
      class="flex flex-wrap sm:-m-4 -mx-4 -mb-10 -mt-4 md:space-y-0 space-y-6"
    >
      <div class="p-4 md:w-1/3 flex">
        <div
          class="w-12 h-12 inline-flex items-center justify-center rounded-full bg-indigo-100 mb-4 flex-shrink-0"
        >
          <Lock />
        </div>
        <div class="flex-grow pl-6">
          <h2 class="text-white text-lg title-font font-medium mb-2">
            Private key encryption
          </h2>
          <p class="leading-relaxed text-gray-400">
            Secure your keys with vetKey encryption, ensuring only you have
            access to your keys, safeguarding your privacy at every step.
          </p>
          <!-- <a
            href="/"
            class="mt-3 anchor cursor-pointer inline-flex items-center"
          >
            Learn More
            <ArrowRight size="16" class="m-2" />
          </a> -->
        </div>
      </div>
      <div class="p-4 md:w-1/3 flex">
        <div
          class="w-12 h-12 inline-flex items-center justify-center rounded-full bg-indigo-100 mb-4 flex-shrink-0"
        >
          <Database />
        </div>
        <div class="flex-grow pl-6">
          <h2 class="text-white text-lg title-font font-medium mb-2">
            Data backup
          </h2>
          <p class="leading-relaxed text-gray-400">
            With Nostric, never worry about losing valuable information. Our
            reliable data backup feature ensures your digital footprint is safe,
            retrievable, and protected.
          </p>
          <!-- <a
            href="/"
            class="mt-3 anchor cursor-pointer inline-flex items-center"
          >
            Learn More
            <ArrowRight size="16" class="m-2" />
          </a> -->
        </div>
      </div>
      <div class="p-4 md:w-1/3 flex">
        <div
          class="w-12 h-12 inline-flex items-center justify-center rounded-full bg-indigo-100 mb-4 flex-shrink-0"
        >
          <Image />
        </div>
        <div class="flex-grow pl-6">
          <h2 class="text-white text-lg title-font font-medium mb-2">
            Media server
          </h2>
          <p class="leading-relaxed text-gray-400">
            Enhance your Nostr experience with Nostric's integrated media
            server, allowing seamless sharing and streaming of multimedia
            content, enriching your interactions.
          </p>
          <!-- <a
            href="/"
            class="mt-3 anchor cursor-pointer inline-flex items-center"
          >
            Learn More
            <ArrowRight size="16" class="m-2" />
          </a> -->
        </div>
      </div>
    </div>
  </div>
</section>
