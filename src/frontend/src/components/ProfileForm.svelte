<script>
  export let private_key;
  export let pk;
  export let username;
  export let about;
  export let avatar_url;
  export let loading;
  export let submitFunction;

</script>


<div class="card w-full shadow-2xl bg-base-100 mt-8">
  <div class="card-body">
    <div class="form-control">
      <label class="label">
        <span class="label-text">Username</span>
      </label>
      <input required type="text" bind:value={username} placeholder="Username" class="input input-bordered" disabled={loading}/>
    </div>
    <div class="form-control">
      <label class="label">
        <span class="label-text">Bio</span>
      </label>
      <textarea bind:value={about} class="textarea textarea-bordered" placeholder="Bio" rows=5 maxlength="200" disabled={loading}></textarea>
    </div>
    <div class="form-control">
      <label class="label">
        <span class="label-text">Avatar URL</span>
      </label>
      <input type="text" bind:value={avatar_url} placeholder="Avatar URL" class="input input-bordered" disabled={loading}/>
    </div>
    <div class="form-control">
      <label class="label">
        <span class="label-text">Public key</span>
      </label>
      <input type="text" bind:value={pk} placeholder="Public key" class="input input-bordered" disabled />
    </div>
    <div class="form-control">
      <label class="label">
        <span class="label-text">Private key</span>
      </label>
      <input type="password" bind:value={private_key} placeholder="Private key" class="input input-bordered" disabled />
      <span class="text-left text-sm text-gray-500 mt-4">
        *You can copy your Public key and Private key. It will be encrypted and securely stored on the IC.
      </span>
    </div>
    <div class="form-control mt-6">
      <button class="btn btn-primary" on:click={async () => await submitFunction()} disabled={ !username }>
        {#if loading}
          <span
        class="inline-block h-4 w-4 rounded-full mr-2 border-2 animate-spin border-b-current border-r-current border-t-transparent border-l-transparent">
          </span>
        {/if}
        Save profile
      </button>
      <!-- <button class="btn btn-warning mt-4" on:click={async () => await delete_profile()}>
        {#if loading}
          <span
        class="inline-block h-4 w-4 rounded-full mr-2 border-2 animate-spin border-b-current border-r-current border-t-transparent border-l-transparent">
          </span>
        {/if}
        Delete profile
      </button> -->
    </div>
  </div>
</div>

