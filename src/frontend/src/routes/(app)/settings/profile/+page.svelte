<script lang="ts">
  import { getToastStore, clipboard } from "@skeletonlabs/skeleton";
  import type { ToastStore } from "@skeletonlabs/skeleton";
  import { authUser } from "$lib/stores/Auth";
  import { feed, type NodeEvent } from "$lib/stores/Feed";
  import type { NDKEvent, NDKUserProfile } from "@nostr-dev-kit/ndk";
  import { Copy } from "svelte-feathers";

  let events: NodeEvent[] = [];
  const toastStore: ToastStore = getToastStore();
  let disabled: boolean = false;
  let loading: boolean = false;

  let userProfile: NDKUserProfile = {
    name: "",
    image: "",
    bio: "",
  };

  const triggerClipboardToast = (message: string): void => {
    toastStore.trigger({
      message,
      background: "variant-filled-secondary",
      classes: "rounded-2xl, font-semibold",
      timeout: 1000,
    });
  };

  $: {
    let parsedEvents: NodeEvent[] = [];
    for (const event of Object.values($feed) as NodeEvent[]) {
      if (
        event.isRoot() &&
        event.model.author.pubkey === $authUser.nostr?.getPublicKey()
      ) {
        parsedEvents.push(event.model);
      }
      parsedEvents = parsedEvents.sort(
        (x: NDKEvent, y: NDKEvent) => y.created_at - x.created_at,
      );
    }
    events = parsedEvents;
  }
  $: userProfile = $authUser.nostr.getUser()?.profile;
</script>

<!-- <UserProfile {user} {events} /> -->
<h1 class="h1 m-4">Profile Settings</h1>
<form method="POST" class="w-full">
  <div class="mt-6">
    <div class="font-semibold pl-1 mb-2">Your new username</div>
    <input
      type="text"
      name="userName"
      class="input px-3 py-2 rounded-2xl mr-2 mb-4"
      placeholder="type in your new Nostr user name"
      bind:value={userProfile.name}
      {disabled}
    />
  </div>
  <div class="mb-8">
    <div class="font-semibold pl-1 mb-2">Your bio</div>
    <div>
      <textarea
        class="textarea rounded-2xl"
        rows="3"
        name="bio"
        bind:value={userProfile.about}
      ></textarea>
    </div>
  </div>
  <div class="mb-4">
    <div class="font-semibold pl-1 mb-2">Your new private key</div>
    <div class="flex">
      <input
        type="text"
        name="privateKey"
        class="input px-3 py-2 rounded-2xl mr-3"
        data-clipboard="privateKey"
        value={$authUser.nostr?.getPrivateKey()}
        readonly
      />
      <button
        type="button"
        use:clipboard={{ input: "privateKey" }}
        class="btn variant-filled rounded-2xl font-semibold"
        on:click={() =>
          triggerClipboardToast("Private key copied to clipboard")}
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
        value={$authUser.nostr?.getPublicKey()}
        readonly
      />
      <button
        type="button"
        use:clipboard={{ input: "publicKey" }}
        class="btn variant-filled rounded-2xl font-semibold"
        on:click={() => triggerClipboardToast("Public key copied to clipboard")}
      >
        <span>Copy</span>
        <Copy size="15"></Copy>
      </button>
    </div>
  </div>
  <button
    type="submit"
    class="btn bg-gradient-to-r from-pink-600 to-violet-500 rounded-2xl w-full font-semibold mb-6"
    formaction="/sign-in?/login-identity"
    disabled={disabled || !userProfile.name}
  >
    {#if loading}
      <span class="mr-2">
        <Circle size="15" color="white" unit="px"></Circle>
      </span>
    {/if}
    Create new account with Internet Identity
    <span class="ml-2">
      <!-- <img
      src={DfinityLogo}
      alt="dfinity-logo"
      width="25px"
      height="10px"
    /> -->
    </span>
  </button>
</form>
