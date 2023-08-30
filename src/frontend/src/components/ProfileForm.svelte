<script>
  import Spinner from "./Spinner.svelte";

  export let loading;
  export let submit_function;
  export let profile;
</script>


<div class="card w-full shadow-2xl bg-base-100 mt-8">
  <div class="card-body">
    <div class="form-control">
      <label class="label">
        <span class="label-text">Username</span>
      </label>
      <input required type="text" bind:value={profile.username} placeholder="Username" class="input input-bordered" disabled={loading}/>
    </div>
    <div class="form-control">
      <label class="label">
        <span class="label-text">Bio</span>
      </label>
      <textarea bind:value={profile.about} class="textarea textarea-bordered" placeholder="Bio" rows=5 maxlength="200" disabled={loading}></textarea>
    </div>
    <div class="form-control">
      <label class="label">
        <span class="label-text">Avatar URL</span>
      </label>
      <input type="text" bind:value={profile.avatar_url} placeholder="Avatar URL" class="input input-bordered" disabled={loading}/>
    </div>
    <div class="form-control">
      <label class="label">
        <span class="label-text">Public key</span>
      </label>
      <input type="text" value={profile.pk} placeholder="Public key" class="input input-bordered" disabled />
    </div>
    <div class="form-control">
      <label class="label">
        <span class="label-text">Private key</span>
      </label>
      <input type="password" value={profile.encrypted_sk} placeholder="Private key" class="input input-bordered" disabled />
      <span class="text-left text-sm text-gray-500 mt-4">
        *You can copy your Public key and Private key. It will be encrypted and securely stored on the IC.
      </span>
    </div>
    <div class="form-control mt-6">
      <button
        class="btn btn-primary"
        on:click={async () => await submit_function()}
        disabled={ !profile.username || loading }
      >
        {#if loading}
          <Spinner/>
        {/if}
        <span class="text-white">Save profile</span>
      </button>
    </div>
  </div>
</div>

