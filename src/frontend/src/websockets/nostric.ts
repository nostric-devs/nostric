import { SimplePool, Sub, finishEvent } from "../nostric-tools";
import type { ActorSubclass } from "@dfinity/agent";
import type { _SERVICE } from "../../../relay/relay.did";
import { NDKKind } from "@nostr-dev-kit/ndk";
import { Actor, HttpAgent } from "@dfinity/agent";
import { createActor, idlFactory } from "../../../declarations/relay/index.js";
import { nostric_events } from "../store/nostric";
import { nostric_service } from "../store/auth";

export class NostricHandler {

  private gateway_url : string;
  private ic_url : string;
  private private_relay_canister_id : string = process.env.RELAY_CANISTER_ID || "";
  private local : boolean;
  private persist_keys : boolean;
  private private_relay_canister_actor : ActorSubclass<_SERVICE> | null = null;

  private relay_pool : SimplePool | null = null;
  private active_subs : Sub | null = null;

  private private_key : string;
  private public_key : string;


  constructor(
    private_key : string,
    public_key : string,
    gateway_url : string,
    ic_url : string,
    local : boolean,
    persist_keys : boolean
  ) {
    this.private_key = private_key;
    this.public_key = public_key;
    this.gateway_url = gateway_url;
    this.ic_url = ic_url;
    this.local = local;
    this.persist_keys = persist_keys;
  }

  public get_private_key() {
    return this.private_key;
  }

  public get_public_key() {
    return this.public_key;
  }

  public get_gateway_url() {
    return this.gateway_url;
  }

  public get_private_relay_canister_id() {
    return this.private_relay_canister_id;
  }

  public async init_private_relay() {
    let options = {
      agentOptions: {host: this.ic_url}
    }
    this.private_relay_canister_actor = await createActor(
      this.private_relay_canister_id, options
    );
  }

  public async init_foreign_relay(gateway_url : string, canister_id : string) {
    // init the agent for the foreign relay using the universal candid of relays
    // the private relay does not have to be activated
    const agent = new HttpAgent();
    if (process.env.DFX_NETWORK !== "ic") {
      agent.fetchRootKey().catch(err => {
        console.warn("Unable to fetch root key. Check to ensure that your local replica is running");
        console.error(err);
      });
    }
    const actor = await Actor.createActor(idlFactory, {
      agent,
      canisterId: canister_id,
    });

    return {
      gateway_url,
      ic_url: this.ic_url,
      canister_id,
      canister_actor: actor,
      local: this.local,
      persist_keys: this.persist_keys
    }
  }

  private get_private_relay_params() {
    if (this.private_relay_canister_actor)
      return {
        gateway_url: this.gateway_url,
        ic_url: this.ic_url,
        canister_id: this.private_relay_canister_id,
        canister_actor: this.private_relay_canister_actor,
        local: this.local,
        persist_keys: this.persist_keys
      }
    else {
      return null;
    }
  }

  public async init_pool(relays, authors) {
    // init foreign relays if any
    let initialized_relays = [];
    if (relays.length > 0) {
      let initialized_relays = [];
      for (let nostric_relay in relays) {
        initialized_relays.push(nostric_service.init_foreign_relay(
          nostric_relay.gateway_url, nostric_relay.canister_id
        ));
      }
    }
    // todo do we wanna subscribe to ourselves?
    if (this.private_relay_canister_actor) {
      initialized_relays.push(this.get_private_relay_params());
    }
    if (initialized_relays.length > 0) {
      this.relay_pool = new SimplePool();
      this.active_subs = this.relay_pool.sub(relays, [{ authors }]);
      this.active_subs.on("event", (event: any) => {
        nostric_events.add(event);
      });
    }
  }

  public async publish_to_private_relay(content : string) {
    if (this.private_relay_canister_actor) {
      let event = {
        kind: NDKKind.Text,
        created_at: Math.floor(Date.now() / 1000),
        tags: [],
        content,
        pubkey: this.public_key,
      };
      const signed_event = finishEvent(event, this.private_key);
      await this.private_relay_canister_actor.add_new_event(signed_event);
    }
  }

}
