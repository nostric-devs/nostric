<script lang="ts">
  import "../app.postcss";
  import { initializeStores, Toast } from "@skeletonlabs/skeleton";
  import { Modal } from "@skeletonlabs/skeleton";
  import CreatePostModal from "$lib/components/modals/create-post/CreatePostModal.svelte";
  import type { ModalComponent } from "@skeletonlabs/skeleton";
  const modalRegistry: Record<string, ModalComponent> = {
    createPostModal: { ref: CreatePostModal },
  };

  initializeStores();
</script>

<Toast />

<Modal components={modalRegistry} />

<slot />
