<script lang="ts">
  import {
    getToastStore,
    clipboard,
    ProgressRadial,
  } from "@skeletonlabs/skeleton";
  import type { ToastStore } from "@skeletonlabs/skeleton";
  import { authUser } from "$lib/stores/Auth";
  import type { NDKUserProfile } from "@nostr-dev-kit/ndk";
  import { Copy } from "svelte-feathers";
  import { onMount } from "svelte";

  const toastStore: ToastStore = getToastStore();
  let disabled: boolean = false;
  let loading: boolean = false;

  let userProfile: NDKUserProfile = {};

  const triggerClipboardToast = (message: string): void => {
    toastStore.trigger({
      message,
      background: "variant-filled-secondary",
      classes: "rounded-2xl, font-semibold",
      timeout: 1000,
    });
  };

  const updateOnSubmit = async () => {
    loading = true;
    disabled = true;
    try {
      if ($authUser.nostr) {
        await $authUser.nostr.updateProfile(userProfile);
        toastStore.trigger({
          message: `Your profile ${userProfile?.name} was successfully updated.`,
          background: "variant-filled-success",
          classes: "rounded-2xl, font-semibold",
        });
      }
    } catch (error) {
      toastStore.trigger({
        message: error as string,
        background: "variant-filled-error",
        classes: "rounded-2xl, font-semibold",
      });
    } finally {
      loading = false;
      disabled = false;
    }
  };

  onMount(async () => {
    userProfile = JSON.parse(
      JSON.stringify($authUser.nostr?.getUser()?.profile),
    );
  });
</script>

<div class="m-4">You can update your profile info here.</div>
<form class="w-full px-4">
  <div>
    <div class="font-semibold pl-1 mb-2">Username</div>
    <input
      type="text"
      name="userName"
      class="input px-3 py-2 rounded-md mr-2 mb-4"
      placeholder="type in your new Nostr user name"
      bind:value={userProfile.name}
      {disabled}
    />
  </div>
  <div>
    <div class="font-semibold pl-1 mb-2">Profile picture URL</div>
    <div>
      <input
        type="text"
        name="userName"
        class="input px-3 py-2 rounded-md mr-2 mb-4"
        placeholder="Type your image URL"
        bind:value={userProfile.image}
        {disabled}
      />
    </div>
  </div>
  <div class="mb-8">
    <div class="font-semibold pl-1 mb-2">Bio</div>
    <div>
      <textarea
        class="textarea rounded-md"
        rows="6"
        name="bio"
        bind:value={userProfile.about}
      ></textarea>
    </div>
  </div>
  <div class="mb-4">
    <div class="font-semibold pl-1 mb-2">Private key</div>
    <div class="flex">
      <input
        type="text"
        name="privateKey"
        class="input px-3 py-2 rounded-md mr-3"
        data-clipboard="privateKey"
        value={$authUser.nostr?.getPrivateKey()}
        readonly
      />
      <button
        type="button"
        use:clipboard={{ input: "privateKey" }}
        class="btn variant-filled rounded-md font-semibold"
        on:click={() =>
          triggerClipboardToast("Private key copied to clipboard")}
      >
        <span>Copy</span>
        <Copy size="15"></Copy>
      </button>
    </div>
  </div>
  <div class="mb-4">
    <div class="font-semibold pl-1 mb-2">Public key</div>
    <div class="flex">
      <input
        type="text"
        name="publicKey"
        class="input px-3 py-2 rounded-md mr-3"
        data-clipboard="publicKey"
        value={$authUser.nostr?.getPublicKey()}
        readonly
      />
      <button
        type="button"
        use:clipboard={{ input: "publicKey" }}
        class="btn variant-filled rounded-md font-semibold"
        on:click={() => triggerClipboardToast("Public key copied to clipboard")}
      >
        <span>Copy</span>
        <Copy size="15"></Copy>
      </button>
    </div>
  </div>
  <button
    on:click={updateOnSubmit}
    class="btn variant-filled-primary mt-8 rounded-md w-full font-semibold mb-6"
    disabled={disabled || !userProfile.name}
  >
    {#if loading}
      <span class="mr-2">
        <ProgressRadial width="w-4" />
      </span>
    {/if}
    Update your profile
  </button>
</form>
