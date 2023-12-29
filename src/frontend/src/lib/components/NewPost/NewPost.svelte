<script lang="ts">
  import { getModalStore } from "@skeletonlabs/skeleton";
  import type {
    ModalSettings,
    ModalComponent,
    ModalStore,
  } from "@skeletonlabs/skeleton";
  import { Plus } from "svelte-feathers";
  import NewPostForm from "./NewPostForm.svelte";

  const modalStore = getModalStore();

  // const modal: ModalSettings = {
  //   type: "alert",
  //   // Data
  //   title: "Example Alert",
  //   body: "This is an example modal.",
  //   image: "https://i.imgur.com/WOgTG96.gif",
  // };

  const c: ModalComponent = { ref: NewPostForm };
  const modal: ModalSettings = {
    type: "component",
    component: c,
    title: "New post",
    body: "Complete the form below and then press submit.",
    response: (r) => console.log("response:", r),
  };

  function showModal() {
    modalStore.trigger(modal);
  }
</script>

<button
  on:click={showModal}
  type="button"
  class="btn variant-filled-tertiary m-4 font-medium"
  style="width: calc(100% - 32px);"
>
  <span>
    <Plus size="20" class="mx-auto"></Plus>
  </span>
  <span class="hidden xl:inline">New post</span>
</button>
