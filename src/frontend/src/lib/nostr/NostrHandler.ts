import type {
  NDKCacheAdapter,
  NDKConstructorParams,
  NDKFilter,
  NDKRelayUrl,
  NDKSubscriptionOptions,
} from "@nostr-dev-kit/ndk";
import NDK, {
  NDKEvent,
  NDKKind,
  NDKPrivateKeySigner,
  NDKRelay,
  NDKSubscription,
  NDKSubscriptionCacheUsage,
  NDKUser,
} from "@nostr-dev-kit/ndk";

import { feed } from "$lib/stores/Feed";
import type { UsersObject } from "$lib/nostr";
import { relays } from "$lib/stores/Relays";

import NDKCacheAdapterDexie from "@nostr-dev-kit/ndk-cache-dexie";

export enum NDKMarker {
  ROOT = "root",
  REPLY = "reply",
  MENTION = "mention",
}

export class NostrHandler {
  public nostrKit: NDK;
  private subscriptions: NDKSubscription[] = [];

  public explicitRelays: string[] = [
    "wss://relay.nostr.band",
    "wss://nostr.girino.org",
    "wss://nostr-pub.wellorder.net",
  ];

  private subscriptionOptions: NDKSubscriptionOptions = {
    closeOnEose: true,
    cacheUsage: NDKSubscriptionCacheUsage.PARALLEL,
    groupable: true,
  };

  constructor() {
    const dexieAdapter: NDKCacheAdapter = new NDKCacheAdapterDexie({
      dbName: "nostric",
    });
    const options: NDKConstructorParams = {
      explicitRelayUrls: this.explicitRelays,
      cacheAdapter: dexieAdapter,
    };
    this.nostrKit = new NDK(options);
  }

  public async startConnection(): Promise<void> {
    await this.nostrKit.connect();
    relays.fill(this.listRelays());
  }

  public setSigner(signer: NDKPrivateKeySigner): void {
    this.nostrKit.signer = signer;
  }

  public resetSigner(): void {
    this.nostrKit.signer = NDKPrivateKeySigner.generate();
  }

  /**
   * @param url - Url of the relay which is ti be added to the pool and store.
   */
  public addRelay(url: NDKRelayUrl): void {
    // with this we do not need to check whether it already exists,
    // otherwise we would have used addRelay method
    this.nostrKit?.pool.getRelay(url);
    relays.fill(this.listRelays());
  }

  /**
   * @param url - Url of the relay which is ti be removed from the pool and store.
   */
  public removeRelay(url: NDKRelayUrl): void {
    this.nostrKit?.pool.removeRelay(url);
    relays.fill(this.listRelays());
  }

  /**
   * Attempts to refresh a connection to a relay. First disconnects and
   * updates the relay status in store. Then, to debounce, waits 1000ms
   * and tries to connect once again. After this try, regardless of the result,
   * we update the relay status in store to match its real current state
   * and resolve the promise.
   *
   * @param relay - Relay whose connection is to be refreshed.
   */
  public async reconnectRelay(relay: NDKRelay): Promise<void> {
    // this magic is here because the NDK relay connectivity class
    // does not every emit change of status, and we must check it manually.
    relay.disconnect();
    relays.updateRelayStatus(relay.url, relay.connectivity.status);
    return new Promise((resolve) =>
      setTimeout(async (): Promise<void> => {
        try {
          await relay.connect();
        } finally {
          relays.updateRelayStatus(relay.url, relay.connectivity.status);
          resolve();
        }
      }, 1000),
    );
  }

  /**
   * @returns Return list of relays in the current pool.
   */
  public listRelays(): NDKRelay[] {
    if (this.nostrKit && this.nostrKit.pool && this.nostrKit.pool.relays) {
      return [...this.nostrKit.pool.relays.values()];
    }
    return [];
  }

