import Array "mo:base/Array";
import Iter "mo:base/Iter";
import Text "mo:base/Text";
import Blob "mo:base/Blob";
import Nat "mo:base/Nat";
import Char "mo:base/Char";
import Principal "mo:base/Principal";
import CanDB "mo:candb/SingleCanisterCanDB";
import Entity "mo:candb/Entity";
import HttpUtils "utils/HttpUtils";
import Debug "mo:base/Debug";

actor class Main() = this {
  stable let db = CanDB.init();

  type Request = HttpUtils.Request;
  type Response = HttpUtils.Response;

  type File = {
    owner : Text;
    name : Text;
    extension : Text;
    content : Blob;
  };

  public type FileUploadResult = {
    #ok : Text;
    #err : Text;
  };

  public type FileDownloadResult = {
    #ok : Blob;
    #err : Text;
  };

  public type FileListResult = {
    #ok : [Text];
    #err : Text;
  };

  let principalCharacterSet = "0123456789abcdefghijklmnopqrstuvwxyz/-";
  let urlCharacterSet = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz~-_.!*'(),$";

  public query func http_request(request : Request) : async Response {
    Debug.print("request: " # request.url);
    var result = handleDownload(request.url);
    switch (result) {
      case (null) {
        return HttpUtils.httpNotFoundResponse(?"no picture available");
      };
      case (?picture) {
        return HttpUtils.httpImgResponse(picture);
      };
    };
    return HttpUtils.httpNotFoundResponse(?"Path not found.");
  };

  public shared (msg) func upload(fileExtension : Text, content : Blob) : async FileUploadResult {
    let owner = Principal.toText(msg.caller);
    let fileCount = await currentFileCount(owner);
    let filename = Nat.toText(fileCount + 1);
    await create({
      owner = owner;
      name = filename;
      extension = fileExtension;
      content = content;
    });
    #ok("&id=" # encode(owner # "/" # filename) # fileExtension);
  };

  public shared (msg) func listFiles(limit : Nat) : async FileListResult {
    let owner = Principal.toText(msg.caller);
    let options = {
      pk = owner;
      skLowerBound = "00000000-0000-0000-0000-000000000000";
      skUpperBound = "ffffffff-ffff-ffff-ffff-ffffffffffff";
      limit = limit;
      ascending = ?true;
    };
    let results = await scan(options);
    switch (results) {
      case (?res) {
        #ok(res);
      };
      case null {
        #err("No files found");
      };
    };
  };

  public func download(inputPath : Text) : async FileDownloadResult {
    switch (handleDownload(inputPath)) {
      case (?file) {
        #ok(file);
      };
      case (null) {
        #err("File not found");
      };
    };
  };

  private func currentFileCount(owner : Text) : async Nat {
    let options = {
      pk = owner;
      skLowerBound = "00000000-0000-0000-0000-000000000000";
      skUpperBound = "ffffffff-ffff-ffff-ffff-ffffffffffff";
      limit = 100000;
      ascending = ?true;
    };
    let results = await scan(options);
    switch (results) {
      case (?res) {
        res.size();
      };
      case null {
        0;
      };
    };
  };

  private func extractAddress(address : Text) : Text {
    let params = Text.split(address, #char('&'));
    var fileId = "";

    for (param in params) {
      let keyValue = Iter.toArray(Text.split(param, #char('=')));
      if (Text.startsWith(param, #text "id=")) {
        fileId := keyValue[1];
      };
    };
    let filePathSplit = Iter.toArray(Text.split(fileId, #char '.'));
    return decode(filePathSplit[0]);
  };

  private func handleDownload(inputPath : Text) : ?Blob {
    let filePath = extractAddress(inputPath);
    let filePathSplit = Iter.toArray(Text.split(filePath, #char '/'));
    let owner = filePathSplit[0];
    let name = filePathSplit[1];
    let result = get(owner, name);
    switch (result) {
      case (?file) {
        ?file.content;
      };
      case (null) {
        null;
      };
    };
  };

  private func create(file : File) : async () {
    CanDB.put(
      db,
      {
        pk = file.owner;
        sk = file.name;
        attributes = [
          ("owner", #text(file.owner)),
          ("name", #text(file.name)),
          ("extension", #text(file.extension)),
          ("content", #blob(file.content)),
        ];
      },
    );
    ();
  };

  private func get(owner : Text, name : Text) : ?File {
    let fileData = switch (CanDB.get(db, { pk = owner; sk = name })) {
      case null { null };
      case (?fileEntity) { unwrapFile(fileEntity) };
    };

    switch (fileData) {
      case (?u) ?{
        owner = u.owner;
        name = u.name;
        extension = u.extension;
        content = u.content;
      };
      case null { null };
    };

  };

  private func update(
    {
      pk : Entity.PK;
      sk : Entity.SK;
      attributesToUpdate : [(Entity.AttributeKey, Entity.AttributeValue)];
    }
  ) : async ?File {
    func updateAttributes(attributeMap : ?Entity.AttributeMap) : Entity.AttributeMap {
      switch (attributeMap) {
        case null { Entity.createAttributeMapFromKVPairs(attributesToUpdate) };
        case (?map) {
          Entity.updateAttributeMapWithKVPairs(map, attributesToUpdate);
        };
      };
    };

    switch (
      CanDB.update(
        db,
        {
          pk = pk;
          sk = sk;
          updateAttributeMapFunction = updateAttributes;
        },
      )
    ) {
      case null { null };
      case (?entity) { unwrapFile(entity) };
    };
  };

  private func remove(options : CanDB.RemoveOptions) : async ?File {
    switch (CanDB.remove(db, options)) {
      case null { null };
      case (?entity) { unwrapFile(entity) };
    };
  };

  private func scan(options : CanDB.ScanOptions) : async ?[Text] {
    let { entities; nextKey } = CanDB.scan(db, options);
    let mappedEntities = Array.map<Entity.Entity, Text>(
      entities,
      func(entity) : Text {
        switch (unwrapFileMetadata(entity)) {
          case null { "" };
          case (?res) { res };
        };
      },
    );

    if (Array.size(mappedEntities) == 0) {
      return null;
    } else {
      return ?mappedEntities;
    };
  };

  private func unwrapFile(entity : Entity.Entity) : ?File {
    let { sk; pk; attributes } = entity;
    let ownerValue = Entity.getAttributeMapValueForKey(attributes, "owner");
    let nameValue = Entity.getAttributeMapValueForKey(attributes, "name");
    let extensionValue = Entity.getAttributeMapValueForKey(attributes, "extension");
    let contentValue = Entity.getAttributeMapValueForKey(attributes, "content");

    switch (ownerValue, nameValue, extensionValue, contentValue) {
      case (
        ?(#text(owner)),
        ?(#text(name)),
        ?(#text(extension)),
        ?(#blob(content)),
      ) { ?{ owner; name; extension; content } };
      case _ { null };
    };
  };

  private func unwrapFileMetadata(entity : Entity.Entity) : ?Text {
    let { sk; pk; attributes } = entity;
    let nameValue = Entity.getAttributeMapValueForKey(attributes, "name");
    let extensionValue = Entity.getAttributeMapValueForKey(attributes, "extension");
    let ownerValue = Entity.getAttributeMapValueForKey(attributes, "owner");

    switch (ownerValue, nameValue, extensionValue) {
      case (
        ?(#text(owner)),
        ?(#text(name)),
        ?(#text(extension)),
      ) { ?("&id=" # encode(owner # "/" # name) # extension) };
      case _ { null };
    };
  };

  func encode(input : Text) : Text {
    return convBase(input, principalCharacterSet, urlCharacterSet);
  };

  func decode(input : Text) : Text {
    return convBase(input, urlCharacterSet, principalCharacterSet);
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
