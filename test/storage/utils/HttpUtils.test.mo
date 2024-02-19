import { test; suite } "mo:test";
import Text "mo:base/Text";
import Blob "mo:base/Blob";
import HttpUtils "../../../src/storage/utils/HttpUtils";
import CertTree "mo:ic-certification/CertTree";
import Debug "mo:base/Debug";

suite(
  "[storage/utils/HttpUtils] httpImgResponse",
  func() {
    test(
      "should return valid image response",
      func() {
        let cert_store : CertTree.Store = CertTree.newStore();
        let ct = CertTree.Ops(cert_store);
        let pic = Blob.fromArray([0x89, 0x50, 0x4E, 0x47]);
        let response = HttpUtils.httpImgResponse(pic, "/test.jpg", ct);

        assert response.body == pic;
        assert response.headers == [("Content-Type", "image/jpeg"), ("Access-Control-Allow-Origin", "*"), ("X-HTTP-Fallback", "true")];
        assert response.status_code == 200;
        assert response.streaming_strategy == null;
      },
    );
  },
);

suite(
  "[storage/utils/HttpUtils] httpNotFoundResponse",
  func() {
    test(
      "should return default not found response",
      func() {
        let cert_store : CertTree.Store = CertTree.newStore();
        let ct = CertTree.Ops(cert_store);
        let response = HttpUtils.httpNotFoundResponse(null, "/not-found.jpg", ct);

        assert Text.decodeUtf8(response.body) == ?"Not found.";
        assert response.headers == [("Content-Type", "text/plain"), ("X-HTTP-Fallback", "true")];
        assert response.status_code == 404;
        assert response.streaming_strategy == null;
      },
    );

    test(
      "[storage/utils/HttpUtils] should return custom not found response",
      func() {
        let cert_store : CertTree.Store = CertTree.newStore();
        let ct = CertTree.Ops(cert_store);
        let customMessage = "Custom not found message.";
        let response = HttpUtils.httpNotFoundResponse(?customMessage, "/not-found.jpg", ct);

        assert Text.decodeUtf8(response.body) == customMessage;
        assert response.headers == [("Content-Type", "text/plain"), ("X-HTTP-Fallback", "true")];
        assert response.status_code == 404;
        assert response.streaming_strategy == null;
      },
    );
  },
);
