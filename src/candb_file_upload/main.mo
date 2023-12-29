import Array "mo:base/Array";
import CanDB "mo:candb/SingleCanisterCanDB";
import Entity "mo:candb/Entity";

actor {
    // initializes an instance of CanDB - yes, that's all you need!
    stable let db = CanDB.init();

    type File = {
       name: Text;
       content: Blob;
    };

    public func create(file: File) : async () {
        CanDB.put(db, {
            pk = "test";
            sk = file.name;
            attributes = [
                ("name", #text(file.name)),
                ("content", #blob(file.content))
            ]
        });
     ()
    };

    public query func get(name: Text): async ?File {
        let fileData = switch(CanDB.get(db, { pk= "test"; sk = name }))  {
            case null { null };
            case (?fileEntity) { unwrapFile(fileEntity)};
        };

        switch(fileData) {
            case(?u) ? { name = u.name; content = u.content };
            case null { null };
        };

    };

    public func update(
        { pk: Entity.PK;
          sk: Entity.SK;
          attributesToUpdate: [(Entity.AttributeKey, Entity.AttributeValue)];
        }
    ): async ?File {

      func updateAttributes(attributeMap: ?Entity.AttributeMap): Entity.AttributeMap {
        switch(attributeMap) {
            case null { Entity.createAttributeMapFromKVPairs(attributesToUpdate) };
            case (?map) { Entity.updateAttributeMapWithKVPairs(map, attributesToUpdate) }
        }
      };

        switch(CanDB.update(db, {
            pk = pk;
            sk = sk;
            updateAttributeMapFunction = updateAttributes;
        })) {
            case null { null };
            case (?entity) { unwrapFile(entity) }
        };
    };

    public func remove(options: CanDB.RemoveOptions): async ?File {
        switch(CanDB.remove(db, options)) {
            case null { null };
            case (?entity) { unwrapFile(entity) }
        }
    };

    public query func scan(options: CanDB.ScanOptions): async [?File] {

        let { entities; nextKey } = CanDB.scan(db, options);
            Array.map<Entity.Entity, ?File>(entities, func(entity): ?File {
                unwrapFile(entity);
            });
    };

    func unwrapFile(entity: Entity.Entity): ?File {

        let { sk; pk; attributes } = entity;
        let nameValue = Entity.getAttributeMapValueForKey(attributes, "name");
        let contentValue = Entity.getAttributeMapValueForKey(attributes, "content");

        switch(nameValue, contentValue) {
            case (
                ?(#text(name)),
                ?(#blob(content)),
            ) { ? { name; content; } };
            case _ { null };
        };
    };

    // just simple wrapper if you don't want to deal with Entity
    public func upload_wrapper(imgId : Text, value : Blob) : async () {
      await create({name = imgId; content = value});
    };

    // just simple wrapper if you don't want to deal with Entity
    public func download_wrapper(imgId : Text) : async Blob {
          let result = await get(imgId);
          switch(result) {
            case (?file) { file.content };
            case null { "\00" : Blob };
          };
    };
}