  /**
   * Adds new subscription to the list of subscriptions
   *
   * @param filter - Filter for the subscription
   */
  public async addSubscription(filter: NDKFilter): Promise<void> {
    const options: NDKSubscriptionOptions = {
      closeOnEose: false,
      cacheUsage: NDKSubscriptionCacheUsage.PARALLEL,
      groupable: true,
    };
    const subscription: NDKSubscription = this.nostrKit.subscribe(
      filter,
      options,
    );

    subscription.on("event", (event: NDKEvent): void => {
      // if the message is encrypted, decrypt it right away
      // if (event.kind === NDKKind.EncryptedDirectMessage) {
      //   event.decrypt();
      // }
      if (event.kind === NDKKind.Text) {
        feed.addRecursively(event);
      }
    });

    this.subscriptions.push(subscription);
  }

  /**
   * Clears all active subscriptions and stored events
   */
  public async clearSubscriptions(): Promise<void> {
    for (const subscription of this.subscriptions) {
      try {
        subscription.stop();
      } catch (error) {
        console.error(error);
      }
    }
    feed.clear();
  }

  /**
   * @param filter - Filter by which to fetch the events.
   * @returns Events fetched through the filter.
   */
  public async fetchEventsByFilter(filter: NDKFilter): Promise<NDKEvent[]> {
    const events: Set<NDKEvent> = await this.nostrKit.fetchEvents(
      filter,
      this.subscriptionOptions,
    );
    return [...events];
  }

  /**
   * @returns An array of NDKEvents kind 1 fetched by random.
   */
  public async fetchRandomEvents(): Promise<NDKEvent[]> {
    const filters: NDKFilter = {
      kinds: [NDKKind.Text],
      limit: 10,
    };
    const events: NDKEvent[] = await this.fetchEventsByFilter(filters);
    return [...events];
  }

  /**
   * @param eventId - ID of the event to be fetched.
   * @returns Fetched NDKEvent.
   */
  public async fetchEventById(eventId: string): Promise<NDKEvent | null> {
    return this.nostrKit.fetchEvent(eventId);
  }

  /**
   * Fetches direct replies to an event. This is done through filtering for events which
   * have the ID of the given event in their #e tags marked as root.
   * NIP-10: https://github.com/nostr-protocol/nips/blob/master/10.md
   *
   * @param event - The event which we want to find the replies to.
   * @param marker - Marker for the reply
   * @param limit - Limit for the number of replies
   * @returns An array of NDKEvents who reply to the event.
   */
  public async fetchEventReplies(
    event: NDKEvent,
    marker: NDKMarker,
    limit?: number,
  ): Promise<NDKEvent[]> {
    const filters: NDKFilter = {
      kinds: [NDKKind.Text],
      "#e": [event.id, event.relay.url, marker],
    };
    if (limit) {
      filters["limit"] = limit;
    }
    const eventsWithRelay: NDKEvent[] = await this.fetchEventsByFilter(filters);
    filters["#e"] = [event.id, "", marker];
    const eventsWithoutRelay: NDKEvent[] = await this.fetchEventsByFilter(filters);
    const finalEvents: NDKEvent[] = eventsWithRelay;
    for (const event of eventsWithoutRelay) {
      if (finalEvents.find((e: NDKEvent): boolean => e.id === event.id) === undefined) {
        finalEvents.push(event);
      }
    }
    return finalEvents;
  }

  /**
   * @param publicKey - The public key of the user whose events are to be fetched.
   * @returns An array of NDKEvents produced by the user given by the public key.
   */
  public async fetchEventsByAuthorPublicKey(
    publicKey: string,
  ): Promise<NDKEvent[]> {
    const filters: NDKFilter = {
      kinds: [NDKKind.Text],
      authors: [publicKey],
      limit: 10,
    };
    return await this.fetchEventsByFilter(filters);
  }

  /**
   * @returns A json containing newly generate private and public key pair.
   */
  public async generateKeyPair(): Promise<{
    privateKey: string;
    publicKey: string;
  }> {
    const signer: NDKPrivateKeySigner = NDKPrivateKeySigner.generate();
    const user: NDKUser = await signer.user();
    return {
      privateKey: signer.privateKey,
      publicKey: user.pubkey,
    };
  }

  /**
   * @returns A generated public key.
   */
  public async generatePublicKeyFromPrivateKey(
    privateKey: string,
  ): Promise<string> {
    const signer: NDKPrivateKeySigner = new NDKPrivateKeySigner(privateKey);
    const user: NDKUser = await signer.user();
    return user.pubkey;
  }

