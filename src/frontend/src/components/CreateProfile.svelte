<script>
  import { generatePrivateKey, getPublicKey } from "nostr-tools";
  import { actor, crypto_service, init_nostr_structures } from "../store/auth";

  let private_key = generatePrivateKey();
  let pk = getPublicKey(private_key);
  let username = "";
  let about = "";
  let avatar_url = "";

  const create_profile = async () => {
    let encrypted_sk = await crypto_service.encrypt(private_key);
    let response = await actor.addProfile({ about, avatar_url, encrypted_sk, username, pk });
    if ("ok" in response) {
      await init_nostr_structures(response.ok);
    } else {
      // todo notifications
      console.log(response["UnableToCreate"]);
    }

  }

  export let currentRoute;
  export let params;

</script>


<div class="hero min-h-screen bg-base-200">
  <div class="hero-content text-center py-12">
    <div class="max-w-md">
      <h1 class="text-4xl font-bold mb-8">Create a new Nostr profile</h1>
      <div class="card w-full max-w-md shadow-2xl bg-base-100">
        <div class="card-body">
          <div class="form-control">
            <label class="label">
              <span class="label-text">Username</span>
            </label>
            <input required type="text" bind:value={username} placeholder="Username" class="input input-bordered" />
          </div>
          <div class="form-control">
            <label class="label">
              <span class="label-text">Bio</span>
            </label>
            <textarea bind:value={about} class="textarea textarea-bordered" placeholder="Bio"></textarea>
          </div>
          <div class="form-control">
            <label class="label">
              <span class="label-text">Avatar URL</span>
            </label>
            <input type="text" bind:value={avatar_url} placeholder="Avatar URL" class="input input-bordered" />
          </div>
          <div class="form-control">
            <label class="label">
              <span class="label-text">Public key</span>
            </label>
            <input type="text" bind:value={pk} placeholder="Public key" class="input input-bordered" />
          </div>
          <div class="form-control">
            <label class="label">
              <span class="label-text">Private key</span>
            </label>
            <input type="password" bind:value={private_key} placeholder="Private key" class="input input-bordered" />
            <span class="text-left text-sm text-gray-500 mt-4">
              *You can copy your Public key and Private key. It will be encrypted and securely stored on the IC.
            </span>
          </div>
          <div class="form-control mt-6">
            <button class="btn btn-primary" on:click={async () => await create_profile()}>
              Create
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

