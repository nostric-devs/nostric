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
  class="image-container relative w-full overflow-hidden rounded-md before:block before:pt-[100%]"
>
  <img
    class="absolute inset-0 w-full h-full object-cover rounded-md"
    src={url}
    alt=""
  />
  <div class={`overlay rounded-md ${deleting ? "deleting" : ""}`}></div>
  <div
    class={`image-icons absolute inset-0 flex items-center justify-center ${
      deleting ? "deleting" : ""
    }`}
  >
    <button
      use:clipboard={url}
      type="button"
      class="btn variant-filled-primary font-normal"
      disabled={deleting}
      on:click={() => {
        copied = true;
        setTimeout(() => (copied = false), 1000);
      }}
    >
      <span>
        <Copy size="16" class="lg:mx-auto xl:mx-0" />
      </span>
      <span class="text-sm transition-all">
        {copied ? "Copied 👍" : "Copy URL"}
      </span>
    </button>

    <button
      on:click={() => deleteFile(url)}
      type="button"
      class="btn variant-filled-warning font-normal"
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

<style>
  .image-container {
    position: relative;
    overflow: hidden;
  }
  .image-container img {
    transition: all 0.3s ease;
    display: block;
  }
  .overlay {
    display: block;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(255, 255, 255, 0.8);
    opacity: 0;
    transition: opacity 0.3s ease;
    pointer-events: none; /* Prevents overlay from blocking mouse events */
  }
  .image-container:hover .overlay {
    opacity: 1;
  }
  .image-icons {
    display: flex;
    flex-direction: column;
    gap: 10px;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    transition: opacity 0.3s ease;
    opacity: 0;
    pointer-events: none; /* Prevents icons from blocking mouse events */
  }
  .image-container:hover .image-icons,
  .deleting {
    opacity: 1;
    pointer-events: auto; /* Allows interaction with the icons */
  }
  .btn {
    transition: background-color 0.3s ease;
  }
</style>
