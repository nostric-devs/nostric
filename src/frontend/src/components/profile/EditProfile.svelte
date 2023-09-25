<script lang="ts">
  import { actor, nostr_service } from "../../store/auth";
  import ProfileForm from "./ProfileForm.svelte";
  import type { Profile, Result } from "../../../../declarations/backend/backend.did";
  import { alert } from "../../store/alert";
  import { navigateTo } from "svelte-router-spa";
  import { ROUTES } from "../../router/routes";
  import { NDKUser } from "@nostr-dev-kit/ndk";
  import { onMount } from "svelte";

  let loading = false;
  let user : NDKUser;
  let profile : Profile = {
    username: "",
    about: "",
    avatar_url: "",
    pk: "",
    encrypted_sk: ""
  };

  const get_profile = async () => {
    user = await nostr_service.get_user();
    profile = {
      username: user.profile.name,
      about: user.profile.bio || "",
      avatar_url: user.profile.image || "",
      pk: user.hexpubkey(),
      encrypted_sk: await nostr_service.get_private_key(),
    }
  }


  const update_profile = async () => {
    loading = true;
    let response : Result = await actor.updateProfile(profile);
    if ("ok" in response) {
      await nostr_service.update_user(profile);
      await navigateTo(ROUTES.PROFILE);
      alert.success("Profile successfully updated");
    } else {
      alert.error(response["UnableToCreate"]);
    }
    loading = false;
  }

  onMount(get_profile);
</script>

<div class="max-w-xl mx-auto text-center">
  <ProfileForm bind:profile={ profile } loading={ loading } submit_function={ update_profile }/>
</div>
