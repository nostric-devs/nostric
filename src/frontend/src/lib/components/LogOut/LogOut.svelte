<script>
  import { LogOut } from "svelte-feathers";
  import { getToastStore } from '@skeletonlabs/skeleton';

  const toastStore = getToastStore();

  const t = {
	  message: 'You are now logged out!',
    background: 'variant-filled-success',
  };
  

  function logOut() {
    // TODO: add log out logic and redirect to homepage
    toastStore.trigger(t);
  };
  
</script>

<button type="button" on:click={logOut} class="btn variant-filled-warning my-8 mx-4 font-medium">
  <span>
    <LogOut color="black" size="20" class="mx-auto"></LogOut>
  </span>
  <span class="hidden xl:inline">Log out </span>
</button>
