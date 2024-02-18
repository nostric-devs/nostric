import Array "mo:base/Array";
import CanDB "mo:candb/SingleCanisterCanDB";
import Entity "mo:candb/Entity";
import EncodingUtils "EncodingUtils";

import CommonTypes "CommonTypes";

module {
  public func create(file : CommonTypes.File, db : CanDB.DB) : async () {
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

  public func get(owner : Text, name : Text, db : CanDB.DB) : ?CommonTypes.File {
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

  public func update(
    {
      pk : Entity.PK;
      sk : Entity.SK;
      attributesToUpdate : [(Entity.AttributeKey, Entity.AttributeValue)];
    },
    db : CanDB.DB,
  ) : async ?CommonTypes.File {
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

  public func remove(options : CanDB.RemoveOptions, db : CanDB.DB) : async ?CommonTypes.File {
    switch (CanDB.remove(db, options)) {
      case null { null };
      case (?entity) { unwrapFile(entity) };
    };
  };

  public func scan(options : CanDB.ScanOptions, db : CanDB.DB) : async ?[Text] {
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

  private func unwrapFile(entity : Entity.Entity) : ?CommonTypes.File {
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
      ) { ?(EncodingUtils.encode(owner # "/" # name) # extension) };
      case _ { null };
    };
  };
};
