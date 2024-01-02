<script lang="ts">
  import type { NDKUserProfile } from "@nostr-dev-kit/ndk";
  import { Circle } from "svelte-loading-spinners";
  import { Copy } from "svelte-feathers";
  import { getToastStore, clipboard } from "@skeletonlabs/skeleton";
  import type { ToastStore } from "@skeletonlabs/skeleton";
  import { onMount } from "svelte";
  import { nostrHandler, NostrUserHandler } from "$lib/nostr";
  import DfinityLogo from "$lib/assets/images/dfinity-logo.svg";
  import Alert from "$lib/components/alerts/Alert.svelte";
  import { enhance } from '$app/forms';
  import { alert, AlertTypes } from "$lib/stores/Alerts";
  import { goto } from "$app/navigation";
  import { get_path, ROUTES } from "$lib/utils/routes";
  import { authUser } from "$lib/stores/Auth";
  import { localKeyStorage } from "$lib/stores/LocalStorage";

  const toastStore : ToastStore = getToastStore();

  let loading : boolean = false;
  let disabled : boolean = false;

  let privateKey : string;
  let publicKey : string;
  let userProfile : NDKUserProfile = {
    name: "",
    image: "",
    bio: "",
  }

  const triggerToast = (message: string) : void => {
    toastStore.trigger({
      message,
      background: "variant-filled-secondary",
      classes: "rounded-2xl, font-semibold",
      timeout: 1000,
    });
  }

  // const signUpAnonymous = async () => {
  //   loading = true;
  //   disabled = true;
  //
  //   let nostrUser: NostrUserHandler = NostrUserHandler.getInstance(privateKey);
  //
  //   try {
  //     await nostrUser.initNewUser(userProfile);
  //     authUser.setNostrUserHandler(nostrUser);
  //     authUser.setNostrAuthenticated();
  //     localKeyStorage.update(() => privateKey);
  //     // await goto(get_path(ROUTES.FEED));
  //   } catch(err) {
  //     alert.fill("Register unsuccessful", "Unable to register the user", AlertTypes.ERROR);
  //     console.error(err);
  //   }
  //
  //   loading = false;
  //   disabled = false;
  //
  // }

  const onSubmit = async () => {
    loading = true;
    disabled = true;
    return async () => {
      let nostrUser: NostrUserHandler = NostrUserHandler.getInstance(privateKey);
      try {
        await nostrUser.initNewUser(userProfile);
        authUser.setNostrUserHandler(nostrUser);
        authUser.setNostrAuthenticated();
        localKeyStorage.update(() => privateKey);
        await goto(get_path(ROUTES.FEED));
      } catch(err) {
        alert.fill("Register unsuccessful", "Unable to register the user", AlertTypes.ERROR);
        console.error(err);
      }
      loading = false;
      disabled = false;
    };
  }

  onMount(async () => {
    ({ privateKey, publicKey } = await nostrHandler.generateKeyPair());
  });

  export let identity : boolean = false;

</script>

<div class="w-1/2 mx-auto">
  <form method="POST" class="w-full" use:enhance={onSubmit}>
    <h2 class="mb-3 pl-1 h2 text-3xl text-center">
      <span class="bg-gradient-to-br from-red-700 to-yellow-500 bg-clip-text text-transparent box-decoration-clone">
        Create new Nostr account
      </span>
    </h2>
    <div class="text-center mb-6">
      Your keys will not be stored in our backend, make a copy for any future use.
    </div>
    <Alert />
    <div class="mt-6">
      <div class="font-semibold pl-1 mb-2">Your new username</div>
      <input
        type="text"
        name="userName"
        class="input px-3 py-2 rounded-2xl mr-2 mb-4"
        placeholder="type in your new Nostr user name"
        bind:value={userProfile.name}
        disabled={disabled}
      />
    </div>
    <div class="mb-4">
      <div class="font-semibold pl-1 mb-2">Your new private key</div>
      <div class="flex">
        <input
          type="text"
          name="privateKey"
          class="input px-3 py-2 rounded-2xl mr-3"
          data-clipboard="privateKey"
          value={privateKey}
          readonly
        />
        <button
          type="button"
          use:clipboard={{ input: "privateKey" }}
          class="btn variant-filled rounded-2xl font-semibold"
          on:click={() => triggerToast("Private key copied to clipboard")}
        >
          <span>Copy</span>
          <Copy size="15"></Copy>
        </button>
      </div>
    </div>
    <div class="mb-4">
      <div class="font-semibold pl-1 mb-2">Your new public key</div>
      <div class="flex">
        <input
          type="text"
          name="publicKey"
          class="input px-3 py-2 rounded-2xl mr-3"
          data-clipboard="publicKey"
          value={publicKey}
          readonly
        />
        <button
          type="button"
          use:clipboard={{ input: "publicKey" }}
          class="btn variant-filled rounded-2xl font-semibold"
          on:click={() => triggerToast("Public key copied to clipboard")}
        >
          <span>Copy</span>
          <Copy size="15"></Copy>
        </button>
      </div>
    </div>
    <div class="mb-8">
      <div class="font-semibold pl-1 mb-2">Your bio</div>
      <div>
        <textarea class="textarea rounded-2xl" rows="3" name="bio" bind:value={userProfile.bio}></textarea>
      </div>
    </div>
    {#if identity}
      <button
        type="button"
        class="btn bg-gradient-to-r from-pink-600 to-violet-500 rounded-2xl w-full font-semibold mb-6"
        formaction="/sign-in?/login"
        disabled={disabled || !userProfile.name}
      >
        {#if loading}
          <span class="mr-2">
            <Circle size="15" color="white" unit="px"></Circle>
          </span>
        {/if}
        Create new account with Internet Identity
        <span class="ml-2">
          <img src={DfinityLogo} alt="dfinity-logo" width="25px" height="10px"/>
        </span>
      </button>
    {:else}
      <button
        type="submit"
        formaction="/sign-in?/login"
        class="btn bg-gradient-to-r from-blue-800 to-cyan-300 rounded-2xl w-full font-semibold mb-6"
        disabled={disabled || !userProfile.name}
      >
        {#if loading}
          <span class="mr-2">
            <Circle size="15" color="white" unit="px"></Circle>
          </span>
        {/if}
        Create new account
      </button>
    {/if}
  </form>
</div>

