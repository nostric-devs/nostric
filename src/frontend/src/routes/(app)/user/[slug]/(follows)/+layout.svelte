<script lang="ts">
  import { ChevronLeft } from "svelte-feathers";
  import { page } from "$app/stores";
  import { ROUTES, getPath } from "$lib/utils/routes";
</script>

<a
  href={getPath(ROUTES.USER, $page.params.slug)}
  class="inline-flex items-center gap-2 mx-2 p-2 anchor rounded-md transition hover:bg-primary-hover-token"
>
  <ChevronLeft /> <span>Back to profile</span>
</a>
<slot />
