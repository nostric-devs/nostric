import Array "mo:base/Array";
import Iter "mo:base/Iter";
import Text "mo:base/Text";
import Principal "mo:base/Principal";
import CanDB "mo:candb/SingleCanisterCanDB";
import Entity "mo:candb/Entity";
import UUID "mo:uuid/UUID";
import Source "mo:uuid/async/SourceV4";

shared (msg) actor class Main() = this {
  // initializes an instance of CanDB - yes, that's all you need!
  stable let db = CanDB.init();
  let g = Source.Source();

  type File = {
    owner : Text;
    name : Text;
    content : Blob;
  };

  public type FileUploadResult = {
    #ok: Text;
    #err: Text;
  };

  public type FileDownloadResult = {
      #ok: Blob;
      #err: Text;
   };


  public func upload(fileExtension : Text, content : Blob) : async FileUploadResult {
    let filename = UUID.toText(await g.new()) # fileExtension;
    let owner = Principal.toText(msg.caller);
    await create({ owner = owner; name = filename; content = content });
    #ok(owner # "/" # filename)
  };

  public func download(filePath : Text) : async FileDownloadResult {
    let filePathSplit = Iter.toArray(Text.split(filePath, #char '/'));
    let owner = filePathSplit[0];
    let name = filePathSplit[1];
    let result = await get(owner, name);
    switch (result) {
      case (?file) {
        #ok(file.content)
      };
      case null {
        #err("File not found")
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

  private query func get(owner: Text, name : Text) : async ?File {
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

  private query func scan(options : CanDB.ScanOptions) : async [?File] {

    let { entities; nextKey } = CanDB.scan(db, options);
    Array.map<Entity.Entity, ?File>(
      entities,
      func(entity) : ?File {
        unwrapFile(entity);
      },
    );
  };

  func unwrapFile(entity : Entity.Entity) : ?File {

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
};
