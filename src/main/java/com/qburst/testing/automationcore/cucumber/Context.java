package com.qburst.testing.automationcore.cucumber;

import com.qburst.testing.automationcore.selenium.ParentDriver;
import com.qburst.testing.automationcore.restassured.RestAssuredExtensionArchive;

public class Context {

    private ParentDriver driver;
    private RestAssuredExtensionArchive apiRequest;
    private String baseURL;
    private String token;

    public ParentDriver getDriver() {
        return driver;
    }

    public void setDriver(ParentDriver driver) {
        this.driver = driver;
    }

    public RestAssuredExtensionArchive getApiRequest() {
        return apiRequest;
    }

    public void setApiRequest(RestAssuredExtensionArchive apiRequest) {
        this.apiRequest = apiRequest;
    }

    public void setBaseUrl(String baseURL) {
        this.baseURL = baseURL;
    }

    public String getBaseURL(){
        return this.baseURL;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }
}
