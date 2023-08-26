<script lang="ts">
  import { generatePrivateKey, getPublicKey } from "nostr-tools";
  import { actor, crypto_service, init_nostr_structures } from "../store/auth";
  import type { Profile } from "../../../declarations/backend/backend.did";
  import ProfileForm from "./ProfileForm.svelte";

  let private_key = generatePrivateKey();
  let pk = getPublicKey(private_key);
  let loading = false;

  let profile : Profile = {
    username: "",
    about: "",
    avatar_url: "",
    pk: pk,
    encrypted_sk: private_key // will be encrypted later
  }


  const create_profile = async () => {
    loading = true;
    profile.encrypted_sk = await crypto_service.encrypt(private_key);
    let response = await actor.addProfile(profile);
    if ("ok" in response) {
      await init_nostr_structures(response.ok);
    } else {
      // todo notifications
      console.log(response["UnableToCreate"]);
    }
    loading = false;
  }

  export let currentRoute;
  export let params;

</script>
<div class="max-w-xl mx-auto mt-8 text-center">
  <h1 class="text-4xl font-bold mt-12">Create your profile</h1>
  <ProfileForm   bind:profile={profile} loading={loading} submit_function={create_profile}/>
</div>