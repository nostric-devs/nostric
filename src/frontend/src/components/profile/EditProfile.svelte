<script lang="ts">
  import { actor, nostr_service } from "../store/auth";
  import ProfileForm from "./ProfileForm.svelte";
  import type { Profile, Result } from "../../../declarations/backend/backend.did";
  import { alert } from "../store/alert";
  import { navigateTo } from "svelte-router-spa";
  import { ROUTES } from "../router/routes";
  import { NDKUser } from "@nostr-dev-kit/ndk";

  let loading = false;
  let user : NDKUser = nostr_service.get_user();

  let profile : Profile = {
    username: user.profile.name,
    about: user.profile.bio,
    avatar_url: user.profile.image,
    pk: user.hexpubkey(),
    encrypted_sk: nostr_service.get_private_key(),
  }

  const update_profile = async () => {
    loading = true;
    let response : Result = await actor.updateProfile(profile);
    if ("ok" in response) {
      await nostr_service.change_user(profile);
      await navigateTo(ROUTES.POSTS);
      alert.success("Profile successfully updated");
    } else {
      alert.error(response["UnableToCreate"]);
    }
    loading = false;
  }

  export let currentRoute;
  export let params;
</script>

<div class="max-w-xl mx-auto mt-8 text-center">
  <a href="/" class="link link-primary btn btn-ghost normal-case mt-8">Back</a>
  <h1 class="text-4xl font-bold mt-12">Update your profile</h1>
  <ProfileForm bind:profile={ profile } loading={ loading } submit_function={ update_profile }/>
</div>
