<script>
  import { generatePrivateKey, getPublicKey } from "nostr-tools";
  import { actor, crypto_service, init_nostr_structures } from "../store/auth";
  import ProfileForm from "./ProfileForm.svelte";

  let private_key = generatePrivateKey();
  let pk = getPublicKey(private_key);
  let username = "";
  let about = "";
  let avatar_url = "";
  let loading = false;

  const create_profile = async () => {
    loading = true;
    let encrypted_sk = await crypto_service.encrypt(private_key);
    let response = await actor.addProfile({ about, avatar_url, encrypted_sk, username, pk });
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
  <ProfileForm  bind:private_key={private_key} bind:pk={pk} bind:username={username} bind:about={about} bind:avatar_url={avatar_url} loading={loading} submitFunction={create_profile}/>
</div>