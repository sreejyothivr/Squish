package com.qburst.testing.automationcore.selenium.browser.page;

import com.qburst.testing.automationcore.FrameworkException;
import com.qburst.testing.automationcore.selenium.Element;
import com.qburst.testing.automationcore.selenium.ParentDriver;
import com.qburst.testing.automationcore.utils.JSON;
import com.qburst.testing.automationcore.utils.TestLog;
import org.openqa.selenium.By;

import java.io.File;

public class Page {
    protected ParentDriver driver;
    protected LocatorCollection locatorCollection;

    public Page(ParentDriver driver) {
        this.driver = driver;
    }

    protected void setLocatorCollection() {
        String locatorFile = System.getProperty("test.locator.path") + File.separator + this.getClass().getSimpleName().toLowerCase() + ".json";
        if (this.getClass().getResourceAsStream(locatorFile) == null) {
            TestLog.log().fatal("Failed to load locator file, please verify locator file against the class {}", this.getClass());
            throw new FrameworkException("Failed to load locator file, please verify locator file against the class");
        }
        locatorCollection = JSON.loadJSONAsObject(LocatorCollection.class, this.getClass().getResourceAsStream(locatorFile));
    }

    protected Element getElement(String element, String... formats) {
        Locator elementLocator = locatorCollection.getLocator(element);

        switch (elementLocator.locatorAttributes.locatorStrategy.toLowerCase()) {
            case "visible":
                return driver.findVisibleElement(getBy(elementLocator,formats));
            case "enabled":
                return driver.findPresentElement(getBy(elementLocator,formats));
            case "clickable":
                return driver.findClickableElement(getBy(elementLocator,formats));
            default:
                TestLog.log().warn("Locator Strategy {} not supported. Supported Strategies: visible, enabled, clickable. Element: {}",elementLocator.locatorAttributes.locatorStrategy, element);
                return driver.findElement(getBy(elementLocator));
        }

    }

    private By getBy(Locator elementLocator, String... formats) {
        String locatorValue = String.format(elementLocator.locatorAttributes.locatorValue,formats);
        if (elementLocator.locatorAttributes.locatorType.equalsIgnoreCase("xpath"))
            return By.xpath(locatorValue);
        else if (elementLocator.locatorAttributes.locatorType.equalsIgnoreCase("css"))
            return By.cssSelector(locatorValue);
        else if (elementLocator.locatorAttributes.locatorType.equalsIgnoreCase("id"))
            return By.id(locatorValue);
        else if (elementLocator.locatorAttributes.locatorType.equalsIgnoreCase("name"))
            return By.name(locatorValue);
        else {
            TestLog.log().error("Unsupported Locator Type : {}. Supported Locator Types are : xpath, css, id, name", elementLocator.locatorAttributes.locatorType);
            throw new FrameworkException("Unsupported Locator Type");
        }
    }


}
