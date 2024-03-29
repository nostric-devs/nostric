import { test; suite } "mo:test/async";
import Blob "mo:base/Blob";
import Storage "../../src/storage/main";
import HttpUtils "../../src/storage/utils/HttpUtils";

var storage = await Storage.Main();

await suite(
  "[storage/main] create file",
  func() : async () {
    await test(
      "create function - Create a file",
      func() : async () {
        storage.setUnitTestMode(true);
        assert storage.isUnitTestMode() == true;
        let fileExtension = ".jpg";
        let content = Blob.fromArray([1, 2, 3]);
        let result = await storage.upload(fileExtension, content);
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
  "[storage/main] get file",
  func() : async () {
    await test(
      "get function - Get a file",
      func() : async () {
        storage.setUnitTestMode(true);
        let result = await storage.download("58P-nSvu4iDth78-ry.jpg");
        switch (result) {
          case (#ok(u)) {
            assert u == Blob.fromArray([1, 2, 3]);
          };
          case (#err(msg)) {
            assert false;
          };
        };
      },
    );
  },
);

await suite(
  "[storage/main] get file list",
  func() : async () {
    await test(
      "get function - Get list of files",
      func() : async () {
        storage.setUnitTestMode(true);
        let result = await storage.listFiles(10);
        switch (result) {
          case (#ok(u)) {
            assert u == ["58P-nSvu4iDth78-ry.jpg"];
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
  "[storage/main] HTTP GET file",
  func() : async () {
    await test(
      "get function - Download a file via HTTP",
      func() : async () {
        storage.setUnitTestMode(true);
        let request = {
          body = Blob.fromArray([1, 2, 3]);
          headers = [
            ("Content-Type", "image/jpg"),
            ("Access-Control-Allow-Origin", "*"),
          ];
          method = "GET";
          url = "58P-nSvu4iDth78-ry.jpg";
        };
        let result = await storage.http_request(request);
        let expectedResponse = {
          body = Blob.fromArray([1, 2, 3]);
          headers = [
            ("Content-Type", "image/jpeg"),
            ("Access-Control-Allow-Origin", "*"),
            ("X-HTTP-Fallback", "true"),
          ];
          statusCode = 200;
        };
        switch (result) {
          case (u) {
            assert u == expectedResponse;
          };
          case (_) {
            assert false;
          };
        };
      },
    );
  },
);

await suite(
  "[storage/main] delete file",
  func() : async () {
    await test(
      "delete function - Delete an existing file",
      func() : async () {
        storage.setUnitTestMode(true);
        // Assuming you have a file with the path "58P-nSvu4iDth78-ry.jpg" that can be deleted
        let filePath = "58P-nSvu4iDth78-ry.jpg";
        let result = await storage.delete(filePath);
        switch (result) {
          case (#ok(_)) {
            assert true; // File deleted successfully
          };
          case (#err(_)) {
            assert false; // There was an error deleting the file
          };
        };
      },
    );

    await test(
      "delete function - Attempt to delete a non-existent file",
      func() : async () {
        storage.setUnitTestMode(true);
        // Use a file path that does not exist
        let filePath = "q3gij!vB-7-5l*iaj.png";
        let result = await storage.delete(filePath);
        switch (result) {
          case (#ok(_)) {
            assert false; // File should not exist, so deletion should fail
          };
          case (#err(errorMessage)) {
            assert errorMessage == "Invalid file path"; // Expected error message
          };
        };
      },
    );

    await test(
      "delete function - Attempt to delete file from invalid url",
      func() : async () {
        storage.setUnitTestMode(true);
        // Use a file path that does not exist
        let filePath = "not-valid-url.jpg";
        let result = await storage.delete(filePath);
        switch (result) {
          case (#ok(_)) {
            assert false; // File should not exist, so deletion should fail
          };
          case (#err(errorMessage)) {
            assert errorMessage == "Invalid file path";
          };
        };
      },
    );
  },
);
