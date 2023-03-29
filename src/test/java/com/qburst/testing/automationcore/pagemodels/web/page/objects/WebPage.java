package com.qburst.testing.automationcore.pagemodels.web.page.objects;

import com.qburst.testing.automationcore.pagemodels.web.page.BasePage;
import com.qburst.testing.automationcore.selenium.ParentDriver;

/**
 * The page elements are maintained here
 */
public class WebPage extends BasePage {

    public WebPage(ParentDriver driver) {
        super(driver);
        setLocatorCollection();
    }
}
