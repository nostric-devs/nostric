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
        let fileExtension = ".jpg";
        let content = Blob.fromArray([1, 2, 3]);
        let result = await candb_file_upload.upload(fileExtension, content);
        switch (result) {
          case (#ok(filePath)) {
            assert true;
          };
          case (#err(_)) {
            assert false;
          };
        };
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
        let result = await candb_file_upload.download("wo5qg-ysjiq-5da/c09d5619-d72c-48ec-91e2-d145cd769f5c.jpg");
        switch (result) {
          case (#ok(u)) {
            assert u == Blob.fromArray([1, 2, 3]);
          };
          case (#err(_)) {
            assert false;
          };
        };
      },
    );
  },
);
