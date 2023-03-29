package com.qburst.testing.automationcore.restassured;


import io.restassured.response.Response;
import io.restassured.response.ResponseOptions;

public final class ResponseUtils {

    private ResponseUtils() {
    }

    public static boolean isJSONArray(ResponseOptions<Response> response){
        return response.getBody().jsonPath().prettyPrint().startsWith("[");
    }
}
