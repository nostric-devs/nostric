import { AuthClient } from "@dfinity/auth-client";
import type { ActorSubclass, HttpAgentOptions, Identity } from "@dfinity/agent";
import type { _SERVICE, Result } from "$declarations/backend/backend.did";
import { createActor } from "$declarations/backend";
import type { NDKUserProfile } from "@nostr-dev-kit/ndk";
import { authUser } from "$lib/stores/Auth";

export class IdentityHandler {
  public authClient: AuthClient | undefined;
  public backendActor: ActorSubclass<_SERVICE> | undefined;
  public identity: Identity | undefined;

  public async init(): Promise<void> {
    this.authClient = await AuthClient.create();
    try {
      await this.initBackendActor();
    } catch {
      const identityProvider: string =
        process.env.DFX_NETWORK === "ic"
          ? "https://identity.ic0.app/#authorize"
          : `http://${process.env.INTERNET_IDENTITY_CANISTER_ID}.localhost:8000/#authorize`;

      await this.authClient.login({
        identityProvider,
        onSuccess: async (): Promise<void> => {
          await this.initBackendActor();
        },
        onError: (): void => {
          authUser.setLoading(false);
          throw Error("Unable to login with identity");
        },
      });
    }
  }

  public async initBackendActor(): Promise<void> {
    if (this.authClient && (await this.authClient.isAuthenticated())) {
      const host: string =
        process.env.DFX_NETWORK === "ic"
          ? `https://${process.env.BACKEND_CANISTER_ID}.ic0.app`
          : "http://localhost:8000";

      this.identity = this.authClient.getIdentity();
      const options: HttpAgentOptions = {
        identity: this.identity,
        host,
      };

      this.backendActor = createActor(process.env.BACKEND_CANISTER_ID, {
        agentOptions: options,
      });
    } else {
      throw Error(
        "Unable to create backend actor, auth client not authenticated",
      );
    }
  }

  public isIdentityAuthenticated(): boolean {
    return this.backendActor !== undefined && this.identity !== undefined;
  }

  public async isIdentityAssociated(): Promise<boolean> {
    if (this.isIdentityAuthenticated()) {
      const result: Result | undefined = await this.backendActor?.getProfile();
      return result !== undefined && "ok" in result;
    } else {
      return false;
    }
  }

  public async associateNewUserWithIdentity(
    profile: NDKUserProfile,
    privateKey: string,
    publicKey: string,
  ): Promise<void> {
    const result: Result | undefined = await this.backendActor?.addProfile({
      publicKey,
      encryptedPrivateKey: privateKey,
      name: profile.name,
      bio: profile.bio,
      image: profile.image,
    });
    if (result === undefined || "err" in result) {
      throw Error("Unable to associate Internet Identity with new user");
    }
  }

  public async getAssociatedUser(): Promise<Result | undefined> {
    return this.backendActor?.getProfile();
  }
}

