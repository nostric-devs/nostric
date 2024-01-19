<script lang="ts">
  import type { SvelteComponent } from "svelte";
  import {
    FileButton,
    clipboard,
    getModalStore,
    getToastStore,
  } from "@skeletonlabs/skeleton";
  import { authUser } from "$lib/stores/Auth";
  import { NDKKind } from "@nostr-dev-kit/ndk";
  import { Circle } from "svelte-loading-spinners";
  import { CheckSquare, Copy, Plus } from "svelte-feathers";
  import { ROUTES } from "$lib/utils/routes";

  const modalStore = getModalStore();
  const toastStore = getToastStore();

  let content: string = "";
  let processing: boolean = false;

  async function onSubmit(): Promise<void> {
    processing = true;
    await $authUser.nostr.createAndPublishEvent(content, NDKKind.Text, []);
    processing = false;
    modalStore.close();
    toastStore.trigger({
      message: "Post has been published",
      background: "variant-filled-success",
    });
  }

  export let parent: SvelteComponent;

  // Images will be later loaded from store
  // Only display last 6 images
  let images = [
    "https://images.unsplash.com/photo-1617296538902-887900d9b592?ixid=M3w0Njc5ODF8MHwxfGFsbHx8fHx8fHx8fDE2ODc5NzExMDB8&ixlib=rb-4.0.3&w=512&h=512&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1553184570-557b84a3a308?ixid=M3w0Njc5ODF8MHwxfGFsbHx8fHx8fHx8fDE2ODc5NzY2NTF8&ixlib=rb-4.0.3&w=512&h=512&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1620005839871-7ac4aed5ddbc?ixid=M3w0Njc5ODF8MHwxfGFsbHx8fHx8fHx8fDE2ODc5NzY2NzN8&ixlib=rb-4.0.3&w=300&h=300&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1597077962467-be16edcc6a43?ixid=M3w0Njc5ODF8MHwxfGFsbHx8fHx8fHx8fDE2ODc5NzY2MzZ8&ixlib=rb-4.0.3&w=512&h=512&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1597531072931-8fceba101e4e?ixid=M3w0Njc5ODF8MHwxfGFsbHx8fHx8fHx8fDE2ODc5NzY2OTB8&ixlib=rb-4.0.3&w=300&h=300&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1597077917598-97ca3922a317?ixid=M3w0Njc5ODF8MHwxfGFsbHx8fHx8fHx8fDE2ODc5NzY3MjF8&ixlib=rb-4.0.3&w=300&h=300&auto=format&fit=crop",
  ];

  let copied: boolean = false;

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
      <div class="padding-2 flex">
        <div class="mr-2">
          <FileButton name="files" width="h-16 w-16 variant-filled-surface"
            ><Plus /></FileButton
          >
        </div>
        <div class="padding-2 flex items-center">
          {#each images as imageUrl}
            <div class="relative h-16 w-16 mr-2">
              <img class="h-16 w-16 rounded-md" src={imageUrl} alt="" />
              <div
                class="overlay absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300"
              >
                <button
                  use:clipboard={imageUrl}
                  class="btn h-16 w-16 variant-filled-primary font-normal"
                  on:click={() => {copied = true; setTimeout(() => copied = false, 1000);}}
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
  .overlay {
    background-color: rgba(255, 255, 255, 0.4); /* Semi-transparent overlay */
    transition: opacity 0.3s ease;
  }
  .relative:hover .overlay {
    opacity: 1; /* Show overlay on hover */
  }
</style>
