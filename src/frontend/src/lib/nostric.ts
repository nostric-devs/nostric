import { finishEvent, SimplePool, Sub } from "../nostric-tools";
import type { ActorSubclass } from "@dfinity/agent";
import { Actor, HttpAgent } from "@dfinity/agent";
import type { _SERVICE } from "../../../relay/relay.did";
import { NDKKind } from "@nostr-dev-kit/ndk";
import { createActor, idlFactory } from "../../../declarations/relay";
import {
  nostric_events,
  nostric_relays_count,
  nostric_relays_eose_count,
  relay_statuses,
  STATUS
} from "../store/nostric";
import { nostric_service } from "../store/auth";
import { alert } from "../store/alert";

export class NostricHandler {

  private gateway_url : string;
  private ic_url : string;
  private private_relay_canister_id : string = process.env.RELAY_CANISTER_ID || "";
  private local : boolean;
  private persist_key : boolean;
  private private_relay_canister_actor : ActorSubclass<_SERVICE> | null = null;
  private private_relay_set : boolean = false;

  private relay_pool : SimplePool | null = null;
  private active_subs : Sub | null = null;
  private active_relays = [];

  private private_key : string;
  private public_key : string;

  public eose_number = 0;
  public expected_eose_number = 0;

  public init(
    private_key : string,
    public_key : string,
    ic_url : string,
    local : boolean,
    persist_key : boolean
  ) {
    this.private_key = private_key;
    this.public_key = public_key;
    this.ic_url = ic_url;
    this.local = local;
    this.persist_key = persist_key;
  }

  public get_private_key() {
    return this.private_key;
  }

  public get_gateway_url() {
    return this.gateway_url;
  }

  public get_private_relay_canister_id() {
    return this.private_relay_canister_id;
  }

  public async init_private_relay(
    gateway_url : string,
  ) {

    this.gateway_url = gateway_url;

    let options = {
      agentOptions: {host: this.ic_url}
    }
    this.private_relay_canister_actor = await createActor(
      this.private_relay_canister_id, options
    );
    this.private_relay_set = true;
  }

  public async init_foreign_relay(gateway_url : string, canister_id : string) {
    // init the agent for the foreign relay using the universal candid of relays
    // the private relay does not have to be activated
    const agent = new HttpAgent({ host: this.ic_url});
    if (process.env.DFX_NETWORK !== "ic") {
      await agent.fetchRootKey();
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
      persist_key: this.persist_key
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
        persist_key: this.persist_key
      }
    else {
      return null;
    }
  }

  public close_pool() {
    if (this.active_subs !== null) {
      this.active_subs.unsub();
    }
    if (this.relay_pool !== null) {
      this.relay_pool.close(this.active_relays);
    }
  }

  public async init_pool(relays) {
    // init foreign relays if any
    if (relays.length > 0) {
      for (let nostric_relay of relays) {
        if (
          nostric_relay.gateway_url !== this.gateway_url ||
          nostric_relay.canister_id !== this.private_relay_canister_id
        ) {
          let foreign_relay = await nostric_service.init_foreign_relay(
            nostric_relay.gateway_url, nostric_relay.canister_id
          );
          this.active_relays.push(foreign_relay);
        }
      }
    }
    if (this.private_relay_set) {
      this.active_relays.push(this.get_private_relay_params());
    }
    if (this.active_relays.length > 0) {
      nostric_relays_count.set(this.active_relays.length);
      this.relay_pool = new SimplePool();
      this.active_subs = this.relay_pool.sub(
        this.active_relays,
        []
      );
      this.active_subs.on("event", (event: any) => {
        nostric_events.add(event);
      });
      this.active_subs.on("eose", () => {
        nostric_relays_eose_count.update((previous) => previous + 1);
      });
      this.active_subs.on("error", (error) => {
        relay_statuses.set_status(error.gateway_url, error.canister_id, STATUS.ERROR);
        alert.error(`There was an error in connection to gateway ${error.gateway_url} with ID ${error.canister_id}. Refresh the app.`)
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
      return signed_event;
    }
  }

}
