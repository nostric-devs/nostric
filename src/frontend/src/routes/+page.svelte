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
  import Logo from "$lib/components/logo/Logo.svelte";
  import { LogIn } from "svelte-feathers";

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

<header class="text-gray-600 body-font">
  <div
    class="container mx-auto flex flex-wrap p-5 flex-col md:flex-row items-center"
  >
    <a
      href="/"
      class="flex title-font font-medium items-center text-gray-900 mb-4 md:mb-0"
    >
      <Logo />
      <span class="ml-3 text-4xl font-bold text-white">Nostric</span>
    </a>
    <nav
      class="md:mr-auto md:ml-4 md:py-1 md:pl-4 md:border-l md:border-gray-400 flex flex-wrap items-center text-base justify-center"
    >
      <a
        class="mr-5 text-white hover:text-gray-400 hover:underline cursor-pointer"
        >Home</a
      >
      <a
        class="mr-5 text-white hover:text-gray-400 hover:underline cursor-pointer"
        >Features</a
      >
      <a
        class="mr-5 text-white hover:text-gray-400 hover:underline cursor-pointer"
        >News</a
      >
      <a
        class="mr-5 text-white hover:text-gray-400 hover:underline cursor-pointer"
        >Contact</a
      >
    </nav>
    <button
      class="btn variant-filled-primary inline-flex items-center focus:outline-none rounded mt-4 md:mt-0 font-medium text-md"
      >Open App
      <LogIn class="m-1" size="18" />
    </button>
  </div>
</header>
<section class="text-gray-600 body-font">
  <div
    class="container mx-auto flex px-5 py-24 items-center justify-center flex-col"
  >
    <img
      class="lg:w-4/6 md:w-4/6 w-5/6 mb-10 object-cover object-center rounded"
      alt="hero"
      src="/img/nostricscreen.png"
    />
    <div class="text-center lg:w-2/3 w-full">
      <h1 class="title-font sm:text-4xl text-3xl mb-4 font-medium text-white">
        The most user-friendly Nostr client
      </h1>
      <p class="mb-8 leading-relaxed">
        Meggings kinfolk echo park stumptown DIY, kale chips beard jianbing
        tousled. Chambray dreamcatcher trust fund, kitsch vice godard disrupt
        ramps hexagon mustache umami snackwave tilde chillwave ugh. Pour-over
        meditation PBR&amp;B pickled ennui celiac mlkshk freegan photo booth af
        fingerstache pitchfork.
      </p>
      <div class="flex justify-center">
        <button
          class="btn variant-filled-primary inline-flex items-center focus:outline-none rounded mt-4 md:mt-0 font-medium text-md"
          >Try Nostric
          <LogIn class="m-1" size="18" />
        </button>
        <!-- <button class="ml-4 inline-flex text-gray-700 bg-gray-100 border-0 py-2 px-6 focus:outline-none hover:bg-gray-200 rounded text-lg">Button</button> -->
      </div>
    </div>
  </div>
</section>
<div class="w-screen flex justify-center items-center">
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
