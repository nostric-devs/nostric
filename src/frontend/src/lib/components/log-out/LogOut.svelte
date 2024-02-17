<script lang="ts">
  import { LogOut } from "svelte-feathers";
  import { getToastStore } from "@skeletonlabs/skeleton";
  import { authUser } from "$lib/stores/Auth";
  import { enhance } from "$app/forms";
  import { goto } from "$app/navigation";

  const toastStore = getToastStore();

  const onLogOut = () => {
    return async () => {
      await authUser.logOut();
      await goto("/#signup");
      toastStore.trigger({
        message: "You are now logged out",
        background: "variant-filled-secondary",
      });
    };
  };
</script>

<form method="POST" use:enhance={onLogOut} class="w-full xl:px-4">
  <button
    type="submit"
    formaction="/logout"
    class="btn variant-filled-warning my-8 font-medium w-full"
  >
    <span>
      <LogOut color="black" size="20" class="mx-auto"></LogOut>
    </span>
    <span class="hidden xl:inline">Log out</span>
  </button>
</form>
