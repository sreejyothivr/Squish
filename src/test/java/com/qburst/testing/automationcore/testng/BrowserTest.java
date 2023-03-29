package com.qburst.testing.automationcore.testng;

import com.qburst.testing.automationcore.pagemodels.web.page.objects.WebPage;
import com.qburst.testing.automationcore.utils.TestLog;
import org.testng.Assert;
import org.testng.annotations.Test;

public class BrowserTest extends BaseTest {

    @Test(testName = "Browser Test", description = "Verify the framework is able to open browser")
    public void vefifyBrowser() {

        WebPage webPage = new WebPage(driver);

        try {
            driver.navigate(webPage.getURL());
        }catch(Exception e){
            TestLog.log().error("Browser failed to launch and navigate to the url.",e);
            Assert.fail("Browser failed to launch and navigate to the url.");
        }

        //driver.staticWait(15000);

    }

}
