import Array "mo:base/Array";
import Iter "mo:base/Iter";
import Text "mo:base/Text";
import Principal "mo:base/Principal";
import CanDB "mo:candb/SingleCanisterCanDB";
import Entity "mo:candb/Entity";
import UUID "mo:uuid/UUID";
import Source "mo:uuid/async/SourceV4";
import HttpUtils "utils/HttpUtils";

actor class Main() = this {
  stable let db = CanDB.init();
  let g = Source.Source();

  type Request = HttpUtils.Request;
  type Response = HttpUtils.Response;

  type File = {
    owner : Text;
    name : Text;
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

  public shared (msg) func upload(fileExtension : Text, content : Blob) : async FileUploadResult {
    let filename = UUID.toText(await g.new()) # fileExtension;
    let owner = Principal.toText(msg.caller);
    await create({ owner = owner; name = filename; content = content });
    #ok(owner # "/" # filename);
  };

  public func download(request : Request) : async Response {
    var result = await downloadFile(request.url);
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

  public shared (msg) func listFiles(limit : Nat) : async FileListResult {
    let owner = Principal.toText(msg.caller);
    let options = {
      pk = owner;
      skLowerBound = "00000000-0000-0000-0000-000000000000.000";
      skUpperBound = "ffffffff-ffff-ffff-ffff-ffffffffffff.ZZZ";
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

  private func downloadFile(filePath : Text) : async ?Blob {
      let filePathSplit = Iter.toArray(Text.split(filePath, #char '/'));
      let owner = filePathSplit[0];
      let name = filePathSplit[1];
      let result = await get(owner, name);
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
          ("content", #blob(file.content)),
        ];
      },
    );
    ();
  };

  private func get(owner : Text, name : Text) : async ?File {
    let fileData = switch (CanDB.get(db, { pk = owner; sk = name })) {
      case null { null };
      case (?fileEntity) { unwrapFile(fileEntity) };
    };

    switch (fileData) {
      case (?u) ?{ owner = u.owner; name = u.name; content = u.content };
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
    let contentValue = Entity.getAttributeMapValueForKey(attributes, "content");

    switch (ownerValue, nameValue, contentValue) {
      case (
        ?(#text(owner)),
        ?(#text(name)),
        ?(#blob(content)),
      ) { ?{ owner; name; content } };
      case _ { null };
    };
  };

  private func unwrapFileMetadata(entity : Entity.Entity) : ?Text {
    let { sk; pk; attributes } = entity;
    let nameValue = Entity.getAttributeMapValueForKey(attributes, "name");
    let ownerValue = Entity.getAttributeMapValueForKey(attributes, "owner");

    switch (ownerValue, nameValue) {
      case (
        ?(#text(owner)),
        ?(#text(name)),
      ) { ?(owner # "/" # name) };
      case _ { null };
    };
  };
};
