package com.qburst.testing.automationcore.restassured;

import com.qburst.testing.automationcore.utils.TestLog;
import io.restassured.RestAssured;
import io.restassured.builder.RequestSpecBuilder;
import io.restassured.http.ContentType;
import io.restassured.response.Response;
import io.restassured.response.ResponseOptions;
import io.restassured.specification.RequestSpecification;

import java.util.HashMap;
import java.util.Map;

public class RestAssuredExtension {


    public enum HTTPMethod {GET, POST, DELETE, PUT;}
    public enum Params {PATH, QUERY, BODY}

    private RequestSpecBuilder builder = new RequestSpecBuilder();
    private String url;
    private HTTPMethod method;
    private ContentType contentType;

    public RestAssuredExtension(String url, HTTPMethod method, String token) {
        this.url = url;
        this.method = method;

        if (token != null)
            builder.addHeader("Authorization", String.format("Bearer %s", token));
    }

    public ResponseOptions<Response> execute() { //TODO: refactor this method to private
        RequestSpecification requestSpecification = builder.build();
        RequestSpecification request = RestAssured.given();
        request.contentType(ContentType.JSON);
        request.spec(requestSpecification);
        switch (this.method) {
            case GET:
                return request.get(this.url);
            case POST:
                return request.post(this.url);
            case DELETE:
                return request.delete(this.url);
            case PUT:
                return request.put(this.url);
        }
        return null;
    }



    public String authenticate(Object body) {
        builder.setBody(body);
        return execute().getBody().jsonPath().get("access_token");
    }

    public ResponseOptions<Response> execute(Map<String,String> params, Params paramType){
        setparams(params,paramType);
        return execute();
    }

    public ResponseOptions<Response> executeWithBodyParams(Object params){
        builder.setBody(params);
        return execute();
    }

    public ResponseOptions<Response> executeWithPathAndBodyParams(Map<String,String> pathParams, Map<String,String> bodyParams){
        setparams(pathParams,Params.PATH);
        setparams(bodyParams,Params.BODY);
        return execute();
    }

    /**
     * Execute the API request with Query/Path Parameters are being passed as Strings
     * @param paramkey
     * @param paramvalue
     * @return ResponseOptions<Response>
     */
    public ResponseOptions<Response> execute(String paramkey, String paramvalue, Params paramsType) {
        TestLog.log().info("API operation with query/path parameter");
        Map<String,String> params = new HashMap<>();
        params.put(paramkey,paramvalue);
        return execute(params,paramsType);
    }

    private void setparams(Map<String,String> params, Params paramType){
        switch (paramType){
            case PATH:
                builder.addPathParams(params);
                break;
            case QUERY:
                builder.addQueryParams(params);
                break;
            case BODY:
                builder.setBody(params);
                break;
        }
    }

}
