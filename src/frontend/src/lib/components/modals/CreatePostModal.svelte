<script lang="ts">
  import type { SvelteComponent } from "svelte";
  import { getModalStore } from "@skeletonlabs/skeleton";
  import { authUser } from "$lib/stores/Auth";
  import type { NostrUserHandler } from "$lib/nostr";
  import { NDKKind } from "@nostr-dev-kit/ndk";
  import { Circle } from "svelte-loading-spinners";

  const modalStore = getModalStore();

  let content : string = "";
  let nostrUserHandler : NostrUserHandler = authUser.getNostrUserHandler();
  let processing : boolean = false;

  async function onSubmit(): Promise<void> {
    processing = true;
    await nostrUserHandler.createAndPublishEvent(content, NDKKind.Text, []);
    processing = false;
    modalStore.close();
  }

  export let parent : SvelteComponent;

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
