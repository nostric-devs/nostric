import vetkd_system_api "canister:vetkd_system_api";
import Hex "./utils/Hex";
import Blob "mo:base/Blob";
import Array "mo:base/Array";
import Text "mo:base/Text";
import Principal "mo:base/Principal";
import Account "./utils/Account";
import Map "mo:base/HashMap";
import Result "mo:base/Result";
import Iter "mo:base/Iter";
import Bool "mo:base/Bool";

actor class Main() = this {
  public func greet(name : Text) : async Text {
    return "Hello, " # name # "!";
  };

  type NostrProfile = {
    publicKey : Text;
    encryptedPrivateKey : Text;
    name : Text;
    bio : Text;
    image : Text;
  };

  type Profile = {
    nostrProfile : NostrProfile;
    isPro : Bool;
  };

  private stable var invitationcodes : [Text] = [];

  private stable var admins : [Text] = [
    "s5n6f-gw2l4-zzp7o-vkbzw-zqqlh-pa5hs-gyb3w-er6d6-rwiem-t4h6w-vqe" // Lukas local dfx identity
  ];

  private var profiles = Map.HashMap<Principal, Profile>(0, Principal.equal, Principal.hash);

  private stable var stableprofiles : [(Principal, Profile)] = [];

  type Error = {
    #NotAuthenticated;
    #InvalidInvitationCode;
    #ProfileNotFound;
    #UnableToCreate;
    #ProfileAlreadyHasRelay;
    #UnableToCreateRelay;
    #CallerNotAdmin;
  };

  private func isAdmin(p : Principal) : Bool {
    let admin = Array.indexOf<Text>(Principal.toText(p), admins, Text.equal);
    if (admin == null){
      return false;
    } else {
      return true;
    };
  };

  public shared (msg) func addInvitationCode(invitationCode : Text) : async Result.Result<[Text], Error> {
    if (isAdmin(msg.caller)){
      invitationcodes := Array.append<Text>(invitationcodes, [invitationCode]);
      return #ok(invitationcodes);
    } else {
      return #err(#CallerNotAdmin);
    };
    
  };

  // for testing only
  public shared (msg) func getInvitationCodes() : async Result.Result<[Text], Error> {
    if (isAdmin(msg.caller)){
      return #ok(invitationcodes);
    } else {
      return #err(#CallerNotAdmin);
    };    
  };  

  public shared (msg) func whoAmI() : async (Principal){
    return msg.caller;
  };

  public shared (msg) func addProfile(p : NostrProfile, invitationCode : Text) : async Result.Result<Profile, Error> {
    // Only allows signed users to register profile
    if (Principal.isAnonymous(msg.caller)) {
      // If the caller is anonymous Principal "2vxsx-fae" then return an error
      return #err(#NotAuthenticated);
    };
    // Check if user has valid invitation code
    let code = Array.indexOf<Text>(invitationCode, invitationcodes, Text.equal);
    // Todo add removal of invitation code after use
    if (code == null){
      return #err(#InvalidInvitationCode)
    };

    let nostrProfile : NostrProfile = {
      publicKey = p.publicKey;
      encryptedPrivateKey = p.encryptedPrivateKey;
      name = p.name;
      bio = p.bio;
      image = p.image;
    };

    let profile : Profile = {
      nostrProfile = nostrProfile;
      isPro = false;
    };

    profiles.put(msg.caller, profile);
    let savedProfile = profiles.get(msg.caller);
    return Result.fromOption(savedProfile, #UnableToCreate);
  };

  public query (msg) func getProfile() : async Result.Result<Profile, Error> {
    let profile = profiles.get(msg.caller);
    return Result.fromOption(profile, #ProfileNotFound);
  };

  public shared (msg) func updateProfile(p : NostrProfile) : async Result.Result<(Profile), Error> {
    // Only allows signed users to register profile
    if (Principal.isAnonymous(msg.caller)) {
      // If the caller is anonymous Principal "2vxsx-fae" then return an error
      return #err(#NotAuthenticated);
    };

    let id = msg.caller;
    let result = profiles.get(id);

    switch (result) {
      case null {
        return #err(#ProfileNotFound);
      };
      case (?profile) {
        let nostrProfile : NostrProfile = {
          publicKey = profile.nostrProfile.publicKey;
          encryptedPrivateKey = profile.nostrProfile.encryptedPrivateKey;
          name = p.name;
          bio = p.bio;
          image = p.image;
        };
        let updatedProfile = { profile with nostrProfile = nostrProfile };
        profiles.put(id, updatedProfile);
        return #ok(profile);
      };
    };
  };

  public shared (msg) func deleteProfile() : async Result.Result<(()), Error> {
    // Only allows signed users to register profile
    if (Principal.isAnonymous(msg.caller)) {
      // If the caller is anonymous Principal "2vxsx-fae" then return an error
      return #err(#NotAuthenticated);
    };
    profiles.delete(msg.caller);
    return #ok(());
  };

  public type AccountType = { owner : Principal; subaccount : ?Blob };

  public type Actor = actor {
    icrc1_balance_of : (acc : AccountType) -> async Nat;
  };

  public shared (msg) func getBalance() : async Nat {
    let acc : AccountType = {
      owner = Principal.fromActor(this);
      subaccount = ?Account.toSubaccount(msg.caller);
    };
    var response : Nat = await ledgerActor.icrc1_balance_of(acc);
    return response;
  };

  private stable var ledgerActor : Actor = actor ("mxzaz-hqaaa-aaaar-qaada-cai") : Actor;

  public shared ({ caller }) func app_vetkd_public_key(derivation_path : [Blob]) : async Text {
    let { public_key } = await vetkd_system_api.vetkd_public_key({
      canister_id = null;
      derivation_path;
      key_id = { curve = #bls12_381; name = "test_key_1" };
    });
    Hex.encode(Blob.toArray(public_key));
  };

  public shared ({ caller }) func symmetric_key_verification_key() : async Text {
    let { public_key } = await vetkd_system_api.vetkd_public_key({
      canister_id = null;
      derivation_path = Array.make(Text.encodeUtf8("symmetric_key"));
      key_id = { curve = #bls12_381; name = "test_key_1" };
    });
    Hex.encode(Blob.toArray(public_key));
  };

  public shared ({ caller }) func encrypted_symmetric_key_for_caller(encryption_public_key : Blob) : async Text {
    let caller_blob = Principal.toBlob(caller);
    let { encrypted_key } = await vetkd_system_api.vetkd_encrypted_key({
      derivation_id = Principal.toBlob(caller);
      public_key_derivation_path = Array.make(Text.encodeUtf8("symmetric_key"));
      key_id = { curve = #bls12_381; name = "test_key_1" };
      encryption_public_key;
    });
    Hex.encode(Blob.toArray(encrypted_key));
  };

  // system func preupgrade() {
  //   stableprofiles := Iter.toArray(profiles.entries());
  // };

  // system func postupgrade() {
  //   profiles := Map.fromIter<Principal, Profile>(
  //     stableprofiles.vals(),
  //     10,
  //     Principal.equal,
  //     Principal.hash,
  //   );
  //   stableprofiles := [];
  // };
};
