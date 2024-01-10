<script lang="ts">
  import { ROUTES, get_path } from "$lib/utils/routes";
</script>

<!-- Here will be the homepage design -->
<h1 class="h1">Homepage</h1>
<a href={get_path(ROUTES.FEED)} class="btn variant-filled">Go to App</a>
<a href={get_path(ROUTES.SIGN_IN)} class="btn variant-filled">Sign up</a>