  /**
   * @param publicKey - The public key of the user to be fetched.
   * @returns An instance of NDKUser matching the public key, with their profile.
   */
  public async fetchUserProfileByPublicKey(
    publicKey: string,
  ): Promise<NDKUser> {
    const user: NDKUser = new NDKUser({ pubkey: publicKey });
    user.ndk = this.nostrKit;
    await user.fetchProfile();
    return user;
  }

  /**
   * Fetch users (and their profiles) that the user given by public key is following.
   * NIP-02: https://github.com/nostr-protocol/nips/blob/master/02.md
   *
   * @param publicKey - Public key of the user.
   * @param omitProfiles - Flag whether to also fetch the user profiles or not.
   * @returns An array of NDKUsers who the user given by the public key follows.
   */
  public async fetchUserFollowingByPublicKey(
    publicKey: string,
    omitProfiles?: boolean,
  ): Promise<NDKUser[]> {
    const user: NDKUser = new NDKUser({ pubkey: publicKey });
    user.ndk = this.nostrKit;

    const followedUsers: NDKUser[] = [
      ...(await user.follows(this.subscriptionOptions)),
    ];

    if (omitProfiles == undefined || !omitProfiles) {
      for (const followedUser of followedUsers) {
        followedUser.ndk = this.nostrKit;
        await followedUser.fetchProfile();
      }
    }

    return followedUsers;
  }

  /**
   * Fetch followers (and their profiles) of a user by the user's public key. This is done through
   * filtering for kind 3 messages with one of the #p tags containing the given user public key.
   * NIP-02: https://github.com/nostr-protocol/nips/blob/master/02.md
   *
   * @param publicKey - Public key of the user
   * @param omitProfiles - Flag whether to also fetch the user profiles or not.
   * @returns An array of NDKUsers who follow the user given by the public key.
   */
  public async fetchUserFollowersByPublicKey(
    publicKey: string,
    omitProfiles?: boolean,
  ): Promise<NDKUser[]> {
    const filter: NDKFilter = {
      kinds: [NDKKind.Contacts],
      "#p": [publicKey],
    };

    const events: NDKEvent[] = [...(await this.fetchEventsByFilter(filter))];

    const authors: NDKUser[] = [];
    if (omitProfiles !== undefined && omitProfiles) {
      for (const event of events) {
        authors.push(event.author);
      }
    } else {
      for (const event of events) {
        authors.push(
          await this.fetchUserProfileByPublicKey(event.author.pubkey),
        );
      }
    }
    return authors;
  }

  /**
   * Fetch profiles of users by their public keys.
   *
   * @param publicKeys - Array of public keys of the users
   * @returns An array of NDKUser profiles for the given public keys.
   */
  public async fetchProfilesByPublicKey(
    publicKeys: string[],
  ): Promise<NDKUser[]> {
    const users: NDKUser[] = [];

    for (const publicKey of publicKeys) {
      const user: NDKUser = await this.fetchUserProfileByPublicKey(publicKey);
      users.push(user);
    }

    return users;
  }

  /**
   * @param query - A string containing a query to search for.
   * @returns UsersObject of users matching the query.
   */
  public async searchByQuery(query: string): Promise<UsersObject> {
    const filter: NDKFilter = {
      search: query,
      limit: 15,
      kinds: [NDKKind.Metadata],
    };
    const events: NDKEvent[] = await this.fetchEventsByFilter(filter);
    const users: UsersObject = {};

    for (const event of events) {
      const user: NDKUser = new NDKUser({ pubkey: event.pubkey });
      user.ndk = this.nostrKit;
      const pubkey: string = user.pubkey;

      // we already have this user in this list
      if (pubkey in users) {
        continue;
      }

      await user.fetchProfile();

      if (
        (user.profile?.name || "").includes(query) ||
        pubkey.includes(query) ||
        user.npub.includes(query)
      ) {
        users[pubkey] = user;
      }
    }

    return users;
  }
}

export const nostrHandler: NostrHandler = new NostrHandler();
await nostrHandler.startConnection();
