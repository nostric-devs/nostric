<script lang="ts">
  import "../app.postcss";
  import { initializeStores, Toast } from "@skeletonlabs/skeleton";
  import { Modal } from "@skeletonlabs/skeleton";
  import CreatePostModal from "$lib/components/modals/create-post/CreatePostModal.svelte";
  import type { ModalComponent } from "@skeletonlabs/skeleton";
  import { authUser } from "$lib/stores/Auth";

  const modalRegistry: Record<string, ModalComponent> = {
    createPostModal: { ref: CreatePostModal },
  };

  initializeStores();

  let pubkey: string = "";

  $: if ($authUser.nostr) {
    pubkey = `${$authUser.nostr.getPublicKey()}-${$authUser.loading}`;
  }
</script>

<Toast />

<Modal components={modalRegistry} />

{#key pubkey}
  <slot />
{/key}
