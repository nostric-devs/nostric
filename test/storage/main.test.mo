import { test; suite } "mo:test/async";
import Blob "mo:base/Blob";
import Storage "../../src/storage/main";
import Debug "mo:base/Debug";
import HttpUtils "../../src/storage/utils/HttpUtils";

var storage = await Storage.Main();

await suite(
  "[storage/main] create file",
  func() : async () {
    await test(
      "create function - Create a file",
      func() : async () {
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
        let result = await storage.download("&id=540KscpW0'I,c)y.jpg");
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

await suite(
  "[storage/main] get file list",
  func() : async () {
    await test(
      "get function - Get list of files",
      func() : async () {
        let result = await storage.listFiles(10);
        switch (result) {
          case (#ok(u)) {
            assert u == ["&id=540KscpW0'I,c)y.jpg"];
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
        let request = {
          body = Blob.fromArray([1, 2, 3]);
          headers = [
            ("Content-Type", "image/jpg"),
            ("Access-Control-Allow-Origin", "*"),
          ];
          method = "GET";
          url = "&id=540KscpW0'I,c)y.jpg";
        };
        let result = await storage.http_request(request);
        let expectedResponse = {
          body = Blob.fromArray([1, 2, 3]);
          headers = [
            ("Content-Type", "image/jpg"),
            ("Access-Control-Allow-Origin", "*"),
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
