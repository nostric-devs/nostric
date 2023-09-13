import NDK from "@nostr-dev-kit/ndk";
import { NDKEvent, NDKKind, NDKPrivateKeySigner, NDKUser } from "@nostr-dev-kit/ndk";
import { nostr_events } from "../store/nostr";
import type { Profile } from "../../../declarations/backend/backend.did";
import { alert } from "../store/alert";

export class NostrHandler {

  private nostr_kit: NDK | null = null;
  private nostr_user : NDKUser | null = null;
  private signer: NDKPrivateKeySigner | null = null;

  private RELAYS = [
    "wss://relay.nostr.band",
    "wss://nostr.girino.org",
    "wss://nostr-pub.wellorder.net",
  ]

  public async init(private_key : string, following_list : string[] = []) {
    this.signer = new NDKPrivateKeySigner(private_key);
    this.nostr_user = await this.signer.user();
    this.nostr_kit = new NDK({
      explicitRelayUrls: this.RELAYS,
      signer: this.signer,
    });
    await this.nostr_kit.connect();
    this.nostr_user.ndk = this.nostr_kit;
    await this.subscribe(following_list);
  }

  public async get_user() {
    await this.nostr_user.fetchProfile();
    return this.nostr_user;
  }

  public async get_private_key() {
    return this.signer.privateKey;
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
      await user.fetchProfile();
      let hexpubkey = user.hexpubkey();
      if ((user.profile.name || "").includes(query) || hexpubkey.includes(query)) {
        users[hexpubkey] = {
          name: user.profile.name,
          display_name: user.profile.displayName,
          image: user.profile.image,
          user: user,
        };
      }
      if (Object.keys(users).length === 6){
        break;
      }
    }
    return users;
  }

  public async subscribe(following_list : string[] = []) {
    nostr_events.clear();

    let filters = {
      kinds: [NDKKind.Text],
      authors: [this.nostr_user.hexpubkey(), ...following_list],
    };
    let options = { closeOnEose: false };
    let subscriptions = this.nostr_kit.subscribe(filters, options);

    subscriptions.on("event", event => {
      nostr_events.add(event);
    });
  }

  public async publish_event(content : string, kind : NDKKind = NDKKind.Text) {
    const nostr_event = new NDKEvent(this.nostr_kit);
    nostr_event.kind = kind;
    nostr_event.content = content;
    await nostr_event.publish();
  }

  public async change_user(profile : Profile) {
    if (!("name" in this.nostr_user.profile)) {
      await this.nostr_user.fetchProfile();
    }
    this.nostr_user.profile.name = profile.username;
    this.nostr_user.profile.bio = profile.about;
    this.nostr_user.profile.image = profile.avatar_url;
    await this.nostr_user.publish();
  }

  public async add_followee(followee : NDKUser) {
    if (!(await this.nostr_user.follow(followee))) {
      alert.error(`Unable to follow user ${followee.profile.name}`);
    }
  }

  public async get_followees() {
    let users = await this.nostr_user.follows();
    for (const user of users) {
      user.ndk = this.nostr_kit;
      await user.fetchProfile();
    }
    return users;
  }

}
