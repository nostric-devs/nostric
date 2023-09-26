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
export let auth_user = null;

export async function init() {
  auth_client = await AuthClient.create();
  if (await auth_client.isAuthenticated()) {
    auth_state.set_identified();
    await init_structures();
  }
}

export async function init_nostr_structures(auth_user) {

  let private_key = await crypto_service.decrypt(auth_user.nostr_profile.encrypted_sk);

  await nostr_service.init(private_key, auth_user.followed_relays.nostr);

  let ic_network = "http://localhost:8000";
  let local = true;
  let persist_keys = true;

  if (process.env.DFX_NETWORK === "ic") {
    ic_network = "https://icp0.io";
    local = false;
  }

  await nostric_service.init(private_key, auth_user.nostr_profile.pk, ic_network, local, persist_keys);

  if (auth_user.is_pro) {
    await nostric_service.init_private_relay(
      auth_user.private_relay.gateway_url,
      auth_user.private_relay.canister_id,
    );
  }

  // auth_user.followed_relays.nostric = [
  //   {gateway_url: "ws://localhost:8089", canister_id: "b77ix-eeaaa-aaaaa-qaada-cai"}
  // ]

  await nostric_service.init_pool(auth_user.followed_relays.nostric);

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
        auth_user = response["ok"];
        await init_nostr_structures(auth_user);
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
  await actor.deleteProfile();
  navigateTo(ROUTES.LOGIN);
}
