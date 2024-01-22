<script lang="ts">
  import { getModalStore } from "@skeletonlabs/skeleton";
  import type { ModalSettings, ModalComponent } from "@skeletonlabs/skeleton";
  import { MessageCircle, Plus } from "svelte-feathers";
  import CreatePostModal from "$lib/components/modals/create-post/CreatePostModal.svelte";
  import type { NDKEvent, NDKUser } from "@nostr-dev-kit/ndk";

  const modalStore = getModalStore();

  export let event: NDKEvent | undefined = undefined;
  export let author: NDKUser | undefined = undefined;

  const component: ModalComponent = { ref: CreatePostModal };
  const modal: ModalSettings = {
    type: "component",
    component,
    title: "Reply to post",
    body: "",
    meta: { event: event, author: author },
  };
</script>

<MessageCircle
  on:click={() => modalStore.trigger(modal)}
  size="20"
  class="cursor-pointer"
/>
