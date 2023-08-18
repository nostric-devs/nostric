import { get, writable } from "svelte/store";
import { AuthClient } from "@dfinity/auth-client";
import { CryptoService } from "../lib/crypto";
import type { JsonnableDelegationChain } from "@dfinity/identity/lib/cjs/identity/delegation";
import { navigateTo } from "svelte-router-spa";

import { createActor } from "../../../declarations/backend";


export enum AuthStates {
  ANONYMOUS,
  IDENTIFIED,
  AUTHENTICATED,
  ERROR,
}

export const auth_state = writable<Number>(AuthStates.ANONYMOUS);
export let actor = null;
export let auth_client = null;
export let crypto_service = null;

export async function init() {
  auth_client = await AuthClient.create();
  if (await auth_client.isAuthenticated()) {
    auth_state.update(() => AuthStates.IDENTIFIED);
    handle_session_timeout();
    await init_structures();
  }
}

export async function init_structures() {
  try {

    const host = process.env.DFX_NETWORK === "ic" ? `https://${process.env.BACKEND_CANISTER_ID}.ic0.app` : "http://localhost:8000";

    actor = createActor(
      process.env.BACKEND_CANISTER_ID,
      { agentOptions: { identity: auth_client.getIdentity(), host: host } }
    );
    crypto_service = new CryptoService(actor);
    await crypto_service.init();
    auth_state.update(() => AuthStates.AUTHENTICATED);
  } catch (error) {
    console.error(`Could not init structures: ${error}`);
    auth_state.update(() => AuthStates.ERROR);
  }
}

export async function login_to_ii() {
  let current_state = get(auth_state);
  if (current_state === AuthStates.ANONYMOUS || current_state === AuthStates.ERROR) {

    let identityProvider =
      process.env.DFX_NETWORK === "ic" ?
        "https://identity.ic0.app/#authorize" :
        `http://${process.env.INTERNET_IDENTITY_CANISTER_ID}.localhost:8000/#authorize`;

    await auth_client.login({
      identityProvider,
      onSuccess: async () => {
        auth_state.update(() => AuthStates.IDENTIFIED);
        await init_structures();
      },
      onError: (error) => {
        console.error(`Could not login to II: ${error}`);
        auth_state.update(() => AuthStates.ERROR);
      }
    });

  }
}

export async function logout_from_ii() {
  let auth_status = get(auth_state);
  if (auth_status === AuthStates.AUTHENTICATED) {
    crypto_service.logout();
    auth_client.logout();
    auth_state.update(() => AuthStates.ANONYMOUS);
    navigateTo("/");
  }
}

// set a timer when the II session will expire and log the user out
function handle_session_timeout() {
  // upon login the localstorage items may not be set, wait for next tick
  setTimeout(() => {
    try {
      const delegation = JSON.parse(
        window.localStorage.getItem("ic-delegation")
      ) as JsonnableDelegationChain;

      const expirationTimeMs = Number.parseInt(delegation.delegations[0].delegation.expiration, 16) / 1000000;
      setTimeout(async () => {
        await logout_from_ii();
      }, expirationTimeMs - Date.now());

    } catch (error) {
      console.error("Could not handle delegation expiry.");
    }
  });
}
