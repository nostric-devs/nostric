<script lang="ts">
  import type { SvelteComponent } from "svelte";

  // Stores
  import { getModalStore, getToastStore } from "@skeletonlabs/skeleton";

  // Props
  /** Exposes parent props to this component. */
  export let parent: SvelteComponent;

  const modalStore = getModalStore();

  // Form Data
  const formData = {
    content: "",
  };

  const toastStore = getToastStore();

  const t = {
    message: "Post has been published",
    background: "variant-filled-success",
  };

  // We've created a custom submit function to pass the response and close the modal.
  function onFormSubmit(): void {
    if ($modalStore[0].response) $modalStore[0].response(formData);
    modalStore.close();
    toastStore.trigger(t);
  }

  // Base Classes
  const cBase = "card p-6 w-modal shadow-xl space-y-8";
  const cHeader = "text-2xl font-bold";
  const cForm =
    "border border-surface-500 p-4 space-y-4 rounded-container-token";
</script>

{#if $modalStore[0]}
  <div class="modal-example-form {cBase}">
    <header class={cHeader}>{$modalStore[0].title ?? "(title missing)"}</header>
    <!-- <article>{$modalStore[0].body ?? "(body missing)"}</article> -->
    <!-- Enable for debugging: -->
    <!-- <form class="modal-form {cForm}"> -->
    <form class="modal-form">
      <label class="label">
        <!-- <span>Name</span> -->
        <textarea
          class="textarea p-4 outline-none"
          bind:value={formData.content}
          placeholder="Write something"
          rows="5"
        />
      </label>
    </form>
    <!-- prettier-ignore -->
    <footer class="modal-footer {parent.regionFooter}">
        <button class="btn {parent.buttonNeutral}" on:click={parent.onClose}>{parent.buttonTextCancel}</button>
        <button class="btn {parent.buttonPositive}" on:click={onFormSubmit}>Publish</button>
    </footer>
  </div>
{/if}
