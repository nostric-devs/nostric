<script lang="ts">
  import { Home, Search } from "svelte-feathers";
</script>

<nav class="list-nav xl:px-4 py-4">
  <ul>
    <li>
      <a href="/">
        <Home color="black" size="24" class="lg:mx-auto xl:mx-0"></Home>
        <span class="lg:hidden xl:block ml-3">Home</span>
      </a>
    </li>
    <li>
      <a href="/explore">
        <Search color="black" size="24" class="lg:mx-auto xl:mx-0"></Search>
        <span class="lg:hidden xl:block ml-3">Explore</span>
      </a>
    </li>
  </ul>
</nav>
