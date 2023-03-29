package com.qburst.testing.automationcore.selenium.browser.page;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.qburst.testing.automationcore.FrameworkException;
import com.qburst.testing.automationcore.utils.TestLog;

import java.util.List;

public class LocatorCollection {
    @JsonProperty("page.name")
    private String pageName;
    @JsonProperty("locators")
    private List<Locator> locators;

    public Locator getLocator(String locatorName){
        if (locators==null)
            throw new FrameworkException("Locator Initialization error.");
        for (Locator locator : locators) {
            if (locator.locatorName.equals(locatorName))
                return  locator;
        }
        TestLog.log().error("Could not find the locator {} in the locator file {}",locatorName,pageName);
        throw new FrameworkException(String.format("Could not find the locator %s in the locator file %s",locatorName,pageName));
    }
}
