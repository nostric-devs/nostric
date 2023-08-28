<script lang="ts">
  import { actor, nostric_user} from "../store/auth";
  import ProfileForm from "./ProfileForm.svelte";
  import type { Profile, Result } from "../../../declarations/backend/backend.did";
  import { alert } from "../store/alert";
  import { navigateTo } from "svelte-router-spa";
  import { ROUTES } from "../router/routes";


  let loading = false;
  let profile : Profile = JSON.parse(JSON.stringify(nostric_user.get_profile()));

  const update_profile = async () => {
    loading = true;
    let response : Result = await actor.updateProfile(profile);
    if ("ok" in response) {
      nostric_user.set_profile(response.ok);
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
