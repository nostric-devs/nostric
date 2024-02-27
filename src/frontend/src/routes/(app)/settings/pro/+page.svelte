<script lang="ts">
  import { AuthStates, authUser } from "$lib/stores/Auth";
  import type { Principal } from "@dfinity/principal";
  import { clipboard, getToastStore } from "@skeletonlabs/skeleton";
  import { onMount } from "svelte";
  import { QRCodeImage } from "svelte-qrcode-image";
  import { Copy } from "svelte-feathers";
  import Toaster from "$lib/components/toast/Toaster.svelte";
  import { updateLocalAuth } from "$lib/stores/LocalStorage";
  import { ProgressRadial } from "@skeletonlabs/skeleton";
  import { enhance } from "$app/forms";

  let loading: boolean = false;
  let address: string | undefined;
  let principal: Principal | undefined;
  const toastStore = getToastStore();

  const onVerifySubmit = async ({ cancel }) => {
    loading = true;
    return async () => {
      if ($authUser.identity) {
        try {
          let response = await $authUser.identity.verifyPayment();
          if (response) {
            authUser.setAuthState(AuthStates.PRO_AUTHENTICATED);
            updateLocalAuth(
              $authUser.nostr.getPrivateKey(),
              AuthStates.PRO_AUTHENTICATED,
            );
            toastStore.trigger({
              message: "You are now a pro user",
              background: "variant-filled-success",
              classes: "rounded-md, font-semibold",
            });
          } else {
            throw Error("Unable to verify payment");
          }
        } catch {
          toastStore.trigger({
            message: "Unable to verify payment",
            background: "variant-filled-error",
            classes: "rounded-md, font-semibold",
          });
          cancel();
        } finally {
          loading = false;
        }
      } else {
        cancel();
      }
    };
  };

  $: isPro = $authUser.authState === AuthStates.PRO_AUTHENTICATED;

  onMount(async () => {
    if ($authUser.identity && !isPro) {
      loading = true;
      address = await $authUser.identity.getDepositAddress();
      principal = await $authUser.identity.whoAmI();
      loading = false;
    }
  });
</script>

<div class="m-4">You can manage your Pro subscription here.</div>
{#if loading}
  <div class="w-full mt-24 flex items-center justify-center">
    <ProgressRadial />
  </div>
{:else if isPro}
  <h3 class="h3 mx-4">Your Pro subscription is active!</h3>
{:else}
  <div class="m-4">
    <h3 class="h3 mb-4">Open your Pro subscription!</h3>
    <div>Your principal</div>
    <div>{principal}</div>

    <div>
      <img class="w-24 mx-auto my-8" src="/img/ckbtc.png" alt="ckbtc" />
      <h2 class="text-xl mt-4 mb-4">
        Deposit 10 sats (ckBTC) to this address to become a pro:
      </h2>
      <div class="flex justify-center">
        <input
          type="text"
          name="address"
          class="input px-3 py-2 rounded-md mr-3"
          data-clipboard="address"
          value={address}
          readonly
        />
        <div>
          <Toaster
            message="Deposit address copied to clipboard"
            color="secondary"
          >
            <button
              type="button"
              use:clipboard={{ input: "address" }}
              class="btn variant-filled rounded-md font-semibold"
            >
              <span>Copy</span>
              <Copy size="15"></Copy>
            </button>
          </Toaster>
        </div>
      </div>
      <QRCodeImage
        text={address}
        displayStyle="border-style: dotted;"
        width={200}
        displayWidth={200}
        displayClass="mt-8 mx-auto"
      />
    </div>

    <div class="flex justify-center">
      <form method="POST" use:enhance={onVerifySubmit}>
        <button
          type="submit"
          class="btn variant-filled-primary btn-lg font-medium my-8"
          formaction="/sign-in?/login-pro"
        >
          Verify payment
        </button>
      </form>
    </div>
  </div>
{/if}
