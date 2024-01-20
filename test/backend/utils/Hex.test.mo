import { test } "mo:test";
import Hex "../../../src/backend/utils/Hex";
import Nat8 "mo:base/Nat8";
import Text "mo:base/Text";

test(
  "[backend/utils/Hex] encode function - Encoding an empty array should return an empty string.",
  func() {
    assert Hex.encode([]) == "";
  },
);

test(
  "[backend/utils/Hex] encode function - Encoding regular values should match expected output.",
  func() {
    assert Hex.encode([0x1A, 0xFF, 0x00]) == "1aff00";
  },
);

test(
  "[backend/utils/Hex] decode function - Decoding an empty string should return an empty array.",
  func() {
    assert Hex.decode("") == #ok([]);
  },
);

test(
  "[backend/utils/Hex] decode function - Decoding regular values should match expected output.",
  func() {
    assert Hex.decode("1aff00") == #ok([0x1A, 0xFF, 0x00]);
  },
);

test(
  "[backend/utils/Hex] decode function - Decoding invalid input should return an error.",
  func() {
    switch (Hex.decode("1x")) {
      case (#err _) { assert true };
      case _ { assert false };
    };
  },
);

test(
  "[backend/utils/Hex] decode function - Decoding odd-length string should work correctly.",
  func() {
    assert Hex.decode("1a") == #ok([0x1A]);
  },
);
