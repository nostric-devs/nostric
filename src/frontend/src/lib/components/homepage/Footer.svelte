<script>
  import { Github, Twitter } from "svelte-feathers";
</script>

<section class="relative my-8" id="contact">
  <div class="container px-5 py-24 mx-auto">
    <div class="flex flex-col text-center w-full mb-12">
      <h1 class="sm:text-3xl text-2xl font-medium title-font mb-4">
        Contact Us
      </h1>
      <p class="lg:w-2/3 mx-auto leading-relaxed text-base">
        Contact us if you have any questions or follow us on social media.
      </p>
    </div>
    <div class="lg:w-1/2 md:w-2/3 mx-auto">
      <div class="flex flex-wrap -m-2">
        <div class="p-2 w-full pt-8 border-t border-gray-200 text-center">
          <a href="mailto:info@nostric.app" class="anchor">info@nostric.app</a>
          <br />
          <span class="inline-flex">
            <a
              href="https://twitter.com/nostric.app"
              target="_blank"
              class="mt-6 text-gray-500"
            >
              <Twitter size="36" />
            </a>
            <a
              href="https://github.com/nostric-devs/nostric"
              target="_blank"
              class="mt-6 ml-4 text-gray-500"
            >
              <Github size="34" />
            </a>
          </span>
        </div>
      </div>
    </div>
  </div>
</section>
