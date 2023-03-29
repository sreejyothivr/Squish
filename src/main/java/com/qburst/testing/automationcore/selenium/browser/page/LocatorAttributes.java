package com.qburst.testing.automationcore.selenium.browser.page;

import com.fasterxml.jackson.annotation.JsonProperty;

public class LocatorAttributes {
    @JsonProperty("locator.type")
    public String locatorType;
    @JsonProperty("locator.value")
    public String locatorValue;
    @JsonProperty("locator.strategy")
    public String locatorStrategy;
}
