<script lang="ts">
  import { nostrHandler } from "$lib/nostr";
  import { authUser } from "$lib/stores/Auth";
  import { goto } from "$app/navigation";
  import { getPath, ROUTES } from "$lib/utils/routes";
  import { onMount } from "svelte";
  import { localAuthStorage } from "$lib/stores/LocalStorage";
  import { enhance } from "$app/forms";
  import { getToastStore, ProgressRadial } from "@skeletonlabs/skeleton";

  const toastStore = getToastStore();

  let loading: boolean = false;
  let disabled: boolean = false;
  let privateKey: string | null = null;
  let publicKey: string | null = null;

  const onAnonymousSubmit = async () => {
    loading = true;
    disabled = true;
    return async () => {
      try {
        await authUser.logInAnonymously(undefined, privateKey);
        await goto(getPath(ROUTES.FEED));
      } catch (error) {
        toastStore.trigger({
          message: error as string,
          background: "variant-filled-error",
          classes: "rounded-md, font-semibold",
        });
        console.error(error);
      } finally {
        loading = false;
        disabled = false;
      }
    };
  };

  onMount(async () => {
    privateKey = $localAuthStorage?.privateKey;
    if (privateKey) {
      publicKey =
        await nostrHandler.generatePublicKeyFromPrivateKey(privateKey);
    }
  });
</script>

<div class="w-screen h-screen flex justify-center items-center">
  <div class="w-1/2 mx-auto">
    <form method="POST" class="w-full" use:enhance={onAnonymousSubmit}>
      <h2 class="mb-5 pl-1 h2 text-center">
        <span> Nostr login </span>
      </h2>
      <div class="text-center mb-6">
        Your keys will not be stored in our backend.
      </div>
      <div>
        <div class="font-semibold pl-1 mb-2">Your private key</div>
        <input
          type="text"
          class="input px-3 py-2 rounded-md mb-4"
          placeholder="type your private key"
          {disabled}
          bind:value={privateKey}
        />
        <div class="font-semibold pl-1 mb-2">Your public key</div>
        <input
          type="text"
          class="input px-3 py-2 rounded-md mb-4"
          placeholder="type your public key"
          {disabled}
          bind:value={publicKey}
        />
      </div>
      <button
        type="submit"
        class="btn variant-filled-secondary rounded-md w-full font-semibold mt-2"
        {disabled}
        formaction="/sign-in?/login-anonymous"
      >
        {#if loading}
          <span class="mr-2">
            <ProgressRadial width="w-4" />
          </span>
        {/if}
        Log with private and public key
      </button>
    </form>
  </div>
</div>
