<script lang="ts">
  import { onMount } from "svelte";
  import { actor, crypto_service } from "../store/auth";
  import CreateProfile from "./CreateProfile.svelte";

  let profile = null;

  const getProfile = async () => {
    let res = await actor.getProfile();
    if ("ok" in res ) {
      // go to the profile view if there is profile associated to this identity
      console.log(res)
      profile = res.ok;
      let decrypted = "";
      decrypted = await crypto_service.decrypt(profile.encrypted_sk);
      console.log(decrypted)
    } else {
      // go to the createProfile view to create a new nostr account
    }
  }

  

  onMount(getProfile)
</script>

<div class="hero min-h-screen bg-base-200">
  <div class="hero-content text-center">
    <div class="max-w-md">
      {#if profile}
      <h1 class="text-5xl font-bold mb-8">You have created your profile</h1>
      {profile.username}
      <!-- TODO display profile details -->
      <!-- TODO fetch previous posts from nostr relays -->
      <!-- TODO add Post functionality -->
      {:else}
        <CreateProfile />
      {/if}      
    </div>
  </div>
</div>