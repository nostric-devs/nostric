<script lang="ts">
  import DfinityLogo from "$lib/assets/images/dfinity-logo.svg";
  import Alert from "$lib/components/alerts/Alert.svelte";
  import {
    AssociatedFetchError,
    authUser,
    NotYetAssociatedError,
  } from "$lib/stores/Auth";
  import { getToastStore } from "@skeletonlabs/skeleton";
  import { goto } from "$app/navigation";
  import { getPath, ROUTES } from "$lib/utils/routes";
  import { Circle } from "svelte-loading-spinners";
  import type { ToastStore } from "@skeletonlabs/skeleton";
  import { enhance } from "$app/forms";

  const toastStore: ToastStore = getToastStore();

  let loading: IdentitySubmit | null = null;
  let disabled: boolean = false;
  enum IdentitySubmits {
    SIGN_UP,
    LOG_IN,
  }
  type IdentitySubmit = IdentitySubmits.LOG_IN | IdentitySubmits.SIGN_UP;

  const onSubmit = async (submitType: IdentitySubmit, cancel: Function) => {
    loading = submitType;
    disabled = true;
    return async () => {
      try {
        await authUser.logInWithIdentity();
        await goto(getPath(ROUTES.FEED));
        if (submitType === IdentitySubmits.SIGN_UP) {
          toastStore.trigger({
            message:
              "This Internet Identity is already associated with a user. Logged in.",
            background: "variant-filled-warning",
            classes: "rounded-2xl, font-semibold",
          });
        }
      } catch (error) {
        if (error instanceof NotYetAssociatedError) {
          await goto(getPath(ROUTES.SIGN_IN, ROUTES.REGISTER_IDENTITY));
          if (submitType === IdentitySubmits.LOG_IN) {
            toastStore.trigger({
              message:
                "This Internet Identity is not yet associated with a user. Register.",
              background: "variant-filled-warning",
              classes: "rounded-2xl, font-semibold",
            });
          }
        } else if (error instanceof AssociatedFetchError) {
          toastStore.trigger({
            message:
              "Unable to fetch user associated with the Identity. Check your connection.",
            background: "variant-filled-warning",
            classes: "rounded-2xl, font-semibold",
          });
        } else {
          toastStore.trigger({
            message: "Unable to verify Internet Identity.",
            background: "variant-filled-error",
            classes: "rounded-2xl, font-semibold",
          });
        }
        // prevent the submission and creation of auth server side cookie
        cancel();
      } finally {
        loading = null;
        disabled = false;
      }
    };
  };
</script>

<div class="w-screen h-screen flex justify-center items-center">
  <div class="w-9/12 flex flex-col mx-auto">
    <h1 class="text-6xl text-center mb-12 font-extrabold">
      <span
        class="bg-gradient-to-br from-red-700 to-yellow-500 bg-clip-text text-transparent box-decoration-clone"
      >
        Try Nostric.
      </span>
    </h1>
    <div class="mx-6">
      <Alert />
    </div>
    <div class="xl:flex mt-12">
      <div class="xl:w-1/2 flex flex-col xl:pr-5">
        <h1 class="h1 text-4xl text-center mb-10">
          <span
            class="bg-gradient-to-br from-blue-600 to-cyan-300 bg-clip-text text-transparent box-decoration-clone"
          >
            Anonymous user
          </span>
        </h1>
        <div class="xl:ml-8">
          <ul class="font-semibold list-disc ml-4">
            <li>use Nostric App with limited features</li>
            <li>completely anonymous</li>
            <li>nothing is stored in our backend</li>
            <li>your keys will never leave your browser</li>
          </ul>
        </div>
        <div class="mt-12">
          <div class="mx-auto w-full xl:px-6 text-center">
            <button
              type="button"
              class="btn bg-gradient-to-r from-blue-800 to-cyan-300 rounded-2xl w-full font-semibold mt-2"
              {disabled}
              on:click={() => goto(getPath(ROUTES.SIGN_IN))}
            >
              Log with private and public key
            </button>
          </div>
          <div class="mx-auto w-full xl:px-6 text-center mt-4">
            <button
              type="button"
              class="btn variant-filled rounded-2xl w-full font-semibold"
              {disabled}
              on:click={() =>
                goto(getPath(ROUTES.SIGN_IN, ROUTES.REGISTER_ANONYMOUS))}
            >
              Create new Nostr account
            </button>
          </div>
        </div>
      </div>
      <div class="xl:w-1/2 flex flex-col xl:pl-5 mt-8 xl:mt-0">
        <div class="text-4xl text-center mb-10 font-extrabold">
          <div
            class="bg-gradient-to-br from-pink-600 to-violet-500 bg-clip-text text-transparent box-decoration-clone flex flex-col xl:flex-row justify-center content-center"
          >
            <div class="mr-2">Nostric user</div>
            <div class="badge variant-soft uppercase rounded-2xl mt-4 xl:mt-0">
              recommended
            </div>
          </div>
        </div>
        <div class="xl:ml-8">
          <ul class="font-semibold list-disc ml-4">
            <li>
              fully <a href="somelink" target="_blank" class="underline"
                >featured</a
              > Nostric client
            </li>
            <li>
              keys securely <a href="somelink" target="_blank" class="underline"
                >encrypted in an ICP canister</a
              >
            </li>
            <li>best user experience</li>
            <li>
              possibility to log in using <a
                href="somelink"
                target="_blank"
                class="underline">Internet Identity</a
              >
            </li>
          </ul>
        </div>
        <div class="mt-12">
          <form
            method="POST"
            use:enhance={({ cancel }) =>
              onSubmit(IdentitySubmits.LOG_IN, cancel)}
            class="mx-auto w-full xl:px-6 text-center"
          >
            <button
              type="submit"
              class="btn bg-gradient-to-r from-pink-600 to-violet-500 rounded-2xl w-full font-semibold mt-2"
              {disabled}
              formaction="/sign-in?/login-identity"
            >
              {#if loading === IdentitySubmits.LOG_IN}
                <span class="mr-2">
                  <Circle size="15" color="white" unit="px" />
                </span>
              {/if}
              Log in using Internet Identity
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
          <form
            method="POST"
            use:enhance={({ cancel }) =>
              onSubmit(IdentitySubmits.SIGN_UP, cancel)}
            class="mx-auto w-full xl:px-6 text-center mt-4"
          >
            <button
              type="submit"
              class="btn variant-filled rounded-2xl w-full font-semibold"
              {disabled}
              formaction="/sign-in?/login-identity"
            >
              {#if loading === IdentitySubmits.SIGN_UP}
                <span class="mr-2">
                  <Circle size="15" color="black" unit="px" />
                </span>
              {/if}
              Create new Nostr account with Internet Identity
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
    </div>
  </div>
</div>
