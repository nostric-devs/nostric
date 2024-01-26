import {
  NDKEvent,
  NDKKind,
  NDKPrivateKeySigner,
  NDKUser,
} from "@nostr-dev-kit/ndk";

import type {
  NDKFilter,
  NDKTag,
  NDKUserProfile,
  NDKRelayList,
  NDKRelayUrl,
} from "@nostr-dev-kit/ndk";

import { nostrHandler, Reactions } from "$lib/nostr";
import type { NostrHandler } from "$lib/nostr";
import { followedUsers } from "$lib/stores/FollowedUsers";
import { get } from "svelte/store";
import { NDKMarker } from "$lib/nostr/NostrHandler";

export class NostrUserHandler {
  private nostrUser: NDKUser;
  private readonly signer: NDKPrivateKeySigner;
  private nostrHandler: NostrHandler;

  public static instance: NostrUserHandler;

  /**
   * @param privateKey - Private key of the user which is to be instantiated
   */
  private constructor(privateKey?: string) {
    let signer: NDKPrivateKeySigner;
    if (!privateKey) {
      // no private key given, generate new
      signer = NDKPrivateKeySigner.generate();
    } else {
      // init private key signer based on the existing private key
      signer = new NDKPrivateKeySigner(privateKey);
    }
    this.signer = signer;
    this.nostrHandler = nostrHandler;
    this.nostrHandler.setSigner(this.signer);
  }

  /**
   * Singleton pattern. Returns instance if it exists, creates new one if it does not.
   *
   * @param privateKey - Private key of the user which is to be instantiated
   * @returns Singleton instance
   */
  public static getInstance(privateKey?: string): NostrUserHandler {
    if (!NostrUserHandler.instance) {
      NostrUserHandler.instance = new NostrUserHandler(privateKey);
    }
    return NostrUserHandler.instance;
  }

  /**
   * Sets up with an existing user, fetches their profile, their relays, their user follow list,
   * and starts subscriptions for this list.
   */
  public async initExistingUser(): Promise<void> {
    this.nostrUser = await this.signer.user();
    this.nostrUser.ndk = nostrHandler.nostrKit;

    const userPreferredRelays: NDKRelayList | undefined =
      await this.nostrUser.relayList();

    if (userPreferredRelays) {
      for (const relay of userPreferredRelays.relays) {
        nostrHandler.addRelay(relay);
      }
    }

    await this.nostrUser.fetchProfile();
    followedUsers.init(await this.fetchFollowedUsersWithProfiles());

    const filters: NDKFilter = {
      kinds: [
        NDKKind.Text,
        NDKKind.Reaction,
        NDKKind.Repost,
        NDKKind.EncryptedDirectMessage,
      ],
      authors: [
        this.nostrUser.pubkey,
        ...get(followedUsers).map((user: NDKUser) => user.pubkey),
      ],
      limit: 5,
    };
    // subscribe to the users in addition to the current user's posts
    await this.nostrHandler.addSubscription(filters);
  }

  /**
   * Connects NDK, gets the user from signer, fills up their profile,
   * publishes the new user to Nostr and starts subscribing to themselves.
   *
   * @param profile - The profile to fill the user data.
   */
  public async initNewUser(profile: NDKUserProfile): Promise<void> {
    this.nostrUser = await this.signer.user();
    this.nostrUser.ndk = nostrHandler.nostrKit;

    this.nostrUser.profile = profile;
    await this.nostrUser.publish();

    const filters: NDKFilter = {
      kinds: [
        NDKKind.Text,
        NDKKind.Reaction,
        NDKKind.Repost,
        NDKKind.EncryptedDirectMessage,
      ],
      authors: [this.nostrUser.pubkey],
    };
    await this.nostrHandler.addSubscription(filters);
  }

  /**
   * @returns the wrapped NDK instance of the current user
   */
  public getUser(): NDKUser | undefined {
    return this.nostrUser;
  }

  /**
   * Add new relay to user's relay metadata list.
   * NIP-65: https://github.com/nostr-protocol/nips/blob/master/65.md
   *
   * @param url - The url of the relay to add.
   */
  public async addUserPreferredRelay(url: NDKRelayUrl): Promise<void> {
    const userPreferredRelays: NDKRelayList | undefined =
      await this.nostrUser.relayList();

    let relayTags: NDKTag[] = [];

    if (userPreferredRelays) {
      relayTags = userPreferredRelays.getMatchingTags("r");
    }
    if (!relayTags.find((tag: NDKTag) => tag[1] === url)) {
      relayTags.push(["r", url]);
      await this.createAndPublishEvent("", NDKKind.RelayList, relayTags);
    }
  }

