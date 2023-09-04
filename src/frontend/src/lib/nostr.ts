import {
  verifySignature,
  validateEvent,
  getSignature,
  getEventHash,
  getPublicKey,
  Kind,
  SimplePool,
} from "nostr-tools";
import type { Sub } from "nostr-tools/lib/relay";
import type { Event } from "nostr-tools/lib/event";
import { nostr_events } from "../store/nostr";
import { alert } from "../store/alert";

export class NostrHandler {

  private pool: SimplePool | null = null;
  private sub : Sub | null = null;
  private private_key : string;
  private public_key : string;

  private RELAYS = [
    "wss://relay.nostr.band",
    "wss://nostr.girino.org",
    "wss://nostr-pub.wellorder.net",
  ]

  public async init(private_key : string, following_list : string[] = []) {
    this.private_key = private_key;
    this.public_key = getPublicKey(private_key);

    this.pool = new SimplePool();
    this.sub = this.pool.sub(
      this.RELAYS,
      [{
        kinds: [Kind.Text],
        authors: [this.public_key, ...following_list]
      }]
    );
    this.sub.on("event", event => nostr_events.add(event));

  }

  public create_event(content : string, kind : Kind) {
    let event = {
      kind: kind,
      created_at: Math.floor(Date.now() / 1000),
      tags: [],
      pubkey: this.public_key,
      content,
    };
    event.id = getEventHash(event);
    event.sig = getSignature(event, this.private_key);

    if (!validateEvent(event) || !verifySignature(event)) {
      alert.error("Unable to validate Nostr event or verify its signature");
    }
    return event;
  }

  public async publish_event(event: Event) {
    await this.pool.publish(this.RELAYS, event);
  }

  public close_relay_pool() {
    if (this.pool !== null) {
      this.pool.close();
    }
  }

}
