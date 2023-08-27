<script>
  import { logout_from_ii } from "../store/auth";
  import { Navigate } from "svelte-router-spa";
  import { Route } from "svelte-router-spa";
  import { ROUTES } from "../router/routes";
  import { Icon } from "svelte-feathers";

  export let currentRoute;
  export let params;

</script>

<div class="w-100 flex justify-center hero-background">
  <div
    class="navbar flex justify-between bg-base-100/70 md:w-3/4 rounded-3xl mx-5 sm:mx-0 my-12 shadow-md"
  >
    <div class="navbar-start">
      <div class="text-2xl text-primary font-bold ml-4">
        <Navigate to={ ROUTES.POSTS }>
          Nostric
        </Navigate>
      </div>
    </div>
    <div class="flex-none">
      <button on:click={async () => await logout_from_ii()} class="btn btn-ghost btn-circle">
        <Icon name="log-out"></Icon>
      </button>
    </div>
  </div>
</div>

<div class="lg:container lg:mx-auto mb-24">
  <Route {currentRoute} {params}/>
</div>

