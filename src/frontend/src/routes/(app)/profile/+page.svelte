<script lang="ts">
  import UserProfile from "$lib/components/user-profile/UserProfile.svelte";
  import { authUser } from "$lib/stores/Auth";
  import type { NDKUser } from "@nostr-dev-kit/ndk";
  import { events } from "$lib/stores/Events";

  let user : NDKUser | undefined;
  $: if ($authUser.nostr) {
    user = $authUser.nostr.getUser();
  }

</script>

<UserProfile {user} events={$events}/>

