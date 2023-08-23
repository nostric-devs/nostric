<script>
  import { logout_from_ii } from "../store/auth";
  import { Navigate } from "svelte-router-spa";
  import { Route } from "svelte-router-spa";

  export let currentRoute;
  export let params;

</script>

  <div class="navbar bg-primary text-primary-content">
    <div class="navbar-start">
      <div class="btn btn-ghost normal-case text-xl">
      <Navigate to="/">
        Nostric
      </Navigate>
      </div>
    </div>
    <div class="navbar-end">
      <button on:click={async () => await logout_from_ii()} class="btn">
        Logout
      </button>
    </div>
  </div>

<div class="lg:container lg:mx-auto">
  <Route {currentRoute} {params}/>
</div>
