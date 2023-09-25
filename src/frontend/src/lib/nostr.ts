import NDK, { NDKSubscription } from "@nostr-dev-kit/ndk";
import { NDKEvent, NDKKind, NDKPrivateKeySigner, NDKUser } from "@nostr-dev-kit/ndk";
import type { NostrEvent } from "@nostr-dev-kit/ndk";
import { nostr_events, nostr_followees } from "../store/nostr";
import type { Profile } from "../../../declarations/backend/backend.did";
import { get } from "svelte/store";

export class NostrHandler {

  private nostr_kit: NDK | null = null;
  private nostr_user : NDKUser | null = null;
  private signer: NDKPrivateKeySigner | null = null;
  private subscription : NDKSubscription | null = null;

  public async init(private_key : string, relays : string[]) {
    // init private key signer based on the existing private key
    this.signer = new NDKPrivateKeySigner(private_key);
    this.nostr_user = await this.signer.user();
    this.nostr_kit = new NDK({
      explicitRelayUrls: relays,
      signer: this.signer,
    });
    await this.nostr_kit.connect();
    this.nostr_user.ndk = this.nostr_kit;
    // get followees for this user using nostr
    let followees = await this.get_followees();
    // subscribe to them in addition to the users posts
    await this.subscribe(followees.map((followee) => followee.hexpubkey()));
  }

  public async get_user() {
    await this.nostr_user.fetchProfile();
    return this.nostr_user;
  }

  public async get_private_key() {
    return this.signer.privateKey;
  }

  public async fetch_foreign_user_profile(hexpub : string) {
    let user = new NDKUser({hexpubkey: hexpub});
    user.ndk = this.nostr_kit;
    await user.fetchProfile();
    return user;
  }

  public async search_match(query : string) {
    let events = await this.nostr_kit.fetchEvents({
      search: query,
      limit: 10,
      kinds: [NDKKind.Metadata]
    });

    let users = {};
    for (const event of events) {
      let user = new NDKUser({hexpubkey: event.pubkey});
      user.ndk = this.nostr_kit;
      let hexpubkey = user.hexpubkey();

      // we already follow this user, or we already have them in this list
      if (nostr_followees.find_user(hexpubkey) || hexpubkey in users) {
        continue;
      }

      await user.fetchProfile();
      if ((user.profile.name || "").includes(query) || hexpubkey.includes(query)) {
        users[hexpubkey] = user;
      }
    }
    return Object.values(users);
  }

  public async subscribe(following_list : string[] = []) {
    nostr_events.clear();
    try {
      this.subscription.stop();
    } catch {
    }

    let filters = {
      kinds: [NDKKind.Text],
      authors: [this.nostr_user.hexpubkey(), ...following_list],
      limit: 10, // TODO get rid of this
    };
    let options = { closeOnEose: false };
    this.subscription = this.nostr_kit.subscribe(filters, options);

    this.subscription.on("event", event => {
      nostr_events.add(event);
    });
  }

  public async create_and_publish(content : string, kind : NDKKind = NDKKind.Text) {
    const nostr_event = new NDKEvent(this.nostr_kit);
    nostr_event.kind = kind;
    nostr_event.content = content;
    nostr_event.tags = [];
    await nostr_event.publish();
  }

  public async publish(event) {
    const nostr_event = new NDKEvent(this.nostr_kit, event);
    await nostr_event.publish();
  }

  public async update_user(profile : Profile) {
    if (!this.nostr_user.profile) {
      await this.nostr_user.fetchProfile();
    }
    this.nostr_user.profile.name = profile.username;
    this.nostr_user.profile.bio = profile.about;
    this.nostr_user.profile.image = profile.avatar_url;
    await this.nostr_user.publish();
  }

  public async add_followee(followee : NDKUser) {
    if (await this.nostr_user.follow(followee)) {
      nostr_followees.add_user(followee);
      // we need to renew subscription to receive new events
      await this.subscribe(get(nostr_followees).map((followee) => followee.hexpubkey()));
      return true
    } else {
      return false;
    }
  }

  // todo move to our forked NDK
  public async remove_followee(user : NDKUser) {
    nostr_followees.remove_user(user);
    try {
      let follow_list = get(nostr_followees);
      // mirrored from NDK
      const event = new NDKEvent(
        this.nostr_kit,
        { kind: NDKKind.Contacts } as NostrEvent
      );

      for (const follow of follow_list) {
        event.tag(follow);
      }

      await event.publish();
      // we need to renew subscription to cancel receiving the removed user posts
      await this.subscribe(get(nostr_followees).map((followee) => followee.hexpubkey()));
      return true;
    } catch {
      // revert changes in case of error
      nostr_followees.add_user(user);
      return false;
    }

  }

  public async get_followees() {
    let users = await this.nostr_user.follows();
    for (const user of users) {
      user.ndk = this.nostr_kit;
      await user.fetchProfile();
    }
    let list_users = [...users]; // from set to array
    nostr_followees.init(list_users);
    return list_users;
  }

}
