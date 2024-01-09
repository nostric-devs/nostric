<script lang="ts">
  import { Circle } from "svelte-loading-spinners";
  import { nostrHandler, NostrUserHandler } from "$lib/nostr";
  import { authUser } from "$lib/stores/Auth";
  import { goto } from "$app/navigation";
  import { get_path, ROUTES } from "$lib/utils/routes";
  import { onMount } from "svelte";
  import { localKeyStorage } from "$lib/stores/LocalStorage";
  import { alert, AlertTypes } from "$lib/stores/Alerts";
  import { enhance } from "$app/forms";
  import Alert from "$lib/components/alerts/Alert.svelte";

  let loading: boolean = false;
  let disabled: boolean = false;
  let privateKey: string | null = null;
  let publicKey: string | null = null;

  const onSubmit = async () => {
    loading = true;
    disabled = true;

    return async () => {
      if (!privateKey) {
        alert.fill(
          "Register unsuccessful",
          "Private key must be specified",
          AlertTypes.ERROR,
        );
        loading = false;
        disabled = false;
      } else {
        let nostrUser: NostrUserHandler =
          NostrUserHandler.getInstance(privateKey);
        try {
          await nostrUser.initExistingUser();
          authUser.setNostrUserHandler(nostrUser);
          authUser.setNostrAuthenticated();
          localKeyStorage.update(() => privateKey);
          await goto(get_path(ROUTES.FEED));
        } catch (err) {
          alert.fill(
            "Register unsuccessful",
            "Unable to register the user",
            AlertTypes.ERROR,
          );
          console.error(err);
        }
      }
    };
  };

  onMount(async () => {
    privateKey = $localKeyStorage;
    if (privateKey) {
      publicKey =
        await nostrHandler.generatePublicKeyFromPrivateKey(privateKey);
    }
  });
</script>

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
    <div class="mb-6">
      <Alert />
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
      formaction="/sign-in?/login"
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
