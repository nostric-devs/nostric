import { AuthClient } from "@dfinity/auth-client";
import { createActor } from "$declarations/backend";
import { createActor as createStorageActor } from "$declarations/storage";
import type { NDKUserProfile } from "@nostr-dev-kit/ndk";
import type { ActorSubclass, HttpAgentOptions, Identity } from "@dfinity/agent";
import type { _SERVICE, Result } from "$declarations/backend/backend.did";
import type {
  _SERVICE as _STORAGE_SERVICE,
  FileUploadResult,
  FileListResult,
} from "$declarations/storage/storage.did";

export class IdentityHandler {
  public authClient: AuthClient | undefined;
  public backendActor: ActorSubclass<_SERVICE> | undefined;
  public storageActor: ActorSubclass<_STORAGE_SERVICE> | undefined;
  public identity: Identity | undefined;
  private host: string;

  constructor() {
    this.host =
      process.env.DFX_NETWORK === "ic"
        ? `https://${process.env.BACKEND_CANISTER_ID}.ic0.app`
        : "http://localhost:8000";
  }

  public async init(): Promise<void> {
    this.authClient = await AuthClient.create();
    try {
      await this.initActors();
    } catch {
      const identityProvider: string =
        process.env.DFX_NETWORK === "ic"
          ? "https://identity.ic0.app/#authorize"
          : `http://${process.env.INTERNET_IDENTITY_CANISTER_ID}.localhost:8000/#authorize`;

      return new Promise((resolve, reject): void => {
        this.authClient?.login({
          identityProvider,
          onSuccess: () =>
            this.initActors()
              .then(() => resolve())
              .catch(() => reject("Unable to initialize Actors")),
          onError: () => reject("Unable to authorize to Internet Identity."),
        });
      });
    }
  }

  public async initActors(): Promise<void> {
    if (this.authClient && (await this.authClient.isAuthenticated())) {
      this.identity = this.authClient.getIdentity();
      const options: HttpAgentOptions = {
        identity: this.identity,
        host: this.host,
      };

      this.backendActor = createActor(process.env.BACKEND_CANISTER_ID, {
        agentOptions: options,
      });
      this.storageActor = createStorageActor(process.env.STORAGE_CANISTER_ID, {
        agentOptions: options,
      });
    } else {
      throw Error("Unable to create actors, auth client not authenticated");
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

  public async uploadFile(file: File): Promise<string> {
    const blob: Uint8Array | number[] = [
      ...new Uint8Array(await file.arrayBuffer()),
    ];
    const fileExtension: string | undefined = `.${file.name.split(".").at(-1)}`;

    if (![".jpg", ".png", ".gif"].includes(fileExtension)) {
      throw Error("Invalid file extension, must be one of jpg, png or gif.");
    } else {
      const result: FileUploadResult = await this.storageActor.upload(
        fileExtension,
        blob,
      );
      if ("ok" in result) {
        return result.ok;
      } else {
        throw Error(`Unable to upload image, ${result.err}`);
      }
    }
  }

  public async deleteFile(fileURL: string): Promise<void> {
    const result: Result = await this.storageActor?.delete(fileURL);
    if ("err" in result) {
      throw Error("Unable to delete file");
    }
  }

  public async getFiles(limit?: bigint): Promise<string[]> {
    const result: FileListResult = await this.storageActor.listFiles(
      limit || BigInt(Number.MAX_SAFE_INTEGER),
    );
    if ("ok" in result) {
      return result.ok.map((path: string): string => {
        return `${this.host}/?canisterId=${process.env.STORAGE_CANISTER_ID}${path}`;
      });
    } else {
      throw Error(result.err);
    }
  }
}
