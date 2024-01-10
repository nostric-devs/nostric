<script lang="ts">
  import DfinityLogo from "$lib/assets/images/dfinity-logo.svg";
  import NewAccount from "$lib/components/sign-in/NewAccount.svelte";
  import ExistingAccount from "$lib/components/sign-in/ExistingAccount.svelte";
  import Alert from "$lib/components/alerts/Alert.svelte";

  enum SignInOptions {
    AnonymousSignUp,
    AnonymousLogIn,
    IdentitySignUp,
    IdentityLogIn,
  }

  type SelectedOption =
    | SignInOptions.AnonymousSignUp
    | SignInOptions.AnonymousLogIn
    | SignInOptions.IdentitySignUp
    | SignInOptions.IdentityLogIn;

  let activeOption: SelectedOption | undefined;

  // const switchOptions = async (option: SelectedOption) : Promise<void> => {
  //   activeOption = option;
  //   if (option === SignInOptions.AnonymousSignUp || option === SignInOptions.IdentitySignUp) {
  //     ({ privateKey, publicKey } = await nostrHandler.generateKeyPair());
  //   } else {
  //     privateKey = $activeNostricUserKeys.privateKey ?? "";
  //     publicKey = $activeNostricUserKeys.publicKey ?? "";
  //   }
  // }

  // onMount(async () => {
  //   ({ privateKey, publicKey } = $activeNostricUserKeys);
  // });
</script>

<div class="w-screen h-screen flex justify-center items-center">
  {#if activeOption === SignInOptions.AnonymousSignUp}
    <NewAccount identity={false} />
  {:else if activeOption === SignInOptions.AnonymousLogIn}
    <form method="POST" action="/sign-in?/login" class="w-full">
      <ExistingAccount identity={false} />
    </form>
  {:else if activeOption === SignInOptions.IdentitySignUp}
    <form method="POST" action="/sign-in?/login" class="w-full">
      <NewAccount identity={true} />
    </form>
  {:else if activeOption === SignInOptions.IdentityLogIn}
    <form method="POST" action="/sign-in?/login" class="w-full">
      <ExistingAccount identity={true} />
    </form>
  {:else}
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
                on:click={() => (activeOption = SignInOptions.AnonymousLogIn)}
              >
                Log with private and public key
              </button>
            </div>
            <div class="mx-auto w-full xl:px-6 text-center mt-4">
              <button
                type="button"
                class="btn variant-filled rounded-2xl w-full font-semibold"
                on:click={() => (activeOption = SignInOptions.AnonymousSignUp)}
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
              <div
                class="badge variant-soft uppercase rounded-2xl mt-4 xl:mt-0"
              >
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
                keys securely <a
                  href="somelink"
                  target="_blank"
                  class="underline">encrypted in an ICP canister</a
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
            <div class="mx-auto w-full xl:px-6 text-center">
              <button
                type="button"
                class="btn bg-gradient-to-r from-pink-600 to-violet-500 rounded-2xl w-full font-semibold mt-2"
              >
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
            </div>
            <div class="mx-auto w-full xl:px-6 text-center mt-4">
              <button
                type="button"
                class="btn variant-filled rounded-2xl w-full font-semibold"
                on:click={() => (activeOption = SignInOptions.IdentitySignUp)}
              >
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
            </div>
          </div>
        </div>
      </div>
    </div>
  {/if}
</div>
