<script lang="ts">
  import type { NDKUserProfile } from "@nostr-dev-kit/ndk";
  import { Copy } from "svelte-feathers";
  import { clipboard, ProgressRadial } from "@skeletonlabs/skeleton";
  import { onMount } from "svelte";
  import { nostrHandler } from "$lib/nostr";
  import DfinityLogo from "$lib/assets/images/dfinity-logo.svg";
  import { enhance } from "$app/forms";
  import { goto } from "$app/navigation";
  import { getPath, ROUTES } from "$lib/utils/routes";
  import { authUser } from "$lib/stores/Auth";
  import Toaster from "$lib/components/toast/Toaster.svelte";
  import { getToastStore } from "@skeletonlabs/skeleton";

  const toastStore = getToastStore();

  let loading: boolean = false;
  let disabled: boolean = false;
  let privateKey: string;
  let publicKey: string;
  let invitationCode: string;
  let userProfile: NDKUserProfile = {
    name: "",
    image: "",
    bio: "",
  };

  const onIdentityRegisterSubmit = async () => {
    loading = true;
    disabled = true;
    return async () => {
      try {
        await authUser.registerWithIdentity(privateKey, userProfile, invitationCode);
        toastStore.trigger({
          message: `Welcome, ${userProfile.name}. Successfully registered.`,
          background: "variant-filled-success",
          classes: "rounded-md, font-semibold",
        });
        await goto(getPath(ROUTES.FEED));
      } catch (error) {
        toastStore.trigger({
          message: error as string,
          background: "variant-filled-error",
          classes: "rounded-md, font-semibold",
        });
      } finally {
        loading = false;
        disabled = false;
      }
    };
  };

  onMount(async () => {
    if ($authUser.identity && $authUser.identity.isIdentityAuthenticated()) {
      // if this identity already has an associated account, log right in
      if (await $authUser.identity.isIdentityAssociated()) {
        await authUser.logInWithIdentity();
        await goto(getPath(ROUTES.FEED));
      }
    } else {
      // if identity was not authenticated, go back to home page
      await goto(getPath(ROUTES.HOMEPAGE));
      toastStore.trigger({
        message:
          "Cannot register using Internet Identity, you are not signed into one.",
        background: "variant-filled-error",
        classes: "rounded-md, font-semibold",
      });
    }
    ({ privateKey, publicKey } = await nostrHandler.generateKeyPair());
  });
</script>

<div class="w-screen h-screen flex justify-center items-center">
  <div class="w-1/2 mx-auto">
    <form method="POST" class="w-full" use:enhance={onIdentityRegisterSubmit}>
      <h2 class="mb-5 pl-1 h2 text-3xl text-center">
        <span> Create new Nostr account </span>
      </h2>
      <div class="text-center mb-6">
        Your keys will be securely stored in blockchain using Vetkeys.
      </div>
      <div class="mt-6">
        <div class="font-semibold pl-1 mb-2">Your new username</div>
        <input
          type="text"
          name="userName"
          class="input px-3 py-2 rounded-md mr-2 mb-4"
          placeholder="type in your new Nostr user name"
          bind:value={userProfile.name}
          {disabled}
        />
      </div>
      <div class="mb-4">
        <div class="font-semibold pl-1 mb-2">Your new private key</div>
        <div class="flex">
          <input
            type="text"
            name="privateKey"
            class="input px-3 py-2 rounded-md mr-3"
            data-clipboard="privateKey"
            value={privateKey}
            readonly
          />
          <Toaster message="Private key copied to clipboard" color="secondary">
            <button
              type="button"
              use:clipboard={{ input: "privateKey" }}
              class="btn variant-filled rounded-md font-semibold"
            >
              <span>Copy</span>
              <Copy size="15"></Copy>
            </button>
          </Toaster>
        </div>
      </div>
      <div class="mb-4">
        <div class="font-semibold pl-1 mb-2">Your new public key</div>
        <div class="flex">
          <input
            type="text"
            name="publicKey"
            class="input px-3 py-2 rounded-md mr-3"
            data-clipboard="publicKey"
            value={publicKey}
            readonly
          />
          <Toaster message="Public key copied to clipboard" color="secondary">
            <button
              type="button"
              use:clipboard={{ input: "publicKey" }}
              class="btn variant-filled rounded-md font-semibold"
            >
              <span>Copy</span>
              <Copy size="15"></Copy>
            </button>
          </Toaster>
        </div>
      </div>
      <div class="mb-2">
        <div class="font-semibold pl-1 mb-2">Your bio</div>
        <div>
          <textarea
            class="textarea rounded-md"
            rows="3"
            name="bio"
            bind:value={userProfile.bio}
          ></textarea>
        </div>
      </div>
      <div class="mb-8">
        <div class="font-semibold pl-1 mb-2">Invitation code</div>
        <input
          type="text"
          name="userName"
          class="input px-3 py-2 rounded-md mr-2 mb-4"
          placeholder="type in your invitation code"
          bind:value={invitationCode}
          {disabled}
        />
      </div>      
      <button
        type="submit"
        class="btn variant-filled-surface rounded-md w-full font-semibold mb-6"
        formaction="/sign-in?/login-identity"
        disabled={disabled || !userProfile.name}
      >
        {#if loading}
          <span class="mr-2">
            <ProgressRadial width="w-4" />
          </span>
        {/if}
        Create new account with Internet Identity
        <span class="ml-2">
          <img
            src={DfinityLogo}
            alt="dfinity-logo"
            width="25px"
            height="10px"
          />
        </span>
      </button>
    </form>
  </div>
</div>
