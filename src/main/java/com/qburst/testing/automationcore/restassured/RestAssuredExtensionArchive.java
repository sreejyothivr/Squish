package com.qburst.testing.automationcore.restassured;

import com.qburst.testing.automationcore.utils.TestLog;
import io.restassured.RestAssured;
import io.restassured.builder.RequestSpecBuilder;
import io.restassured.http.ContentType;
import io.restassured.http.Header;
import io.restassured.response.Response;
import io.restassured.response.ResponseOptions;
import io.restassured.specification.RequestSpecification;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.Map;

public class RestAssuredExtensionArchive { //TODO: refactor this class based on the required structure
    private RequestSpecification request;
    private String baseURL;
    private enum ResourceType {URL, URI;}

    private enum RequestType {GET, POST, DELETE, PUT;}

    public RestAssuredExtensionArchive(String baseURL) {
        this.baseURL = baseURL;
        RequestSpecBuilder builder = new RequestSpecBuilder();
        builder.setBaseUri(baseURL);
        builder.setContentType(ContentType.JSON);
        RequestSpecification requestSpec = builder.build();
        request = RestAssured.given().spec(requestSpec);
    }

    public void setAuthorizationHeader(String access_token) {
        request.header(new Header("Authorization", String.format("Bearer %s", access_token)));
    }

    public ResponseOptions<Response> get(String resource) {
        return getResponse(resource, RequestType.GET);
    }

    public ResponseOptions<Response> getWithQueryParams(String resource, Map<String, String> params) {
        TestLog.log().info("Get operation with path parameter");
        request.pathParams(params);
        return getResponse(resource, RequestType.GET);
    }

    public ResponseOptions<Response> getWithQueryParams(String resource, String key, String value) {
        TestLog.log().info("Get operation with query parameter");
        request.queryParams(key, value);
        return getResponse(resource, RequestType.GET);
    }

    public ResponseOptions<Response> getWithPathParams(String resource, Map<String, String> path) {
        TestLog.log().info("Get operation with path parameter");
        request.pathParams(path);
        return getResponse(resource, RequestType.GET);
    }

    public ResponseOptions<Response> postWithBodyParams(String resource, Map<String, String> body) {
        request.body(body);
        return getResponse(resource, RequestType.POST);
    }

    public ResponseOptions<Response> postWithPathAndBodyParams(String resource, Map<String, String> pathParams, Map<String, String> bodyParams) {
        request.pathParams(pathParams);
        request.body(bodyParams);
        return getResponse(resource, RequestType.POST);
    }

    public ResponseOptions<Response> putWithPathAndBodyParams(String resource, Map<String, String> pathParams, Map<String, String> bodyParams) {
        request.pathParams(pathParams);
        request.body(bodyParams);
        return getResponse(resource, RequestType.PUT);
    }

    public ResponseOptions<Response> deleteWithPathParams(String resource, Map<String, String> path) {
        TestLog.log().info("Delete operation with path parameter");
        request.pathParams(path);
        return getResponse(resource, RequestType.DELETE);
    }

    public ResponseOptions<Response> deleteWithQueryParams(String resource, String key, String value) {
        TestLog.log().info("Delete operation with query parameter");
        request.queryParams(key, value);
        return getResponse(resource, RequestType.DELETE);
    }

    private ResponseOptions<Response> getResponse(String resource, RequestType requestType) {
        return performRequestWithURL(resource, requestType);
    }

    private ResponseOptions<Response> getResponse(String resource, RequestType requestType, ResourceType resourceType) {
        if (resourceType.equals(ResourceType.URI)) {
            return performRequestWithURI(resource, requestType);
        } else return performRequestWithURL(resource, requestType);
    }

    private ResponseOptions<Response> performRequestWithURI(String resource, RequestType requestType) {
        try {
            switch (requestType) {
                case GET:
                    return request.get(new URI(resource));
                case POST:
                    return request.post(new URI(resource));
                case DELETE:
                    return request.delete(new URI(resource));
            }
        }catch (URISyntaxException e) {
            throw new RuntimeException(e);
        }
        return null;
    }

    private ResponseOptions<Response> performRequestWithURL(String resource, RequestType requestType) {

            switch (requestType) {
                case GET:
                    return request.get(resource);
                case POST:
                    return request.post(resource);
                case DELETE:
                    return request.delete(resource);
                case PUT:
                    return request.put(resource);
            }
            return null; //TODO : throw exception as default
    }

}
