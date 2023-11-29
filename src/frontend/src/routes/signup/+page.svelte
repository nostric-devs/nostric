<script>
  import { get_path, ROUTES } from "$lib/utils/routes";
</script>

<!-- Here will be redirected user if tries to log in but does not have account yet -->
<h1 class="h1">Sign up</h1>
<a href={get_path(ROUTES.FEED)} class="btn variant-filled">Sign up</a>
