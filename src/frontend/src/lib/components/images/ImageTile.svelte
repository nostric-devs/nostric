<script lang="ts">
  import { Copy, Trash } from "svelte-feathers";
  import { Circle } from "svelte-loading-spinners";
  import {
    clipboard,
    getToastStore,
    type ToastStore,
  } from "@skeletonlabs/skeleton";
  import { authUser } from "$lib/stores/Auth";

  let deleting: boolean = false;
  let copied: boolean = false;

  const toastStore: ToastStore = getToastStore();

  const deleteFile = async (url: string) => {
    deleting = true;
    try {
      await $authUser.identity.deleteFile(url);
      toastStore.trigger({
        message: "Image successfully deleted from storage.",
        background: "variant-filled-success",
      });
    } catch (error) {
      console.error(error);
      toastStore.trigger({
        message: "Unable to delete image from storage.",
        background: "variant-filled-error",
      });
    } finally {
      deleting = false;
    }
  };

  export let url: string;
</script>

<div
  class="image-container relative w-full overflow-hidden rounded-md before:block before:pt-[100%] hover:opacity-100 transition-opacity duration-300"
>
  <img
    class="absolute inset-0 w-full h-full object-cover rounded-md transition-all duration-300"
    src={url}
    alt=""
  />
  <div
    class={`overlay absolute inset-0 bg-white bg-opacity-80 transition-opacity duration-300 pointer-events-none ${deleting ? "opacity-100" : "opacity-0"}`}
  ></div>
  <div
    class={`image-icons absolute inset-0 flex flex-col items-center justify-center gap-2.5 transition-opacity duration-300 opacity-0 pointer-events-none ${
      deleting ? "opacity-100 pointer-events-auto" : ""
    }`}
  >
    <button
      use:clipboard={url}
      type="button"
      class="btn variant-filled-primary font-normal transition duration-300"
      disabled={deleting}
      on:click={() => {
        copied = true;
        setTimeout(() => (copied = false), 1000);
      }}
    >
      <span>
        <Copy size="16" class="lg:mx-auto xl:mx-0" />
      </span>
      <span class="text-sm">
        {copied ? "Copied 👍" : "Copy URL"}
      </span>
    </button>

    <button
      on:click={() => deleteFile(url)}
      type="button"
      class="btn variant-filled-warning font-normal transition duration-300"
      disabled={deleting}
    >
      {#if deleting}
        <span class="mr-2">
          <Circle size="15" color="white" unit="px" />
        </span>
      {:else}
        <span>
          <Trash size="16" class="lg:mx-auto xl:mx-0" />
        </span>
      {/if}
      <span class="text-sm">Delete</span>
    </button>
  </div>
</div>
