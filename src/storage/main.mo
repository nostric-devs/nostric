import Array "mo:base/Array";
import Iter "mo:base/Iter";
import Text "mo:base/Text";
import Blob "mo:base/Blob";
import Nat "mo:base/Nat";
import Int "mo:base/Int";
import Principal "mo:base/Principal";
import SHA256 "mo:sha2/Sha256";
import CanDB "mo:candb/SingleCanisterCanDB";
import Entity "mo:candb/Entity";
import CertTree "mo:ic-certification/CertTree";

import EncodingUtils "utils/EncodingUtils";
import HttpUtils "utils/HttpUtils";
import CanDbUtils "utils/CanDbUtils";

import CommonTypes "utils/CommonTypes";

actor class Main() = this {
  stable let db : CanDB.DB = CanDB.init();

  type Request = HttpUtils.Request;
  type Response = HttpUtils.Response;

  stable let cert_store : CertTree.Store = CertTree.newStore();
  let ct = CertTree.Ops(cert_store);

  var testMode : Bool = false;

  system func postupgrade() {
    if (ct.lookup(["http_assets", Text.encodeUtf8("/.well-known/ic-domains")]) == null) {
      ct.put(["http_assets", Text.encodeUtf8("/.well-known/ic-domains")], SHA256.fromBlob(#sha256, Text.encodeUtf8("img.nostric.app\nimg.dev.nostric.app")));
      ct.setCertifiedData();
    };
    if (ct.lookup(["http_assets", Text.encodeUtf8("/favicon.ico")]) == null) {
      ct.put(["http_assets", Text.encodeUtf8("/favicon.ico")], SHA256.fromBlob(#sha256, HttpUtils.getFavicon()));
      ct.setCertifiedData();
    };
  };

  public func setUnitTestMode(mode : Bool) : () {
    testMode := mode;
  };

  public func isUnitTestMode() : async Bool {
    return testMode;
  };

  public query func http_request(request : Request) : async Response {
    let parsedUrl = Iter.toArray(Text.split(request.url, #char '?'))[0];
    if (parsedUrl == "/.well-known/ic-domains") {
      return HttpUtils.httpIcDomainsResponse(request.url, ct);
    };
    if (parsedUrl == "/favicon.ico") {
      return HttpUtils.httpImgResponse(HttpUtils.getFavicon(), request.url, ct);
    };
    var result = handleDownload(request.url);
    switch (result) {
      case (null) {
        return HttpUtils.httpNotFoundResponse(?"no picture available", request.url, ct);
      };
      case (?picture) {
        return HttpUtils.httpImgResponse(picture, request.url, ct);
      };
    };
    return HttpUtils.httpNotFoundResponse(?"Path not found.", request.url, ct);
  };

  public shared (msg) func upload(fileExtension : Text, content : Blob) : async CommonTypes.FileUploadResult {
    let owner = Principal.toText(msg.caller);
    let fileCount = await currentFileCount(owner);
    let filename = generateFileName(fileCount +1);
    await CanDbUtils.create(
      {
        owner = owner;
        name = filename;
        extension = fileExtension;
        content = content;
      },
      db,
    );
    let expectedAddress = EncodingUtils.encode(owner # "/" # filename) # fileExtension;
    let actualAddress = await searchFiles(owner, 1);
    switch (actualAddress) {
      case (?address) {
        if (address[0] == expectedAddress) {
          if (testMode == false) {
            ct.put(["http_assets", Text.encodeUtf8("/" # address[0])], SHA256.fromBlob(#sha256, content));
            ct.setCertifiedData();
          };
          #ok(address[0]);
        } else {
          #err("File upload failed");
        };
      };
      case (null) {
        #err("File upload failed");
      };
    };
  };

  public shared (msg) func listFiles(limit : Nat) : async CommonTypes.FileListResult {
    let owner = Principal.toText(msg.caller);
    let results = await searchFiles(owner, limit);
    switch (results) {
      case (?res) {
        #ok(res);
      };
      case null {
        #ok([]);
      };
    };
  };

  public func download(inputPath : Text) : async CommonTypes.FileDownloadResult {
    switch (handleDownload(inputPath)) {
      case (?file) {
        #ok(file);
      };
      case (null) {
        #err("File not found");
      };
    };
  };

  public func delete(inputPath : Text) : async CommonTypes.FileDeleteResult {
    let filePath = decodeFileNameFromUrl(inputPath);
    let filePathSplit = Iter.toArray(Text.split(filePath, #char '/'));
    if (Array.size(filePathSplit) != 2) {
      return #err("Invalid file path");
    };
    let owner = filePathSplit[0];
    let name = filePathSplit[1];
    switch (await CanDbUtils.remove({ pk = owner; sk = name }, db)) {
      case (?file) {
        if (testMode == false) {
          ct.delete(["http_assets", Text.encodeUtf8("/" # inputPath)]);
          ct.setCertifiedData();
        };
        #ok();
      };
      case (null) {
        #err("File not found");
      };
    };
  };

  private func handleDownload(inputPath : Text) : ?Blob {
    let filePath = decodeFileNameFromUrl(inputPath);
    let filePathSplit = Iter.toArray(Text.split(filePath, #char '/'));
    if (Array.size(filePathSplit) != 2) {
      return null;
    };
    let owner = filePathSplit[0];
    let name = filePathSplit[1];
    let result = CanDbUtils.get(owner, name, db);
    switch (result) {
      case (?file) {
        ?file.content;
      };
      case (null) {
        null;
      };
    };
  };

  private func repeatString(count : Nat) : Text {
    var result = "";
    for (i in Iter.range(0, count)) {
      result := "0" # result;
    };
    return result;
  };

  private func generateFileName(index : Nat) : Text {
    // Calculate the number of digits needed
    let numZeros = 3; // 1000 * 37 chars = 37000 possible filenames
    let numDigits = numZeros + 1;

    // Convert the index to text
    let indexText = EncodingUtils.encodeFileName(Nat.toText(index));

    // Add leading zeros
    let countedDigits : Int = numZeros - Text.size(indexText);
    let zerosNeeded = Int.abs((countedDigits + numDigits) % numDigits);
    let leadingZeros = repeatString(zerosNeeded);

    // Return the formatted filename
    return leadingZeros # indexText;
  };

  private func currentFileCount(owner : Text) : async Nat {
    let results = await searchFiles(owner, 1);
    switch (results) {
      case (?res) {
        let decodedAddress = decodeFileNameFromUrl(res[0]);
        let fileMetadata = Iter.toArray(Text.split(decodedAddress, #char '/'));
        if (Array.size(fileMetadata) != 2) {
          return 0;
        };
        let fileCount = fileMetadata[1];
        getFilenameIndex(fileCount);
      };
      case null {
        0;
      };
    };
  };

  private func decodeFileNameFromUrl(fileName : Text) : Text {
    let filePathSplit = Iter.toArray(Text.split(fileName, #char '.'));
    if (Array.size(filePathSplit) != 2) {
      return "";
    };
    return EncodingUtils.decode(filePathSplit[0]);
  };

  func getFilenameIndex(numericString : Text) : Nat {
    let strippedText = Text.trimStart(numericString, #char '0');
    let decodedFileName = EncodingUtils.decodeFileName(strippedText);
    switch (Nat.fromText(decodedFileName)) {
      case (?count) {
        count;
      };
      case null {
        0;
      };
    };
  };

  private func searchFiles(owner : Text, limit : Nat) : async ?[Text] {
    let options = {
      pk = owner;
      skLowerBound = "0000";
      skUpperBound = "~~~~";
      limit = limit;
      ascending = ?false;
    };
    return await CanDbUtils.scan(options, db);
  };
};
