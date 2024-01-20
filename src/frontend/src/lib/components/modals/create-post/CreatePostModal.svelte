<script lang="ts">
  import type { SvelteComponent } from "svelte";
  import {
    FileButton,
    clipboard,
    getModalStore,
    getToastStore,
    ProgressRadial,
  } from "@skeletonlabs/skeleton";
  import { authUser } from "$lib/stores/Auth";
  import { NDKKind } from "@nostr-dev-kit/ndk";
  import { Circle } from "svelte-loading-spinners";
  import { CheckSquare, Copy, Plus } from "svelte-feathers";
  import { ROUTES } from "$lib/utils/routes";
  import UploadImage from "$lib/components/images/UploadImage.svelte";
  import { onMount } from "svelte";
  import { files } from "$lib/stores/Files";

  const modalStore = getModalStore();
  const toastStore = getToastStore();

  let content: string = "";
  let loading: boolean = false;
  let processing: boolean = false;

  async function onSubmit(): Promise<void> {
    try {
      processing = true;
      await $authUser.nostr.createAndPublishEvent(content, NDKKind.Text, []);
      modalStore.close();
      toastStore.trigger({
        message: "Post has been published.",
        background: "variant-filled-success",
        classes: "z-1000",
      });
    } catch (error) {
      console.error(error);
      toastStore.trigger({
        message: "Unable to publish post.",
        background: "variant-filled-error",
      });
    } finally {
      processing = false;
    }
  }

  export let parent: SvelteComponent;

  let copied: boolean = false;

  onMount(async () => {
    if ($files.length === 0) {
      try {
        loading = true;
        await $authUser.identity.getFiles();
      } catch (error) {
        console.error(error);
        toastStore.trigger({
          message: "Unable to load user images from storage.",
          background: "variant-filled-error",
        });
      } finally {
        loading = false;
      }
    }
  });
</script>

{#if $modalStore[0]}
  <div class="card p-4 w-modal shadow-xl space-y-4">
    <header class="text-2xl font-bold">{$modalStore[0].title}</header>
    <article>{$modalStore[0].body}</article>

    <form class="modal-form">
      <label class="label">
        <textarea
          class="textarea px-3 py-2"
          rows="4"
          bind:value={content}
          placeholder="Start typing message..."
          disabled={processing}
        />
      </label>
    </form>
    <div class="pb-4">
      <div class="text-md mb-2 font-bold mr-4">Images</div>
      <div class="pa-2 flex">
        <UploadImage let:onFileLand let:processing>
          <FileButton
            name="files"
            width="h-16 w-16 variant-filled-surface"
            on:change={onFileLand}
            disabled={processing}
          >
            {#if processing}
              <ProgressRadial value={undefined} width="w-6" />
            {:else}
              <Plus />
            {/if}
          </FileButton>
        </UploadImage>

        {#if loading}
          <div class="grid grow grid-cols-8">
            {#each { length: 5 } as _}
              <div class="placeholder animate-pulse py-8 ml-1" />
            {/each}
          </div>
        {:else if $files && $files.length > 0}
          <div class="pa-2 flex items-center ml-1">
            {#each $files as url}
              <div class="image-square relative h-16 w-16 mr-1">
                <img
                  class="absolute inset-0 h-full w-full rounded-md object-cover"
                  src={url}
                  alt=""
                />
                <div
                  class="overlay absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300"
                >
                  <button
                    use:clipboard={url}
                    class="btn h-16 w-16 variant-filled-primary font-normal"
                    on:click={() => {
                      copied = true;
                      setTimeout(() => (copied = false), 1000);
                    }}
                  >
                    <span>
                      {#if copied}
                        <CheckSquare size="24" class="lg:mx-auto xl:mx-0" />
                      {:else}
                        <Copy size="24" class="lg:mx-auto xl:mx-0" />
                      {/if}
                    </span>
                  </button>
                </div>
              </div>
            {/each}
          </div>
        {/if}
      </div>
      <div class="mt-2">
        You can manage your media uploads <a
          class="anchor"
          on:click={parent.onClose}
          href={ROUTES.IMAGES}>here.</a
        >
      </div>
    </div>

    <footer class="modal-footer {parent.regionFooter}">
      <button
        class="btn {parent.buttonNeutral}"
        on:click={parent.onClose}
        disabled={processing}
      >
        {parent.buttonTextCancel}
      </button>
      <button
        class="btn {parent.buttonPositive}"
        on:click={onSubmit}
        disabled={processing}
      >
        {#if processing}
          <span class="mr-2">
            <Circle size="15" color="white" unit="px"></Circle>
          </span>
        {/if}
        Post event
      </button>
    </footer>
  </div>
{/if}

<style>
  .image-square {
    position: relative;
    width: 4rem; /* 16 width */
    height: 4rem; /* 16 height, making it square */
    overflow: hidden;
  }

  .image-square img {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover; /* Ensures the image covers the area */
    border-radius: 0.375rem; /* Adjust as needed */
  }
  .overlay {
    background-color: rgba(255, 255, 255, 0.4);
    transition: opacity 0.3s ease;
  }
  .relative:hover .overlay {
    opacity: 1;
  }
</style>
