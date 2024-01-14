<script lang="ts">
  import { Circle } from "svelte-loading-spinners";
  import { nostrHandler } from "$lib/nostr";
  import { authUser } from "$lib/stores/Auth";
  import { goto } from "$app/navigation";
  import { getPath, ROUTES } from "$lib/utils/routes";
  import { onMount } from "svelte";
  import { localAuthStorage } from "$lib/stores/LocalStorage";
  import { enhance } from "$app/forms";
  import { getToastStore } from "@skeletonlabs/skeleton";

  const toastStore = getToastStore();

  let loading: boolean = false;
  let disabled: boolean = false;
  let privateKey: string | null = null;
  let publicKey: string | null = null;

  const onSubmit = async () => {
    loading = true;
    disabled = true;
    return async () => {
      try {
        await authUser.logInAnonymously(undefined, privateKey);
        await goto(getPath(ROUTES.FEED));
      } catch (error: any) {
        toastStore.trigger({
          message: error.message,
          background: "variant-filled-error",
          classes: "rounded-2xl, font-semibold",
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
    <form method="POST" class="w-full" use:enhance={onSubmit}>
      <h2 class="mb-3 pl-1 h2 text-center">
        <span
          class="bg-gradient-to-br from-red-700 to-yellow-500 bg-clip-text text-transparent box-decoration-clone"
        >
          Nostr login
        </span>
      </h2>
      <div class="text-center mb-6">
        Your keys will not be stored in our backend.
      </div>
      <div>
        <div class="font-semibold pl-1 mb-2">Your private key</div>
        <input
          type="text"
          class="input px-3 py-2 rounded-2xl mb-4"
          placeholder="type your private key"
          {disabled}
          bind:value={privateKey}
        />
        <div class="font-semibold pl-1 mb-2">Your public key</div>
        <input
          type="text"
          class="input px-3 py-2 rounded-2xl mb-4"
          placeholder="type your public key"
          {disabled}
          bind:value={publicKey}
        />
      </div>
      <button
        type="submit"
        class="btn bg-gradient-to-r from-blue-800 to-cyan-300 rounded-2xl w-full font-semibold mt-2"
        {disabled}
        formaction="/sign-in?/login-anonymous"
      >
        {#if loading}
          <span class="mr-2">
            <Circle size="15" color="white" unit="px"></Circle>
          </span>
        {/if}
        Log with private and public key
      </button>
    </form>
  </div>
</div>
