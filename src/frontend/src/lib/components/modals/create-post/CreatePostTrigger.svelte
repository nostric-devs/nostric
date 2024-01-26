<script lang="ts">
  import { getModalStore } from "@skeletonlabs/skeleton";
  import type { ModalSettings, ModalComponent } from "@skeletonlabs/skeleton";
  import { Plus } from "svelte-feathers";
  import CreatePostModal from "$lib/components/modals/create-post/CreatePostModal.svelte";

  const modalStore = getModalStore();

  const modal: ModalSettings = {
    type: "component",
    component: { ref: CreatePostModal },
    title: "New post",
    body: "Complete the form below and then press submit.",
  };
</script>

<div class="xl:px-4">
  <button
    on:click={() => modalStore.trigger(modal)}
    type="button"
    class="btn variant-filled-tertiary font-medium w-full"
  >
    <span>
      <Plus size="20" class="mx-auto"></Plus>
    </span>
    <span class="hidden xl:inline">New post</span>
  </button>
</div>
