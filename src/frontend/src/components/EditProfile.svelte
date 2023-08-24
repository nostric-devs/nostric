<script>
  import { onMount } from "svelte";
  import { actor, crypto_service, init_nostr_structures} from "../store/auth";
  import ProfileForm from "./ProfileForm.svelte";

  let private_key;
  let pk;
  let username = "";
  let about = "";
  let avatar_url = "";
  let loading = false;

  const getProfile = async () => {
    loading = true;
    let response = await actor.getProfile();
    if ("ok" in response) {
      username = response.ok.username;
      about = response.ok.about;
      avatar_url = response.ok.avatar_url;
      pk = response.ok.pk;
      private_key = await crypto_service.decrypt(response.ok.encrypted_sk);
    } else {
      // todo notifications
      console.log(response["UnableToCreate"]);
    }
    loading = false;
  }

  // Todo reuse function 
  const update_profile = async () => {
    loading = true;
    let encrypted_sk = await crypto_service.encrypt(private_key);
    let response = await actor.updateProfile({ about, avatar_url, encrypted_sk, username, pk });
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

  onMount(getProfile)
</script>

<div class="max-w-xl mx-auto mt-8 text-center">
  <a href="/" class="link link-primary mt-8">Back</a>
  <h1 class="text-4xl font-bold mt-12">Update your profile</h1>
  <ProfileForm   bind:private_key={private_key} bind:pk={pk} bind:username={username} bind:about={about} bind:avatar_url={avatar_url} loading={loading} submitFunction={update_profile}/>
</div>