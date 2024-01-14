<script lang="ts">
  import { LogOut } from "svelte-feathers";
  import { getToastStore } from "@skeletonlabs/skeleton";
  import { authUser } from "$lib/stores/Auth";
  import { goto } from "$app/navigation";
  import { getPath, ROUTES } from "$lib/utils/routes";
  import { enhance } from "$app/forms";

  const toastStore = getToastStore();

  const onLogOut = async () => {
    authUser.logOut();
    await goto(getPath(ROUTES.HOMEPAGE));
    toastStore.trigger({
      message: "You are now logged out",
      background: "variant-filled-success",
    });
  };
</script>

<form method="POST" use:enhance={onLogOut}>
  <button
    type="submit"
    formaction="/sign-in?/logout"
    class="btn variant-filled-warning my-8 mx-4 font-medium"
  >
    <span>
      <LogOut color="black" size="20" class="mx-auto"></LogOut>
    </span>
    <span class="hidden xl:inline">Log out</span>
  </button>
</form>
