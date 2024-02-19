import Text "mo:base/Text";
import Blob "mo:base/Blob";

module {
  public type File = {
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

  public type FileDeleteResult = {
    #ok;
    #err : Text;
  };

  public type FileListResult = {
    #ok : [Text];
    #err : Text;
  };
};
