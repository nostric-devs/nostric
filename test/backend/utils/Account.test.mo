import { test } "mo:test";
import Account "../../../src/backend/utils/Account";
import Principal "mo:base/Principal";
import Blob "mo:base/Blob";

test(
  "[backend/utils/Account] toText function - No subaccount",
  func() {
    let owner = Principal.fromText("vbkqu-7inci-palte-x");
    let account = { owner = owner; subaccount = null };
    assert Account.toText(account) == "vbkqu-7inci-palte-x";
  },
);

test(
  "[backend/utils/Account] fromText function - Empty string",
  func() {
    assert Account.fromText("") == #err(#malformed("empty"));
  },
);

test(
  "[backend/utils/Account] toSubaccount function - Principal to subaccount blob",
  func() {
    let principal = Principal.fromText("vbkqu-7inci-palte-x");
    let subaccountBlob = Account.toSubaccount(principal);

    assert Blob.hash(subaccountBlob) == 1666042697;
  },
);
