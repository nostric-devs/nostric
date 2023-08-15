<script lang="ts">
  import { createActor } from "../../../declarations/backend";
  import { AuthClient } from "@dfinity/auth-client";
  import { onMount } from "svelte";

  let client;
  let loggedIn: boolean = false;

  const init = async () => {
    console.log("Init");
    client = await AuthClient.create();
    if (await client.isAuthenticated()) {
      loggedIn = true;
      console.log(
        "Init, identity: ",
        client,
        client.getIdentity().getPrincipal().toString()
      );
      if (import.meta.env.MODE != "development") {
        // Only assign identity on the mainnet to the agent, send anonymouse call locally for now
        //Actor.agentOf($actor).replaceIdentity(client.getIdentity());
      }
      //userId.set(client.getIdentity().getPrincipal().toString());
      //loggedIn.set(true);
    } else {
      console.log("Init, not logged in");
    }
  };

  const login = async () => {
    client.login({
      //identityProvider: "https://nfid.one" + AUTH_PATH,
      identityProvider: "https://identity.ic0.app/#authorize",
      onSuccess: handleAuth,
      windowOpenerFeatures: `
      left=${window.screen.width / 2 - 525 / 2},
      top=${window.screen.height / 2 - 705 / 2},
      toolbar=0,location=0,menubar=0,width=525,height=705
    `,
    });
  };

  function handleAuth() {
    loggedIn = true;
    if (import.meta.env.MODE != "development") {
      //Actor.agentOf($actor).replaceIdentity(client.getIdentity());
    } else {
      console.log("Logged in");
    }
  }

  async function logout() {
    await client.logout();
    loggedIn = false;
    console.log("Logged out");
  }

  let input = "";
  let disabled = false;
  let greeting = "";

  const handleOnSubmit = async () => {
    disabled = true;

    try {
      // Canister IDs are automatically expanded to .env config - see vite.config.ts
      const canisterId = import.meta.env.VITE_BACKEND_CANISTER_ID;

      // We pass the host instead of using a proxy to support NodeJS >= v17 (ViteJS issue: https://github.com/vitejs/vite/issues/4794)
      const host = import.meta.env.VITE_HOST;

      // Create an actor to interact with the IC for a particular canister ID
      const actor = createActor(canisterId, { agentOptions: { host } });

      // Call the IC
      greeting = await actor.greet(input);
    } catch (err: unknown) {
      console.error(err);
    }

    disabled = false;
  };
  onMount(init);
</script>

<main>
  <img src="logo2.svg" alt="DFINITY logo" />
  <br />
  <br />

  <form on:submit|preventDefault={handleOnSubmit}>
    <label for="name">Enter your name: &nbsp;</label>
    <input id="name" alt="Name" type="text" bind:value={input} {disabled} />
    <button type="submit">Click Me!</button>
  </form>

  <section id="greeting">
    {greeting}
  </section>
  {#if !loggedIn}
    <button class="btn btn-lg variant-filled" on:click={login}>Log in</button>
  {:else}
    <button class="btn btn-lg variant-filled" on:click={logout}>Log out</button>
  {/if}
</main>

<style lang="scss">
  img {
    max-width: 50vw;
    max-height: 25vw;
    display: block;
    margin: auto;
  }

  form {
    display: flex;
    justify-content: center;
    gap: 0.5em;
    flex-flow: row wrap;
    max-width: 40vw;
    margin: auto;
    align-items: baseline;
    font-family: sans-serif;
    font-size: 1.5rem;
  }

  button[type="submit"] {
    padding: 5px 20px;
    margin: 10px auto;
    float: right;
  }

  #greeting {
    margin: 10px auto;
    padding: 10px 60px;
    border: 1px solid #222;
  }

  #greeting:empty {
    display: none;
  }
</style>
