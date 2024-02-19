import { test } "mo:test";
import CkBtcUtils "../../../src/backend/utils/CkBtcUtils";
import Principal "mo:base/Principal";
import Blob "mo:base/Blob";

test(
  "[backend/utils/CkBtcUtils] toText function - No subaccount",
  func() {
    let owner = Principal.fromText("vbkqu-7inci-palte-x");
    let account = { owner = owner; subaccount = null };
    assert CkBtcUtils.toText(account) == "vbkqu-7inci-palte-x";
  },
);

test(
  "[backend/utils/CkBtcUtils] fromText function - Empty string",
  func() {
    assert CkBtcUtils.fromText("") == #err(#malformed("empty"));
  },
);

test(
  "[backend/utils/CkBtcUtils] toSubaccount function - Principal to subaccount blob",
  func() {
    let principal = Principal.fromText("vbkqu-7inci-palte-x");
    let subaccountBlob = CkBtcUtils.toSubaccount(principal);

    assert Blob.hash(subaccountBlob) == 1666042697;
  },
);
