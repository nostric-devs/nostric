import type { Profile } from "../../../../.dfx/local/canisters/backend/service.did";

export class NostricUser {

  private profile: Profile | null = null;
  private private_key: string;

  constructor() {
  }

  public async init(profile : Profile, private_key : string) {
    this.profile = profile;
    this.private_key = private_key;
  }

  public get_profile() {
    return this.profile;
  }

  public get_private_key() {
    return this.private_key;
  }

  public set_profile(profile : Profile) {
    this.profile = profile;
  }

}
