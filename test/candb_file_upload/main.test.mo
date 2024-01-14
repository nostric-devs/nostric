import { test; suite } "mo:test/async";
import Blob "mo:base/Blob";
import CanDB "../../src/candb_file_upload/main";

var candb_file_upload = await CanDB.Main();

await suite(
  "[candb_file_upload/main] create file",
  func() : async () {
    await test(
      "create function - Create a file",
      func() : async () {
        let file = { name = "test.txt"; content = Blob.fromArray([1, 2, 3]) };
        await candb_file_upload.create(file);
      },
    );
  },
);

await suite(
  "[candb_file_upload/main] get file",
  func() : async () {
    await test(
      "get function - Get a file",
      func() : async () {
        let file = await candb_file_upload.get("test.txt");
        switch (file) {
          case (?u) {
            assert u.name == "test.txt";
            assert u.content == Blob.fromArray([1, 2, 3]);
          };
          case null {
            assert false;
          };
        };
      },
    );
  },
);
