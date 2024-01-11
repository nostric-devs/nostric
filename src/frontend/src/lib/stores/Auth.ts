import { writable, get } from "svelte/store";
import type {
  Writable,
  Subscriber,
  Invalidator,
  Unsubscriber,
} from "svelte/store";
import { nostrHandler } from "$lib/nostr";
import { clearLocalAuth, updateLocalAuth } from "$lib/stores/LocalStorage";
import { IdentityHandler } from "$lib/identity/IdentityHandler";
import { NostrUserHandler } from "$lib/nostr/NostrUserHandler";
import type { Result } from "$declarations/backend/backend.did";
import type { NDKUserProfile } from "@nostr-dev-kit/ndk";

export enum AuthStates {
  ANONYMOUS,
  NOSTR_AUTHENTICATED,
  IDENTITY_AUTHENTICATED,
  PRO_AUTHENTICATED,
}

export type AuthState =
  | AuthStates.ANONYMOUS
  | AuthStates.NOSTR_AUTHENTICATED
  | AuthStates.IDENTITY_AUTHENTICATED
  | AuthStates.PRO_AUTHENTICATED;

export interface AuthUserStore {
  setNostr: (nostr: NostrUserHandler) => void;
  logInWithIdentity: (
    identity?: IdentityHandler,
    nostrUser?: NostrUserHandler,
  ) => Promise<void>;
  subscribe: (
    this: void,
    run: Subscriber<AuthUser>,
    invalidate?: Invalidator<AuthUser>,
  ) => Unsubscriber;
  setIdentity: (identity: IdentityHandler) => void;
  logInAnonymously: (
    nostrUser?: NostrUserHandler,
    privateKey?: string,
  ) => Promise<void>;
  setAuthState: (authState: AuthState) => void;
  logOut: () => void;
  registerAnonymously: (
    privateKey: string,
    profile: NDKUserProfile,
  ) => Promise<void>;
  registerWithIdentity: (
    privateKey: string,
    profile: NDKUserProfile,
  ) => Promise<void>;
  checkIdentityActiveOnPage: () => Promise<void>;
  setLoading: (loading: boolean) => void;
}

export class NotYetAssociatedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NotYetAssociatedError";
  }
}

export class AssociatedFetchError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AssociatedFetchError";
  }
}

export interface AuthUser {
  nostr: NostrUserHandler | undefined;
  identity: IdentityHandler | undefined;
  authState: AuthState;
  loading: boolean;
}

