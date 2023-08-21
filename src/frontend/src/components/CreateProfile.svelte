<script lang="ts">
  import { generatePrivateKey, getPublicKey,} from 'nostr-tools'
  import { actor, crypto_service } from '../store/auth';

  let sk = generatePrivateKey() // `sk` is a hex string
  let pk = getPublicKey(sk) // `pk` is a hex string
  let username = "";
  let bio = "";
  let avatar_url = "";

  const createProfile = async () => {
    // Encrypt the private key before storing in backend
    let encrypted = "";
    encrypted = await crypto_service.encrypt(pk);

    let res = await actor.addProfile({
      "about": bio,
      "avatar_url": avatar_url,
      "encrypted_sk": encrypted,
      "pk": pk,
      "username": username
    })
    // TODO if profile is created return to the profile detail
    console.log(res)
  }
  

</script>

<div class="hero min-h-screen bg-base-200">
  <div class="hero-content text-center">
    <div class="max-w-md">
      <h1 class="text-5xl font-bold mb-8">Create a new Nostr profile</h1>
      <div class="card w-full max-w-md shadow-2xl bg-base-100">
        <div class="card-body">
          <div class="form-control">
            <!-- svelte-ignore a11y-label-has-associated-control -->
            <label class="label">
              <span class="label-text">Username</span>
            </label>
            <input type="text" bind:value={username} placeholder="Username" class="input input-bordered" />
          </div>
          <div class="form-control">
            <!-- svelte-ignore a11y-label-has-associated-control -->
            <label class="label">
              <span class="label-text">Bio</span>
            </label>
            <textarea bind:value={bio} class="textarea textarea-bordered" placeholder="Bio"></textarea>
          </div>
          <div class="form-control">
            <!-- svelte-ignore a11y-label-has-associated-control -->
            <label class="label">
              <span class="label-text">Avatar URL</span>
            </label>
            <input type="text" bind:value={avatar_url} placeholder="Avatar URL" class="input input-bordered" />
          </div>          
          <div class="form-control">
            <!-- svelte-ignore a11y-label-has-associated-control -->
            <label class="label">
              <span class="label-text">Public key</span>
            </label>
            <input type="text" value={pk} placeholder="Public key" class="input input-bordered" />
          </div>
          <div class="form-control">
            <!-- svelte-ignore a11y-label-has-associated-control -->
            <label class="label">
              <span class="label-text">Private key</span>
            </label>
            <input type="text" value={sk} placeholder="Private key" class="input input-bordered" />
            <span class="text-left text-sm text-gray-500 mt-4">*You can copy your Public key and Private key. It will be ecrypted and securely stored on the IC.</span>
          </div>
          <div class="form-control mt-6">
            <button class="btn btn-primary" on:click={createProfile}>Create</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>