<script lang="ts">
  import { Avatar } from "@skeletonlabs/skeleton";
  import type { NDKUserProfile } from "@nostr-dev-kit/ndk";

  let initials: string = "";

  $: if (profile?.name) {
    initials = profile?.name[0];
  } else if (profile?.displayName) {
    initials = profile?.displayName[0];
  }

  export let profile: NDKUserProfile;
</script>

<Avatar
  src={profile?.image}
  class="mr-4 mt-1"
  {initials}
  width="w-full"
  background="bg-primary-500"
/>
