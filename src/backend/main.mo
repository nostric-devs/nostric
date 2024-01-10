import vetkd_system_api "canister:vetkd_system_api";
import Hex "./utils/Hex";
import Blob "mo:base/Blob";
import Array "mo:base/Array";
import Text "mo:base/Text";
import Principal "mo:base/Principal";
import Account "./utils/Account";

shared ({ caller = parent }) actor class Main() = this {
  public func greet(name : Text) : async Text {
    return "Hello, " # name # "!";
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
};
