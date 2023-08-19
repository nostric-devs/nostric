import Map "mo:base/HashMap";
import Text "mo:base/Text";
import Array "mo:base/Array";
import Buffer "mo:base/Buffer";
import List "mo:base/List";
import Iter "mo:base/Iter";
import Int "mo:base/Int";
import Nat "mo:base/Nat";
import Bool "mo:base/Bool";
import Principal "mo:base/Principal";
import Result "mo:base/Result";
import Option "mo:base/Option";
import Debug "mo:base/Debug";
import Order "mo:base/Order";
import Blob "mo:base/Blob";
import Hash "mo:base/Hash";
import Hex "./utils/Hex";

// Declare a shared actor class
// Bind the caller and the initializer
shared({ caller = initializer }) actor class() {

    type Profile = {
        pk: Text;
        encrypted_sk: Text;
        username: Text;
        avatar_url: Text;
    };

    type Error = {
        #NotAuthenticated;
        #ProfileNotFound;
    };

    private var profiles = Map.HashMap<Principal, Profile>(0, Principal.equal, Principal.hash);

    public shared (msg) func addProfile(p: Profile) : async Result.Result<(Profile), Error> {

        if(Principal.isAnonymous(msg.caller)){ // Only allows signed users to register profile
            return #err(#NotAuthenticated); // If the caller is anonymous Principal "2vxsx-fae" then return an error
        };

        let id = msg.caller;

        let profile : Profile = {
            pk = p.pk;
            encrypted_sk = p.encrypted_sk;
            username = p.username;
            avatar_url = p.avatar_url
        };

        profiles.put(id, profile);
        return #ok(profile);
        // Return an OK result
    };

    public query func getProfile(principal : Principal) : async Result.Result<Profile, Error> {
        let profile = profiles.get(principal);
        return Result.fromOption(profile, #ProfileNotFound);
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

    let vetkd_system_api : VETKD_SYSTEM_API = actor("bw4dl-smaaa-aaaaa-qaacq-cai");

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

};