  /**
   * Removes a relay from user's relay metadata list.
   * NIP-65: https://github.com/nostr-protocol/nips/blob/master/65.md
   *
   * @param url - The url of the relay to remove.
   */
  public async removeUserPreferredRelay(url: NDKRelayUrl): Promise<void> {
    const userPreferredRelays: NDKRelayList | undefined =
      await this.nostrUser.relayList();
    let relayTags: NDKTag[] = [];
    if (userPreferredRelays) {
      relayTags = userPreferredRelays.getMatchingTags("r");
      relayTags = relayTags.filter((tag: NDKTag) => tag[1] !== url);
      await this.createAndPublishEvent("", NDKKind.RelayList, relayTags);
    }
  }

  /**
   * Updates the current active user profile info.
   *
   * @param profile - The profile to use for updating.
   */
  public async updateProfile(profile: NDKUserProfile): Promise<void> {
    this.nostrUser.profile = profile;
    await this.nostrUser.publish();
  }

  /**
   * @returns Private key of the current active Nostr user.
   */
  public getPrivateKey(): string | undefined {
    return this.signer?.privateKey;
  }

  /**
   * @returns Public key of the current active Nostr user.
   */
  public getPublicKey(): string | undefined {
    return this.nostrUser.pubkey;
  }

  /**
   * Creates and publishes an event
   *
   * @param content - The content of the event.
   * @param kind - The kind of the message, Text by default.
   * @param tags - The list of NDKTags to include in the message.
   */
  public async createAndPublishEvent(
    content: string,
    kind: NDKKind = NDKKind.Text,
    tags?: NDKTag[],
  ): Promise<void> {
    const nostrEvent: NDKEvent = new NDKEvent(this.nostrHandler.nostrKit);
    nostrEvent.kind = kind;
    nostrEvent.content = content;
    nostrEvent.tags = tags || [];
    await nostrEvent.publish();
  }

  /**
   * Creates and publishes an encrypted private event.
   *
   * @param content - The content to be encrypted.
   * @param kind - The kind of the message, Text by default.
   * @param tags - The list of NDKTags to include in the event.
   * @param recipient - The recipient of the private event.
   */
  public async createAndPublishEncryptedEvent(
    content: string,
    kind: NDKKind = NDKKind.Text,
    recipient: NDKUser,
    tags?: NDKTag[],
  ): Promise<void> {
    const nostrEvent: NDKEvent = new NDKEvent(this.nostrHandler.nostrKit);
    nostrEvent.kind = kind;
    nostrEvent.content = content;
    nostrEvent.tags = [...(tags || []), ["p", recipient.pubkey]];
    await nostrEvent.encrypt(recipient);
    await nostrEvent.publish();
  }

  /**
   * Creates and publishes a reply to an event thread.
   * NIP-10: https://github.com/nostr-protocol/nips/blob/master/10.md
   *
   * @param eventToReplyTo - The parent event to reply to. Not necessarily a root.
   * @param content - The content to be encrypted.
   * @param kind - The kind of the message, Text by default.
   * @param tags - The list of NDKTags to include in the event.
   */
  public async replyToEvent(
    eventToReplyTo: NDKEvent,
    content: string,
    kind: NDKKind,
    tags: NDKTag[],
  ): Promise<void> {
    const finalTags: NDKTag[] = [...tags];
    const rootEventTag: NDKTag | undefined = eventToReplyTo.tags.find(
      (tag: NDKTag): boolean => tag.at(4) === NDKMarker.ROOT,
    );
    const publicKeyTagIndex: number | undefined = eventToReplyTo.tags.findIndex(
      (tag: NDKTag): boolean => tag.at(0) === "#p",
    );

    if (publicKeyTagIndex && publicKeyTagIndex > -1) {
      finalTags[publicKeyTagIndex].push(eventToReplyTo.author.pubkey);
    } else {
      finalTags.push(["#p", eventToReplyTo.author.pubkey]);
    }

    if (rootEventTag) {
      finalTags.push(rootEventTag);
      finalTags.push([
        "#e",
        eventToReplyTo.id,
        eventToReplyTo.relay.url,
        NDKMarker.REPLY,
      ]);
    } else {
      finalTags.push([
        "#e",
        eventToReplyTo.id,
        eventToReplyTo.relay.url,
        NDKMarker.ROOT,
      ]);
    }
    await this.createAndPublishEvent(content, kind, finalTags);
  }

