<script lang="ts">
  import { LogOut } from "svelte-feathers";
  import { getToastStore } from "@skeletonlabs/skeleton";
  import { authUser } from "$lib/stores/Auth";
  import { goto } from "$app/navigation";
  import { getPath, ROUTES } from "$lib/utils/routes";
  import { enhance } from "$app/forms";

  const toastStore = getToastStore();
  let loading: boolean = false;

  const onLogOut = async () => {
    loading = true;
    authUser.logOut();
    await goto(getPath(ROUTES.HOMEPAGE));
    toastStore.trigger({
      message: "You are now logged out",
      background: "variant-filled-success",
    });
    loading = false;
  };
</script>

<form method="POST" use:enhance={onLogOut} class="w-full xl:px-4">
  <button
    type="submit"
    formaction="/sign-in?/logout"
    class="btn variant-filled-warning my-8 font-medium w-full"
  >
    <span>
      <LogOut color="black" size="20" class="mx-auto"></LogOut>
    </span>
    <span class="hidden xl:inline">Log out</span>
  </button>
</form>
