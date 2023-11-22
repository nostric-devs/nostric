<script lang="ts">
    import { page } from "$app/stores";
  import { Home, Search, User, Settings, Bookmark, Bell } from "svelte-feathers";

  $: isActive = (pageName : String) => {
    return $page.url.pathname === pageName;
  };
</script>

<nav class="list-nav xl:px-4 py-4">
  <ul>
    <li>
      <a href="/feed" class:bg-primary-active-token={isActive('/feed')}>
        <Home  size="24" class="lg:mx-auto xl:mx-0"></Home>
        <span class="lg:hidden xl:block ml-3">Feed</span>
      </a>
    </li>
    <li>
      <a href="/explore" class:bg-primary-active-token={isActive('/explore')}>
        <Search size="24" class="lg:mx-auto xl:mx-0"></Search>
        <span class="lg:hidden xl:block ml-3">Explore</span>
      </a>
    </li>
    <li>
      <a href="/notifications" class:bg-primary-active-token={isActive('/notifications')}>
        <Bell size="24" class="lg:mx-auto xl:mx-0"></Bell>
        <span class="lg:hidden xl:block ml-3">Notifications</span>
      </a>
    </li>     
    <li>
      <a href="/profile" class:bg-primary-active-token={isActive('/profile')}>
        <User size="24" class="lg:mx-auto xl:mx-0"></User>
        <span class="lg:hidden xl:block ml-3">Profile</span>
      </a>
    </li>  
    <li>
      <a href="/bookmarks" class:bg-primary-active-token={isActive('/bookmarks')}>
        <Bookmark size="24" class="lg:mx-auto xl:mx-0"></Bookmark>
        <span class="lg:hidden xl:block ml-3">Bookmarks</span>
      </a>
    </li>       
    <li>
      <a href="/settings" class:bg-primary-active-token={isActive('/settings')}>
        <Settings size="24" class="lg:mx-auto xl:mx-0"></Settings>
        <span class="lg:hidden xl:block ml-3">Settings</span>
      </a>
    </li>     
  </ul>
  {#if $page.url.pathname.includes("settings") }
  <ul class="pl-8 pt-2">
    <a href="/settings/profile" class:bg-primary-active-token={isActive('/settings/profile')}>
      <span class="lg:hidden xl:block ml-3">Profile</span>
    </a>
    <a href="/settings/relays" class:bg-primary-active-token={isActive('/settings/relays')}>
      <span class="lg:hidden xl:block ml-3">Relays</span>
    </a>
    <a href="/settings/pro" class:bg-primary-active-token={isActive('/settings/pro')}>
      <span class="lg:hidden xl:block ml-3">Pro</span>
    </a>
  </ul>
  {/if}
</nav>
