<script lang="ts">
  import UserProfile from "$lib/components/user/profile/UserProfile.svelte";
  import { authUser } from "$lib/stores/Auth";
  import { feed, type NodeEvent } from "$lib/stores/Feed";
  import type { NDKEvent, NDKUser } from "@nostr-dev-kit/ndk";

  let events: NodeEvent[] = [];
  let user: NDKUser;

  $: {
    let parsedEvents: NodeEvent[] = [];
    for (const event of Object.values($feed) as NodeEvent[]) {
      if (
        event.isRoot() &&
        event.model.author.pubkey === $authUser.nostr?.getPublicKey()
      ) {
        parsedEvents.push(event.model);
      }
      parsedEvents = parsedEvents.sort(
        (x: NDKEvent, y: NDKEvent) => y.created_at - x.created_at,
      );
    }
    events = parsedEvents;
  }
  $: if ($authUser.nostr) {
    user = $authUser.nostr?.getUser();
  }
</script>

<UserProfile {user} {events} />
