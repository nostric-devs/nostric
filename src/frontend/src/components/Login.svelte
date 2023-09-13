<script lang="ts">
  import { AuthStates, login_to_ii, auth_state, nostr_service } from "../store/auth";
  import Alert from "./Alert.svelte";
  import Spinner from "./Spinner.svelte";

  let disabled = false;
  let current_state;
  $: current_state = $auth_state;

  const login = async () => {
    auth_state.set_anonymous();
    disabled = true;
    await login_to_ii();
    disabled = false;
  }

  export let currentRoute;
  export let params;

</script>

<div class="hero min-h-screen pt-8 sm:pt-0 content-start sm:content-center">
  <div class="text-center">
    <div>
      <h1
        class="mb-5 text-4xl sm:text-5xl font-bold text-primary dark:text-white"
      >
        Nostric
      </h1>

      {#if current_state === AuthStates.ANONYMOUS }
        <button class="btn btn-primary" disabled="{ disabled }" on:click={() => login()} >
          {#if disabled}
            <Spinner/>
          {/if}
          <span class="text-white">
            { disabled ? "Identifying" : "Log in with Internet Identity" }
          </span>
        </button>
      {:else if current_state === AuthStates.IDENTIFIED }
        <button class="btn btn-primary btn-disabled" disabled>
          <Spinner/>
          <span class="text-white">Identified, initializing</span>
        </button>
      {:else if current_state === AuthStates.ERROR }
        <button class="btn btn-primary text-white" on:click={() => login()} >
          Try to login again
        </button>
        {#if current_state === AuthStates.ERROR}
          <div class="mt-3">
            <Alert />
          </div>
        {/if}
      {:else if current_state === AuthStates.REGISTERED }
       <span>Welcome</span>
      {/if}

    </div>
  </div>

</div>
