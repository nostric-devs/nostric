import Types "./CkBtcTypes";
import Blob "mo:base/Blob";
import Array "mo:base/Array";
import Principal "mo:base/Principal";
import Nat8 "mo:base/Nat8";
import Iter "mo:base/Iter";
import Text "mo:base/Text";

module {
  let crc32Seed : Nat32 = 0xffffffff;
  /// Convert Principal to ICRC1.Subaccount
  // from https://github.com/research-ag/motoko-lib/blob/2772d029c1c5087c2f57b022c84882f2ac16b79d/src/TokenHandler.mo#L51
  public func toSubaccount(p : Principal) : Types.Subaccount {
    // p blob size can vary, but 29 bytes as most. We preserve it'subaccount size in result blob
    // and it'subaccount data itself so it can be deserialized back to p
    let bytes = Blob.toArray(Principal.toBlob(p));
    let size = bytes.size();

    assert size <= 29;

    let a = Array.tabulate<Nat8>(
      32,
      func(i : Nat) : Nat8 {
        if (i + size < 31) {
          0;
        } else if (i + size == 31) {
          Nat8.fromNat(size);
        } else {
          bytes[i + size - 32];
        };
      },
    );
    Blob.fromArray(a);
  };

  public func toAccount({ caller : Principal; canister : Principal }) : Types.Account {
    {
      owner = canister;
      subaccount = ?toSubaccount(caller);
    };
  };

  public func createInvoice(to : Types.Account, amount : Nat) : Types.Invoice {
    {
      to;
      amount;
    };
  };

  /// Converts an account to text.
  public func toText({ owner; subaccount } : Types.Account) : Text {
    let ownerText = Principal.toText(owner);
    switch (subaccount) {
      case (null) { ownerText };
      case (?subaccount) {
        assert (subaccount.size() == 32);
        if (iterAll(subaccount.vals(), func(b : Nat8) : Bool { b == 0 })) {
          ownerText;
        } else {
          ownerText # "-" # checkSum(owner, subaccount) # "." # displaySubaccount(subaccount);
        };
      };
    };
  };
  private func iterAll<T>(xs : Iter.Iter<T>, predicate : (T) -> Bool) : Bool {
    loop {
      switch (xs.next()) {
        case (null) { return true };
        case (?x) { if (not predicate(x)) { return false } };
      };
    };
  };

  private func checkSum(owner : Principal, subaccount : Blob) : Text {
    let crc = crc32Seed ^ iterFold(iterChain(Principal.toBlob(owner).vals(), subaccount.vals()), updateCrc, crc32Seed);

    let d = func(shift : Nat) : Text {
      base32Alphabet[Nat32.toNat((crc >> Nat32.fromNat(shift)) & 0x1f)];
    };

    d(27) # d(22) # d(17) # d(12) # d(7) # d(2) # base32Alphabet[Nat32.toNat((crc & 0x03) << 3)];
  };

  // Hex-encodes a subaccount, skipping the leading zeros.
  func displaySubaccount(subaccount : Blob) : Text {
    func nibbles(b : Nat8) : Iter.Iter<Nat8> {
      iterChain(iterOnce(b / 16), iterOnce(b % 16));
    };

    Text.fromIter(
      Iter.map(
        iterSkipWhile(
          iterFlatMap(subaccount.vals(), nibbles),
          func(b : Nat8) : Bool { b == 0 },
        ),
        hexDigit,
      )
    );
  };

  private func iterChain<T>(xs : Iter.Iter<T>, ys : Iter.Iter<T>) : Iter.Iter<T> = object {
    public func next() : ?T {
      switch (xs.next()) {
        case (null) { ys.next() };
        case (?x) { ?x };
      };
    };
  };

  private func iterFold<T, A>(xs : Iter.Iter<T>, f : (A, T) -> A, seed : A) : A {
    var acc = seed;
    loop {
      switch (xs.next()) {
        case (null) { return acc };
        case (?x) { acc := f(acc, x) };
      };
    };
  };

  private func updateCrc(crc : Nat32, byte : Nat8) : Nat32 {
    crc32Table[Nat32.toNat(crc ^ Nat32.fromNat(Nat8.toNat(byte)) & 0xff)] ^ (crc >> 8);
  };

};
