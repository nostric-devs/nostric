<script lang="ts">
  import { page } from "$app/stores";
  import { ROUTES, getPath } from "$lib/utils/routes";
  import {
    Home,
    Search,
    User,
    Settings,
    Bookmark,
    Bell,
    Image,
  } from "svelte-feathers";
  import { authUser, AuthStates } from "$lib/stores/Auth";

  $: isActive = (pageName: string) => {
    return $page.url.pathname === pageName;
  };
  $: includes = (pageName: string) => {
    return $page.url.pathname.includes(pageName);
  };
  $: isPro = $authUser.authState === AuthStates.PRO_AUTHENTICATED;
</script>

<nav class="list-nav xl:px-4 py-4">
  <ul>
    <li>
      <a
        href={getPath(ROUTES.FEED)}
        class:bg-primary-active-token={isActive(getPath(ROUTES.FEED))}
        class="capitalize"
      >
        <Home size="20" class="lg:mx-auto xl:mx-0"></Home>
        <span class="lg:hidden xl:block ml-3">{ROUTES.FEED}</span>
      </a>
    </li>
    <li>
      <a
        href={getPath(ROUTES.EXPLORE)}
        class:bg-primary-active-token={isActive(getPath(ROUTES.EXPLORE))}
        class="capitalize"
      >
        <Search size="20" class="lg:mx-auto xl:mx-0"></Search>
        <span class="lg:hidden xl:block ml-3">{ROUTES.EXPLORE}</span>
      </a>
    </li>
    <li>
      <a
        href={getPath(ROUTES.PROFILE)}
        class:bg-primary-active-token={isActive(getPath(ROUTES.PROFILE))}
        class="capitalize"
      >
        <User size="20" class="lg:mx-auto xl:mx-0"></User>
        <span class="lg:hidden xl:block ml-3">{ROUTES.PROFILE}</span>
      </a>
    </li>
    <li>
      <a
        href={getPath(ROUTES.NOTIFICATIONS)}
        class:bg-primary-active-token={isActive(getPath(ROUTES.NOTIFICATIONS))}
        class="capitalize pointer-events-none opacity-50 cursor-not-allowed"
      >
        <!--        <div class="relative inline-block">-->
        <!--          <span-->
        <!--            class="badge-icon variant-filled-tertiary absolute -top-3 -right-3 z-10"-->
        <!--            >2</span-->
        <!--          >-->
        <!--          <Bell size="20" class="lg:mx-auto xl:mx-0"></Bell>-->
        <!--        </div>-->
        <Bell size="20" class="lg:mx-auto xl:mx-0"></Bell>
        <span class="lg:hidden xl:block ml-3">{ROUTES.NOTIFICATIONS}</span>
        <span class="badge variant-filled">SOON</span>
      </a>
    </li>
    <li>
      <a
        href={getPath(ROUTES.BOOKMARKS)}
        class:bg-primary-active-token={isActive(getPath(ROUTES.BOOKMARKS))}
        class="capitalize pointer-events-none opacity-50 cursor-not-allowed"
      >
        <Bookmark size="20" class="lg:mx-auto xl:mx-0"></Bookmark>
        <span class="lg:hidden xl:block ml-3">{ROUTES.BOOKMARKS}</span>
        <span class="badge variant-filled">SOON</span>
      </a>
    </li>
    <li>
      <a
        href={getPath(ROUTES.IMAGES)}
        class:bg-primary-active-token={isActive(getPath(ROUTES.IMAGES))}
        class="capitalize {isPro
          ? ''
          : 'pointer-events-none opacity-50 cursor-not-allowed'}"
      >
        <Image size="20" class="lg:mx-auto xl:mx-0"></Image>
        <span class="lg:hidden xl:block ml-3">{ROUTES.IMAGES}</span>
        <span class="badge variant-filled">PRO</span>
      </a>
    </li>
    <li>
      <a
        href={getPath(ROUTES.SETTINGS)}
        class:bg-primary-active-token={includes(getPath(ROUTES.SETTINGS))}
        class="capitalize"
      >
        <Settings size="20" class="lg:mx-auto xl:mx-0"></Settings>
        <span class="lg:hidden xl:block ml-3">{ROUTES.SETTINGS}</span>
      </a>
    </li>
  </ul>
</nav>

<style>
  a {
    font-weight: 500;
  }
</style>
