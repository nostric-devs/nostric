import { get, writable } from "svelte/store";
import { AuthClient } from "@dfinity/auth-client";
import { CryptoService } from "../lib/crypto";
import { NostrHandler } from "../lib/nostr";
import { createActor } from "../../../declarations/backend";
import { navigateTo } from "svelte-router-spa";
import { alert } from "./alert";
import { ROUTES } from "../router/routes";
import { NostricHandler } from "../lib/nostric";


export enum AuthStates {
  ANONYMOUS,
  IDENTIFIED,
  AUTHENTICATED,
  NOT_YET_REGISTERED,
  REGISTERED,
  ERROR,
}

type AuthState =
  AuthStates.ANONYMOUS |
  AuthStates.IDENTIFIED |
  AuthStates.AUTHENTICATED |
  AuthStates.NOT_YET_REGISTERED |
  AuthStates.REGISTERED |
  AuthStates.ERROR;


function fetch_auth_state() {
  const { subscribe, set } = writable<AuthState>(AuthStates.ANONYMOUS);

  const set_anonymous = () => set(AuthStates.ANONYMOUS);
  const set_identified = () => set(AuthStates.IDENTIFIED);
  const set_authenticated = () => set(AuthStates.AUTHENTICATED);
  const set_not_registered = () => set(AuthStates.NOT_YET_REGISTERED);
  const set_registered = () => set(AuthStates.REGISTERED);
  const set_error = () => set(AuthStates.ERROR);

  return {
    subscribe,
    set_anonymous,
    set_identified,
    set_authenticated,
    set_not_registered,
    set_registered,
    set_error
  };
}

export const auth_state = fetch_auth_state();
export const is_anonymous = () => get(auth_state) === AuthStates.ANONYMOUS;
export const is_identified = () => get(auth_state)  === AuthStates.IDENTIFIED;
export const is_authenticated = () => get(auth_state) === AuthStates.AUTHENTICATED;
export const is_not_registered = () => get(auth_state) === AuthStates.NOT_YET_REGISTERED;
export const is_registered = () => get(auth_state) === AuthStates.REGISTERED;
export const is_error = () => get(auth_state) === AuthStates.ERROR;


export let actor = null;
export let auth_client = null;
export let crypto_service = null;
export let nostr_service = null;
export let nostric_service = null;

export async function init() {
  auth_client = await AuthClient.create();
  if (await auth_client.isAuthenticated()) {
    auth_state.set_identified();
    await init_structures();
  }
}

export async function init_nostr_structures(profile) {
  let private_key = await crypto_service.decrypt(profile.encrypted_sk);

  // todo subs with motoko actor call
  let nostr_relays = [
    "wss://relay.nostr.band",
    "wss://nostr.girino.org",
    "wss://nostr-pub.wellorder.net",
  ]

  await nostr_service.init(private_key, nostr_relays);

  // todo get from motoko actor
  let nostric_relays = [
    // { gateway_url: "ws://localhost:8089", canister_id: "b77ix-eeaaa-aaaaa-qaada-cai" } // foreign canister id
  ]

  await nostric_service.init(private_key, profile.pk, "http://localhost:8000", true, false);

  // todo if pro user, also initialize owned relay, else not;
  // todo fetch from motoko actor private relay details
  await nostric_service.init_private_relay(
    "ws://localhost:8089",
    process.env.RELAY_CANISTER_ID,
  );

  // todo if any relays, subcribe to nostric
  await nostric_service.init_pool(nostric_relays);

  auth_state.set_registered();
  await navigateTo(ROUTES.HOME);
}

export async function init_structures() {
  try {
    alert.clear();
    const host =
      process.env.DFX_NETWORK === "ic" ?
        `https://${process.env.BACKEND_CANISTER_ID}.ic0.app` :
        "http://localhost:8000";

    actor = createActor(
      process.env.BACKEND_CANISTER_ID,
      {
        agentOptions: {
          identity: auth_client.getIdentity(),
          host: host
        }
      }
    );

    crypto_service = new CryptoService(actor);
    await crypto_service.init();

    auth_state.set_authenticated();

    nostr_service = new NostrHandler();
    nostric_service = new NostricHandler();

    let response = await actor.getProfile();
    if (response["err"]) {
      auth_state.set_not_registered();
      await navigateTo(ROUTES.CREATE_PROFILE);
    } else {
      try {
        await init_nostr_structures(response["ok"]);
      } catch(error) {
        alert.error("Unable to initiate Nostr functionality");
        console.error(error)
        auth_state.set_error();
      }
    }

  } catch(error) {
    alert.error("Unable to initialize vetkeys");
    console.error(error);
    auth_state.set_error();
  }

}

export async function login_to_ii() {
  if (is_anonymous() || is_error()) {
    let identityProvider =
      process.env.DFX_NETWORK === "ic" ?
        "https://identity.ic0.app/#authorize" :
        `http://${process.env.INTERNET_IDENTITY_CANISTER_ID}.localhost:8000/#authorize`;

    await auth_client.login({
      identityProvider,
      onSuccess: async () => {
        auth_state.set_identified();
        await init_structures();
      },
      onError: () => {
        alert.error("Unable to login to Internet Identity");
        auth_state.set_error();
      }
    });

  }
}

export async function logout_from_ii() {
  crypto_service.logout();
  auth_client.logout();
  nostric_service.close_pool();
  auth_state.set_anonymous();
  navigateTo(ROUTES.LOGIN);
}
