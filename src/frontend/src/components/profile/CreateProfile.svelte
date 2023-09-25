<script lang="ts">
  import ProfileForm from "./ProfileForm.svelte";
  import { NDKPrivateKeySigner } from "@nostr-dev-kit/ndk";
  import { onMount } from "svelte";
  import { actor, crypto_service, init_nostr_structures, nostr_service } from "../../store/auth";
  import { alert } from "../../store/alert";
  import type { Profile } from "../../../../declarations/backend/backend.did";

  let loading = false;
  let profile : Profile = {
    username: "",
    about: "",
    avatar_url: "",
    pk: "",
    encrypted_sk: "",
  }

  const create_profile = async () => {
    loading = true;
    profile.encrypted_sk = await crypto_service.encrypt(profile.encrypted_sk);
    let response = await actor.addProfile(profile);
    if ("ok" in response) {
      await init_nostr_structures(response.ok);
      await nostr_service.update_user(profile);
    } else {
      alert.error(response["UnableToCreate"]);
    }
    loading = false;
  }

  export let currentRoute;
  export let params;

  onMount(async () => {
    let signer = NDKPrivateKeySigner.generate();
    let user = await signer.user();
    profile.encrypted_sk = signer.privateKey;
    profile.pk = user.hexpubkey();
    console.log(profile);
  });

</script>
<div class="max-w-xl mx-auto my-12 text-center">
  <h1 class="text-4xl font-bold mt-12">Create your profile</h1>
  <ProfileForm bind:profile={profile} loading={loading} submit_function={create_profile}/>
</div>
