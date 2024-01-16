import { test; suite } "mo:test";
import Text "mo:base/Text";
import Blob "mo:base/Blob";
import HttpUtils "../../../src/storage/utils/HttpUtils";

suite("[storage/utils/HttpUtils] httpImgResponse", func() {
  test("should return valid image response", func() {
    let pic = Blob.fromArray([0x89, 0x50, 0x4E, 0x47]);
    let response = HttpUtils.httpImgResponse(pic);

    assert response.body == pic;
    assert response.headers == [("Content-Type", "image/jpg"), ("Access-Control-Allow-Origin", "*")];
    assert response.status_code == 200;
    assert response.streaming_strategy == null;
  });
});


suite("[storage/utils/HttpUtils] httpNotFoundResponse", func() {
  test("should return default not found response", func() {
    let response = HttpUtils.httpNotFoundResponse(null);

    assert Text.decodeUtf8(response.body) == ?"Not found.";
    assert response.headers == [("Content-Type", "text/plain")];
    assert response.status_code == 404;
    assert response.streaming_strategy == null;
  });

  test("[storage/utils/HttpUtils] should return custom not found response", func() {
    let customMessage = "Custom not found message.";
    let response = HttpUtils.httpNotFoundResponse(?customMessage);

    assert Text.decodeUtf8(response.body) == customMessage;
    assert response.headers == [("Content-Type", "text/plain")];
    assert response.status_code == 404;
    assert response.streaming_strategy == null;
  });
});
