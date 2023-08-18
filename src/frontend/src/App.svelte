<script lang="ts">
  import Login from "./components/Login.svelte"
  import { crypto_service, auth_state, AuthStates } from "./store/auth";

  let key = "0123456789101112";
  let encrypted = "";
  let decrypted = "";

  const plug_and_play = async () => {
    encrypted = await crypto_service.encrypt(key);
    decrypted = await crypto_service.decrypt(encrypted);
  }

</script>

{#if $auth_state === AuthStates.AUTHENTICATED}

  <div>
    <div>key value: { key }</div>
    <button class="btn btn-primary" on:click={plug_and_play}>
      click to showcase encrypt & decrypt the above key
    </button>
    <div>encrypted: { encrypted }</div>
    <div>decrypted: { decrypted }</div>
  </div>

{:else}
  <Login />
{/if}

<style lang="postcss" global>
  @tailwind base;
  @tailwind components;
  @tailwind utilities;
</style>
