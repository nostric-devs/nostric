<script lang="ts">
  import { AuthStates, auth_state, login_to_ii } from "../store/auth";

  let disabled = false;
  const login = async () => {
    disabled = true;
    await login_to_ii();
    disabled = false;
  }

</script>

<div class="hero min-h-screen pt-8 sm:pt-0 content-start sm:content-center">
  <div class="text-center hero-content ">
    <div class="max-w-xl ">
      <h1
        class="mb-5 text-4xl sm:text-5xl font-bold text-primary dark:text-white"
      >
        Welcome!
      </h1>

      {#if $auth_state === AuthStates.ANONYMOUS}
        <button class="btn btn-primary" disabled="{disabled}" on:click={() => login()} >
          {#if disabled}
            <span
              class="inline-block h-4 w-4 rounded-full mr-2 border-2 animate-spin border-b-current border-r-current border-t-transparent border-l-transparent"
            ></span>
          {/if}
          { disabled ? "Identifying" : "Log in with Internet Identity" }
        </button>
      {:else if $auth_state === AuthStates.IDENTIFIED}
        <button class="btn btn-primary btn-disabled">
          <span
            class="inline-block h-4 w-4 rounded-full mr-2 border-2 animate-spin border-b-current border-r-current border-t-transparent border-l-transparent"
          ></span>
          Identified, initializing
        </button>
      {:else if $auth_state === AuthStates.ERROR}
        <div class="text-lg font-semibold mt-8">An error occurred.</div>
      {/if}

    </div>
  </div>

</div>
