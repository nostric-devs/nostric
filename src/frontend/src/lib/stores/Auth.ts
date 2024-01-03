import { writable, get } from "svelte/store";
import type {
  Writable,
  Subscriber,
  Invalidator,
  Unsubscriber,
} from "svelte/store";
import type { NostrUserHandler } from "$lib/nostr";
import { nostrHandler } from "$lib/nostr";
import { localKeyStorage } from "$lib/stores/LocalStorage";

export enum AuthStates {
  ANONYMOUS,
  NOSTR_AUTHENTICATED,
  NOSTRIC_AUTHENTICATED,
  PRO_AUTHENTICATED,
}

export type AuthState =
  | AuthStates.ANONYMOUS
  | AuthStates.NOSTR_AUTHENTICATED
  | AuthStates.NOSTRIC_AUTHENTICATED
  | AuthStates.PRO_AUTHENTICATED;

export type AuthUser = {
  isNostrAuthenticated: () => boolean;
  isAnonymous: () => boolean;
  setNostrAuthenticated: () => void;
  subscribe: (
    this: void,
    run: Subscriber<AuthState>,
    invalidate?: Invalidator<AuthState>,
  ) => Unsubscriber;
  setNostricAuthenticated: () => void;
  setProAuthenticated: () => void;
  isNostricAuthenticated: () => boolean;
  setNostrUserHandler: (nostrUser: NostrUserHandler) => void;
  isProAuthenticated: () => boolean;
  setAnonymous: () => void;
  getNostrUserHandler: () => NostrUserHandler | undefined;
  setAuthStatus: (status: AuthState) => void;
  logOut: () => void;
};

export function getAuthUser(): AuthUser {
  const authState: Writable<AuthState> = writable<AuthState>(
    AuthStates.ANONYMOUS,
  );
  const { subscribe, set } = authState;

  let nostrUserHandler: NostrUserHandler | undefined;

  const setAnonymous = (): void => set(AuthStates.ANONYMOUS);
  const isAnonymous = (): boolean => get(authState) === AuthStates.ANONYMOUS;
  const setNostrAuthenticated = (): void => set(AuthStates.NOSTR_AUTHENTICATED);
  const isNostrAuthenticated = (): boolean =>
    get(authState) === AuthStates.NOSTR_AUTHENTICATED;
  const isNostricAuthenticated = (): boolean =>
    get(authState) === AuthStates.NOSTRIC_AUTHENTICATED;
  const setNostricAuthenticated = (): void =>
    set(AuthStates.NOSTRIC_AUTHENTICATED);
  const isProAuthenticated = (): boolean =>
    get(authState) === AuthStates.PRO_AUTHENTICATED;
  const setProAuthenticated = (): void => set(AuthStates.PRO_AUTHENTICATED);

  const setAuthStatus = (status: AuthState): void => set(status);

  const setNostrUserHandler = (nostrUser: NostrUserHandler): void => {
    nostrUserHandler = nostrUser;
  };

  const getNostrUserHandler = (): NostrUserHandler | undefined => {
    return nostrUserHandler;
  };

  const logOut = (): void => {
    nostrHandler.resetSigner();
    nostrUserHandler = undefined;
    localKeyStorage.update((): null => null);
    setAnonymous();
  };

  return {
    subscribe,
    setAnonymous,
    isAnonymous,
    setNostrAuthenticated,
    isNostrAuthenticated,
    isNostricAuthenticated,
    setNostricAuthenticated,
    isProAuthenticated,
    setProAuthenticated,
    setNostrUserHandler,
    getNostrUserHandler,
    setAuthStatus,
    logOut,
  };
}

export const authUser: AuthUser = getAuthUser();
