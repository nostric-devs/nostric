import {
  verifySignature,
  validateEvent,
  getSignature,
  getEventHash,
  getPublicKey,
  relayInit,
  Kind,
} from "nostr-tools";
import type { Relay, Sub } from "nostr-tools/lib/relay";
import type { Event } from "nostr-tools/lib/event";
import { nostr_events } from "../store/nostr";
import { alert } from "../store/alert";

export class NostrHandler {

  relay : Relay | null = null;
  sub : Sub | null = null;
  private_key : string;
  public_key : string;

  public async init(private_key : string) {
    this.private_key = private_key;
    this.public_key = getPublicKey(private_key);

    this.relay = relayInit("wss://relay.nostr.band");

    this.relay.on("error", () => {
      alert.error(`Unable to connect to Nostr relay ${this.relay.url}`);
    })

    await this.relay.connect();

    this.sub = this.relay.sub([{
      kinds: [Kind.Text],
      authors: [this.public_key]
    }]);

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
    await this.relay.publish(event);
  }

}