export function getAuthUser(): AuthUserStore {
  const auth: Writable<AuthUser> = writable<AuthUser>({
    nostr: undefined,
    identity: undefined,
    authState: AuthStates.ANONYMOUS,
    loading: true,
  });
  const { subscribe, set, update } = auth;

  const setAuthState = (authState: AuthState): void =>
    update((auth: AuthUser) => ({ ...auth, authState }));
  const setIdentity = (identity: IdentityHandler): void =>
    update((auth: AuthUser) => ({ ...auth, identity }));
  const setNostr = (nostr: NostrUserHandler): void =>
    update((auth: AuthUser) => ({ ...auth, nostr }));

  const setLoading = (loading: boolean): void =>
    update((auth: AuthUser) => ({ ...auth, loading }));

  const logOut = (): void => {
    nostrHandler.resetSigner();
    set({
      nostr: undefined,
      identity: undefined,
      authState: AuthStates.ANONYMOUS,
      loading: false,
    });
    clearLocalAuth();
  };

  const checkIdentityActiveOnPage = async (): Promise<void> => {
    const handler: IdentityHandler = new IdentityHandler();
    await handler.init();
    if (handler.isIdentityAuthenticated()) {
      setIdentity(handler);
    }
  };

  const logInWithIdentity = async (
    identity?: IdentityHandler,
    nostrUser?: NostrUserHandler,
  ): Promise<void> => {
    let authIdentity: IdentityHandler | undefined = get(auth).identity;

    // if identityHandler was not yet set, and it was not passed in a param either, create a new one
    if (identity === undefined && authIdentity === undefined) {
      const handler: IdentityHandler = new IdentityHandler();
      await handler.init();
      setIdentity(handler);
      authIdentity = get(auth).identity;
    } else if (identity && authIdentity === undefined) {
      setIdentity(identity);
      authIdentity = get(auth).identity;
    }

    // check if any user is associated with the identity
    if (
      authIdentity !== undefined &&
      !(await authIdentity.isIdentityAssociated())
    ) {
      throw new NotYetAssociatedError(
        "Identity not yet associated with a user",
      );
    }

    let authNostr: NostrUserHandler | undefined = get(auth).nostr;
    // if nostrUserHandler was not yet initialized, and it was not passed in a param, create a new one
    if (
      authIdentity !== undefined &&
      nostrUser === undefined &&
      authNostr === undefined
    ) {
      const result: Result | undefined = await authIdentity.getAssociatedUser();

      if (result && "ok" in result) {
        const userHandler: NostrUserHandler = NostrUserHandler.getInstance(
          result.ok.nostrProfile.encryptedPrivateKey,
        );
        await userHandler.initExistingUser();
        setNostr(userHandler);
        authNostr = get(auth).nostr;
      } else {
        throw new AssociatedFetchError(
          "Unable to fetch user associated with this Internet Identity",
        );
      }
    } else if (nostrUser && authNostr === undefined) {
      setNostr(nostrUser);
      authNostr = get(auth).nostr;
    }

    updateLocalAuth(
      authNostr.getPrivateKey(),
      AuthStates.IDENTITY_AUTHENTICATED,
    );
    setAuthState(AuthStates.IDENTITY_AUTHENTICATED);
  };

  const logInAnonymously = async (
    nostrUser?: NostrUserHandler,
    privateKey?: string,
  ): Promise<void> => {
    const authNostr: NostrUserHandler | undefined = get(auth).nostr;

    // if nostrUserHandler was not yet initialized, and it was not passed in a param, create a new one
    if (nostrUser === undefined && authNostr === undefined) {
      if (!privateKey) {
        throw Error(
          "Private key must be specified if Nostr user is not yet created",
        );
      } else {
        const userHandler: NostrUserHandler =
          NostrUserHandler.getInstance(privateKey);
        await userHandler.initExistingUser();
        setNostr(userHandler);
      }
    } else if (nostrUser && authNostr === undefined) {
      setNostr(nostrUser);
    }

    updateLocalAuth(
      nostrUser?.getPrivateKey() || privateKey,
      AuthStates.NOSTR_AUTHENTICATED,
    );
    setAuthState(AuthStates.NOSTR_AUTHENTICATED);
  };

  const registerAnonymously = async (
    privateKey: string,
    profile: NDKUserProfile,
  ): Promise<void> => {
    if (!privateKey || !profile) {
      throw Error("Private key and profile must be specified.");
    } else {
      const userHandler: NostrUserHandler =
        NostrUserHandler.getInstance(privateKey);
      await userHandler.initNewUser(profile);
      setNostr(userHandler);
      updateLocalAuth(privateKey, AuthStates.NOSTR_AUTHENTICATED);
      setAuthState(AuthStates.NOSTR_AUTHENTICATED);
    }
  };

  const registerWithIdentity = async (
    privateKey: string,
    profile: NDKUserProfile,
  ): Promise<void> => {
    const authIdentity: IdentityHandler | undefined = get(auth).identity;
    if (authIdentity === undefined) {
      throw Error("You must be signed in to Internet Identity to register.");
    } else if (!privateKey || !profile) {
      throw Error("Private key and profile must be specified.");
    } else {
      const userHandler: NostrUserHandler =
        NostrUserHandler.getInstance(privateKey);
      await userHandler.initNewUser(profile);
      const publicKey: string =
        await nostrHandler.generatePublicKeyFromPrivateKey(privateKey);
      await authIdentity.associateNewUserWithIdentity(
        profile,
        privateKey,
        publicKey,
      );
      setNostr(userHandler);
      updateLocalAuth(privateKey, AuthStates.IDENTITY_AUTHENTICATED);
      setAuthState(AuthStates.IDENTITY_AUTHENTICATED);
    }
  };

  return {
    subscribe,
    logOut,
    logInAnonymously,
    logInWithIdentity,
    registerWithIdentity,
    registerAnonymously,
    setAuthState,
    setIdentity,
    setNostr,
    setLoading,
    checkIdentityActiveOnPage,
  };
}

export const authUser: AuthUserStore = getAuthUser();