  /**
   * Reposts an event, based on
   * https://github.com/nostr-dev-kit/ndk/blob/master/ndk/src/events/repost.ts
   * NIP-18: https://github.com/nostr-protocol/nips/blob/master/18.md
   *
   * @param eventToRepost - The NDKEvent event to repost.
   */
  public async repostEvent(eventToRepost: NDKEvent): Promise<void> {
    await eventToRepost.repost();
  }

  /**
   * A base method for reacting to an event, based on NIP-25
   * https://github.com/nostr-protocol/nips/blob/master/25.md
   *
   * @param eventToReactTo - The NDKEvent event to react to
   * @param reaction - The reaction type
   */
  public async reactToEvent(
    eventToReactTo: NDKEvent,
    reaction: Reactions,
  ): Promise<void> {
    await eventToReactTo.react(reaction);
  }

  /**
   * Creates a dislike reaction event for an event.
   *
   * @param eventToReactTo - The NDKEvent event to react to.
   */
  public async dislikeEvent(eventToReactTo: NDKEvent): Promise<void> {
    await this.reactToEvent(eventToReactTo, Reactions.DISLIKE);
  }

  /**
   * Creates a like reaction event for an event.
   *
   * @param eventToReactTo - The NDKEvent event to react to.
   */
  public async likeEvent(eventToReactTo: NDKEvent): Promise<void> {
    await this.reactToEvent(eventToReactTo, Reactions.LIKE);
  }

  public async isEventLiked(event: NDKEvent): Promise<boolean> {
    const filters: NDKFilter = {
      kinds: [NDKKind.Reaction],
      "#e": [event.id],
      authors: [this.nostrUser.pubkey],
    };
    let reactions: NDKEvent[] =
      await this.nostrHandler.fetchEventsByFilter(filters);
    if (reactions !== undefined && reactions.length > 0) {
      reactions = reactions.sort(
        (x: NDKEvent, y: NDKEvent) => y.created_at - x.created_at,
      );
      if (reactions[0].content === Reactions.LIKE) {
        return true;
      }
    }
    return false;
  }

  /**
   * Fetch followed users along with their profiles.
   *
   * @returns Followed users as values denoted by their public keys as keys in JSON.
   */
  public async fetchFollowedUsersWithProfiles(): Promise<NDKUser[]> {
    const users: NDKUser[] = [...(await this.nostrUser.follows())];
    const fetchedUsersProfiles: NDKUser[] = [];
    for (const user of users) {
      user.ndk = this.nostrHandler.nostrKit;
      await user.fetchProfile();
      fetchedUsersProfiles.push(user);
    }
    return fetchedUsersProfiles;
  }

  /**
   * Updates the Nostr contact list, adds the user to our followed users store.
   *
   * @param user - The NDKUser user to be added to the follow list
   */
  public async addUserToFollowedUsers(user: NDKUser): Promise<void> {
    if (await this.nostrUser.follow(user)) {
      followedUsers.add(user);
    } else {
      throw Error(
        "Something went wrong, unable to add the user to the follow list.",
      );
    }
  }

  /**
   * Updates the Nostr contact list, removing the given user (also from the store).
   *
   * @param user - The NDKUser user to be removed from the follow list and store.
   */
  public async removeUserFromFollowedUsers(removeUser: NDKUser): Promise<void> {
    const users: NDKUser[] = get(followedUsers).filter(
      (user: NDKUser): boolean => user.pubkey !== removeUser.pubkey,
    );

    try {
      const event: NDKEvent = new NDKEvent(this.nostrHandler.nostrKit, {
        kind: NDKKind.Contacts,
      });
      for (const user of users) {
        event.tag(user);
      }
      await event.publish();
      followedUsers.remove(removeUser);
    } catch (error) {
      throw Error(`Unable to unfollow user ${removeUser.name}`);
    }
  }
}
