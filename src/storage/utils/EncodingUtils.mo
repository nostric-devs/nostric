import Text "mo:base/Text";
import Char "mo:base/Char";
import Int "mo:base/Int";
import Nat "mo:base/Nat";
import Iter "mo:base/Iter";
import Array "mo:base/Array";
import Blob "mo:base/Blob";
import Buffer "mo:base/Buffer";
import Nat8 "mo:base/Nat8";
import Nat16 "mo:base/Nat16";
import Nat32 "mo:base/Nat32";
import List "mo:base/List";
import Base64 "mo:encoding.mo/Base64";

module {
  let principalCharacterSet = "0123456789abcdefghijklmnopqrstuvwxyz/-";
  let urlCharacterSet = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz~-_";

  let filenameCharacterSet = "0123456789";
  let encodingFilenameSet = "0123456789abcdefghijklmnopqrstuvwxyz-";

  public func encode(input : Text) : Text {
    return convBase(input, principalCharacterSet, urlCharacterSet);
  };

  public func decode(input : Text) : Text {
    return convBase(input, urlCharacterSet, principalCharacterSet);
  };

  public func encodeFileName(input : Text) : Text {
    return convBase(input, filenameCharacterSet, encodingFilenameSet);
  };

  public func decodeFileName(input : Text) : Text {
    return convBase(input, encodingFilenameSet, filenameCharacterSet);
  };

  public func encodeBase64(b : Blob) : Text {
    let arr = Blob.toArray(b);
    var encoded = Base64.StdEncoding.encode(arr);
    switch (Text.decodeUtf8(Blob.fromArray(encoded))) {
      case (?result) {
        result;
      };
      case null {
        "";
      };
    };
  };

  public func decodeBase64(input : Text) : Blob {
    let chars = Text.toArray(input);
    let asciiValues = Array.map<Char, Nat8>(
      chars,
      func(char) : Nat8 {
        let charCode = Char.toNat32(char);
        if (charCode <= 127) {
          // Character is within the ASCII range
          return Nat8.fromNat16(Nat16.fromNat32(charCode));
        } else {
          // Character is outside the ASCII range, replace with a placeholder
          // Here, using '?' (ASCII 63)
          return 63; // ASCII for '?'
        };
      },
    );

    let decodedFile = Base64.StdEncoding.decode(asciiValues);
    switch (decodedFile) {
      case (#ok(res)) {
        Blob.fromArray(res);
      };
      case (#err(_)) {
        Blob.fromArray([]);
      };
    };
  };

  func convBase(numberInput : Text, fromBaseInput : Text, toBaseInput : Text) : Text {
    if (fromBaseInput == toBaseInput) return numberInput;
    let fromBase = Text.toArray(fromBaseInput);
    let toBase = Text.toArray(toBaseInput);
    let number = Text.toArray(numberInput);
    let fromLen = Text.size(fromBaseInput);
    let toLen = Text.size(toBaseInput);
    var retval : Text = "";
    if (toBaseInput == "0123456789") {
      var retvalNum = 0;
      for (i in Iter.range(1, Text.size(numberInput))) {
        let digitValue = indexOf(number[i - 1], fromBase);
        switch (digitValue) {
          case null {};
          case (?dVal) {
            retvalNum := retvalNum + (dVal * (fromLen ** (Text.size(numberInput) - i)));
          };
        };
      };
      return Nat.toText(retvalNum);
    };
    var base10 : Nat = 0;
    if (fromBaseInput != "0123456789") {
      base10 := switch (Nat.fromText(convBase(numberInput, fromBaseInput, "0123456789"))) {
        case (?num) { num };
        case null { 0 };
      };
    } else {
      base10 := switch (Nat.fromText(numberInput)) {
        case (?num) { num };
        case null { 0 };
      };
    };
    if (base10 < toLen) {
      return Char.toText(toBase[base10]);
    };
    while (base10 != 0) {
      let index = base10 % toLen;
      retval := Char.toText(toBase[index]) # retval;
      base10 := base10 / toLen;
    };
    return retval;
  };

  func indexOf(element : Char, array : [Char]) : ?Nat {
    for (i in Iter.range(0, Array.size(array) - 1)) {
      if (array[i] == element) {
        return ?i;
      };
    };
    return null;
  };
};
