package com.qburst.testing.automationcore.selenium.browser.page;

import com.fasterxml.jackson.annotation.JsonProperty;

public class Locator {
    @JsonProperty("locator.name")
    public String locatorName;
    @JsonProperty("locator.attributes")
    public LocatorAttributes locatorAttributes;
}
