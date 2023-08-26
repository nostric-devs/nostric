<script lang="ts">
  import { actor, init_nostr_structures, nostric_user} from "../store/auth";
  import ProfileForm from "./ProfileForm.svelte";
  import type { Profile } from "../../../declarations/backend/backend.did";


  let loading = false;
  let profile : Profile = nostric_user.get_profile();

  const update_profile = async () => {
    loading = true;
    let response = await actor.updateProfile(profile);
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
  <a href="/" class="link link-primary mt-8">Back</a>
  <h1 class="text-4xl font-bold mt-12">Update your profile</h1>
  <ProfileForm   bind:profile={profile} loading={loading} submit_function={update_profile}/>
</div>