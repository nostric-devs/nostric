<script lang="ts">
  import { page } from "$app/stores";
  import { ROUTES, getPath } from "$lib/utils/routes";
  import { User, Server, Star } from "svelte-feathers";
  import { AuthStates, authUser } from "$lib/stores/Auth";

  $: isActive = (pageName: string) => {
    return $page.url.pathname === pageName;
  };
  $: isIdentityAuthenticated =
    $authUser.authState >= AuthStates.IDENTITY_AUTHENTICATED;
</script>

<h1 class="h1 m-4">Settings</h1>
<nav class="m-4 p-2 list-nav card">
  <ul>
    <li>
      <a
        class="!p-2"
        href={getPath(ROUTES.SETTINGS, ROUTES.PROFILE)}
        class:bg-primary-active-token={isActive(
          getPath(ROUTES.SETTINGS, ROUTES.PROFILE),
        )}
      >
        <span class="badge"><User /></span>
        <span class="flex-auto font-medium">Profile settings</span>
      </a>
    </li>
    <li>
      <a
        class="!p-2"
        href={getPath(ROUTES.SETTINGS, ROUTES.RELAYS)}
        class:bg-primary-active-token={isActive(
          getPath(ROUTES.SETTINGS, ROUTES.RELAYS),
        )}
      >
        <span class="badge"><Server /></span>
        <span class="flex-auto font-medium">Relay servers</span>
      </a>
    </li>
    <li>
      <a
        class="!p-2 {!isIdentityAuthenticated
          ? 'pointer-events-none opacity-50 cursor-not-allowed'
          : ''}"
        href={getPath(ROUTES.SETTINGS, ROUTES.PRO)}
        class:bg-primary-active-token={isActive(
          getPath(ROUTES.SETTINGS, ROUTES.PRO),
        )}
      >
        <span class="badge"><Star /></span>
        <span class="flex-auto font-medium">Nostric Pro</span>
      </a>
    </li>
  </ul>
</nav>

<slot />
