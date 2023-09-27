import Map "mo:base/HashMap";
import Text "mo:base/Text";
import Array "mo:base/Array";
import Principal "mo:base/Principal";
import Result "mo:base/Result";
import Option "mo:base/Option";
import Blob "mo:base/Blob";
import Iter "mo:base/Iter";
import Hex "./utils/Hex";
import Account "./utils/Account";
import DynamicRelays "canister:dynamic_relays";

// Declare a shared actor class
// Bind the caller and the initializer
shared({ caller = initializer }) actor class() = this {

    type NostrProfile = {
        pk: Text;
        encrypted_sk: Text;
        username: Text;
        about: Text;
        avatar_url: Text;
    };

    type Profile = {
        nostr_profile: NostrProfile;
        is_pro: Bool;
        private_relay: NostricRelay;
        followed_relays: FollowedRelays;
    };

    type Error = {
        #NotAuthenticated;
        #ProfileNotFound;
        #UnableToCreate;
        #UnableToCreateRelay;
    };

    public type AccountType = { owner : Principal; subaccount : ?Blob };

    public type Actor = actor {
        icrc1_balance_of : (acc : AccountType) -> async Nat;
    };

    private stable var ledgerActor : Actor = actor ("mxzaz-hqaaa-aaaar-qaada-cai") : Actor;

    type NostricRelay = {
        gateway_url: Text;
        canister_id: Text;
     };

     type FollowedRelays = {
        nostr: [Text];
        nostric: [NostricRelay];
     };

    private var profiles = Map.HashMap<Principal, Profile>(0, Principal.equal, Principal.hash);

    private stable var stableprofiles : [(Principal, Profile)] = [];

    public shared (msg) func addProfile(p: NostrProfile) : async Result.Result<Profile, Error> {
        // Only allows signed users to register profile
        if (Principal.isAnonymous(msg.caller)) {
            // If the caller is anonymous Principal "2vxsx-fae" then return an error
            return #err(#NotAuthenticated);
        };

        let nostr_profile : NostrProfile = {
            pk = p.pk;
            encrypted_sk = p.encrypted_sk;
            username = p.username;
            about = p.about;
            avatar_url = p.avatar_url
        };

        let profile : Profile = {
          nostr_profile = nostr_profile;
          is_pro = false;
          private_relay = {
            gateway_url = "";
            canister_id = "";
          };
          followed_relays = {
            nostr = [
              "wss://relay.nostr.band",
              "wss://nostr.girino.org",
              "wss://nostr-pub.wellorder.net"
            ];
            nostric = [];
          };
        };

        profiles.put(msg.caller, profile);
        let saved_profile = profiles.get(msg.caller);
        return Result.fromOption(saved_profile, #UnableToCreate);
    };

    public query (msg) func getProfile() : async Result.Result<Profile, Error> {
         let profile = profiles.get(msg.caller);
         return Result.fromOption(profile, #ProfileNotFound);
    };

    public shared (msg) func updateProfile(p: NostrProfile) : async Result.Result<(Profile), Error> {
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
              let nostr_profile : NostrProfile = {
                  pk = profile.nostr_profile.pk;
                  encrypted_sk = profile.nostr_profile.encrypted_sk;
                  username = p.username;
                  about = p.about;
                  avatar_url = p.avatar_url;
              };
              let updated_profile = { profile with nostr_profile = nostr_profile };
              profiles.put(id, updated_profile);
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

    public shared (msg) func addNostricRelay(gateway_url: Text, canister_id: Text) : async Result.Result<(()), Error> {
      // Only allows signed users to register profile
      if (Principal.isAnonymous(msg.caller)) {
          // If the caller is anonymous Principal "2vxsx-fae" then return an error
          return #err(#NotAuthenticated);
      };

      let id = msg.caller;
      let result = profiles.get(id);
      var relayExists = false;

      switch (result) {
        case null {
            return #err(#ProfileNotFound);
        };
        case (?profile) {
          // Check if the relay already exists
          label l for (i in Iter.range(0, profile.followed_relays.nostric.size() - 1)) {
            let relay = profile.followed_relays.nostric[i];
            if (relay.gateway_url == gateway_url and relay.canister_id == canister_id) {
                relayExists := true;
                break l;
            };
          };
          // If the relay doesn't exist, add it
          if (relayExists == false) {
            let nostricRelay: NostricRelay = {
              gateway_url = gateway_url;
              canister_id = canister_id;
            };
            let updatedProfile: Profile = {
               nostr_profile = profile.nostr_profile;
               is_pro = profile.is_pro;
               private_relay = profile.private_relay;
               followed_relays = {
                   nostr = profile.followed_relays.nostr;
                   nostric = Array.append<NostricRelay>(profile.followed_relays.nostric, [nostricRelay]);
               }
            };
            profiles.put(msg.caller, updatedProfile);
          };
        };
      };
      return #ok(());
    };

    public shared (msg) func removeNostricRelay(gateway_url: Text, canister_id: Text) : async Result.Result<(()), Error> {
        // Only allows signed users to register profile
        if (Principal.isAnonymous(msg.caller)) {
            // If the caller is anonymous Principal "2vxsx-fae" then return an error
            return #err(#NotAuthenticated);
        };

        let id = msg.caller;
        let result = profiles.get(id);
        var relayExists = false;

        switch (result) {
          case null {
              return #err(#ProfileNotFound);
          };
          case (?profile) {
             // Filter the relays that don't match the provided relay
             let filteredRelays = Array.filter(
                 profile.followed_relays.nostric,
                 func (relay: NostricRelay) : Bool {
                     return relay.gateway_url != gateway_url or relay.canister_id != canister_id;
                 }
             );
             let updatedProfile: Profile = {
                 nostr_profile = profile.nostr_profile;
                 is_pro = profile.is_pro;
                 private_relay = profile.private_relay;
                 followed_relays = {
                     nostr = profile.followed_relays.nostr;
                     nostric = filteredRelays
                 }
             };
             profiles.put(msg.caller, updatedProfile);
             return #ok(());
          };
        };
    };

    public shared (msg) func addNostrRelay(gateway_url: Text) : async Result.Result<(()), Error> {
      // Only allows signed users to register profile
      if (Principal.isAnonymous(msg.caller)) {
          // If the caller is anonymous Principal "2vxsx-fae" then return an error
          return #err(#NotAuthenticated);
      };

      let id = msg.caller;
      let result = profiles.get(id);
      var relayExists = false;

      switch (result) {
        case null {
            return #err(#ProfileNotFound);
        };
        case (?profile) {
          // Check if the relay already exists
          label l for (i in Iter.range(0, profile.followed_relays.nostr.size() - 1)) {
              let relay = profile.followed_relays.nostr[i];
              if (relay == gateway_url) {
                  relayExists := true;
                  break l;
              };
          };
          // If the relay doesn't exist, add it
          if (relayExists == false) {
              let updatedProfile: Profile = {
                 nostr_profile = profile.nostr_profile;
                 is_pro = profile.is_pro;
                 private_relay = profile.private_relay;
                 followed_relays = {
                     nostr = Array.append<Text>(profile.followed_relays.nostr, [gateway_url]);
                     nostric = profile.followed_relays.nostric;
                 }
             };
             profiles.put(msg.caller, updatedProfile);
          };
          return #ok(());
        };
      };
    };

    public shared (msg) func removeNostrRelay(gateway_url: Text) : async Result.Result<(()), Error> {
        // Only allows signed users to register profile
        if (Principal.isAnonymous(msg.caller)) {
            // If the caller is anonymous Principal "2vxsx-fae" then return an error
            return #err(#NotAuthenticated);
        };

        let id = msg.caller;
        let result = profiles.get(id);
        var relayExists = false;

        switch (result) {
          case null {
              return #err(#ProfileNotFound);
          };
          case (?profile) {
             // Filter the relays that don't match the provided relay
             let filteredRelays = Array.filter(
                 profile.followed_relays.nostr,
                 func (relay: Text) : Bool {
                     return relay != gateway_url;
                 }
             );
             let updatedProfile: Profile = {
                 nostr_profile = profile.nostr_profile;
                 is_pro = profile.is_pro;
                 private_relay = profile.private_relay;
                 followed_relays = {
                     nostr = filteredRelays;
                     nostric = profile.followed_relays.nostric;
                 }
             };
             profiles.put(msg.caller, updatedProfile);
             return #ok(());
          };
      };
    };

    public shared (msg) func addPrivateNostricRelay(gateway_url: Text, canister_id: Text) : async Result.Result<(()), Error> {
          // Only allows signed users to register profile
          if (Principal.isAnonymous(msg.caller)) {
              // If the caller is anonymous Principal "2vxsx-fae" then return an error
              return #err(#NotAuthenticated);
          };

          let id = msg.caller;
          let result = profiles.get(id);
          var relayExists = false;

          switch (result) {
            case null {
                return #err(#ProfileNotFound);
            };
            case (?profile) {
              // If the relay doesn't exist, add it
              if (relayExists == false) {
                let privateNostricRelay: NostricRelay = {
                  gateway_url = gateway_url;
                  canister_id = canister_id;
                };
                let updatedProfile: Profile = {
                   nostr_profile = profile.nostr_profile;
                   is_pro = true;
                   private_relay = privateNostricRelay;
                   followed_relays = profile.followed_relays;
                };
                profiles.put(msg.caller, updatedProfile);
              };
            };
          };
          return #ok(());
        };

    // Only the ecdsa methods in the IC management canister is required here.
    type VETKD_SYSTEM_API = actor {
        vetkd_public_key : ({
            canister_id : ?Principal;
            derivation_path : [Blob];
            key_id : { curve: { #bls12_381; } ; name: Text };
        }) -> async ({ public_key : Blob; });
        vetkd_encrypted_key : ({
            public_key_derivation_path : [Blob];
            derivation_id : Blob;
            key_id : { curve: { #bls12_381; } ; name: Text };
            encryption_public_key : Blob;
        }) -> async ({ encrypted_key : Blob });
    };

    let vetkd_system_api : VETKD_SYSTEM_API = actor("br5f7-7uaaa-aaaaa-qaaca-cai");

    public shared({ caller }) func app_vetkd_public_key(derivation_path: [Blob]): async Text {
        let { public_key } = await vetkd_system_api.vetkd_public_key({
            canister_id = null;
            derivation_path;
            key_id = { curve = #bls12_381; name = "test_key_1" };
        });
        Hex.encode(Blob.toArray(public_key))
    };

    public shared({ caller }) func symmetric_key_verification_key(): async Text {
        let { public_key } = await vetkd_system_api.vetkd_public_key({
            canister_id = null;
            derivation_path = Array.make(Text.encodeUtf8("symmetric_key"));
            key_id = { curve = #bls12_381; name = "test_key_1" };
        });
        Hex.encode(Blob.toArray(public_key))
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

    system func preupgrade() {
        stableprofiles := Iter.toArray(profiles.entries());
    };

    system func postupgrade() {
        profiles := Map.fromIter<Principal, Profile>(
            stableprofiles.vals(),
            10,
            Principal.equal,
            Principal.hash,
        );
        stableprofiles := [];
    };

    public shared (msg) func getDepositAddress() : async Text {
        let acc : AccountType = {
        owner = Principal.fromActor(this);
        subaccount = ?Account.toSubaccount(msg.caller);
        };
        return Account.toText(acc);
    };

    // Method for local testing purposes
    public shared (msg) func getSubaccountForCaller() : async Blob {
        Account.toSubaccount(msg.caller);
    };

    // Method for local testing purposes
    public shared (msg) func whoAmI() : async Principal {
        msg.caller;
    };

    // Method for local testing purposes
    public shared (msg) func getSubaccountForPrincipal(principal : Text) : async Blob {
        let p : Principal = Principal.fromText(principal);
        Account.toSubaccount(p);
    };

    // Method for local testing purposes
    public shared (msg) func getBalance() : async Nat {
        let acc : AccountType = {
        owner = Principal.fromActor(this);
        subaccount = ?Account.toSubaccount(msg.caller);
        };
        var response : Nat = await ledgerActor.icrc1_balance_of(acc);
        return response;
    };

    public shared (msg) func verifyPayment() : async Bool {
        let acc : AccountType = {
        owner = Principal.fromActor(this);
        subaccount = ?Account.toSubaccount(msg.caller);
        };
        var response : Nat = await ledgerActor.icrc1_balance_of(acc);
        if (response > 10) {
            return true;
        } else {
            return false;
        };
    };

    public shared (msg) func spawnBucket() : async Text {
      return await DynamicRelays.spawn_bucket();
    };

    public shared (msg) func handleTransaction(is_dev : Bool) : async Result.Result<NostricRelay, Error> {
      if (await verifyPayment()) {
        let canister_id = await spawnBucket();
        var gateway_url = "wss://gateway.icws.io";
        if (is_dev) {
          gateway_url := "ws://localhost:8089";
        };
        switch (await addPrivateNostricRelay(gateway_url, canister_id)) {
          case (#ok(_)) {
            let privateNostricRelay: NostricRelay = {
                              gateway_url = gateway_url;
                              canister_id = canister_id;
            };
            return #ok(privateNostricRelay);
          };
          case (#err(_)) {
              return #err(#UnableToCreateRelay);
          };
        };
      };
      return #err(#UnableToCreateRelay);
    };
};
