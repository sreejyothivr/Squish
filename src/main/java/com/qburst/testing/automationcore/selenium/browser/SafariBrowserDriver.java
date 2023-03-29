package com.qburst.testing.automationcore.selenium.browser;

import com.qburst.testing.automationcore.Constants;
import com.qburst.testing.automationcore.FrameworkException;
import com.qburst.testing.automationcore.utils.TestLog;
import io.github.bonigarcia.wdm.WebDriverManager;
import org.openqa.selenium.safari.SafariDriver;
import org.openqa.selenium.safari.SafariOptions;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.time.Duration;

public class SafariBrowserDriver extends BrowserDriver{

    @Override
    public synchronized void open() {
        TestLog.log().info("Opening chrome browser");
        SafariOptions safariOptions = new SafariOptions();
        if (Constants.TEST_TRIGGER.equalsIgnoreCase("jenkins")){
            throw new FrameworkException("Framework does not currently support Safari Browser from jenkins");
        }
        WebDriverManager.safaridriver().setup();
        driver = new SafariDriver(safariOptions);
        wait = new WebDriverWait(driver, Duration.ofMillis(Constants.DEFAULT_WAIT_TIMEOUT));
        driver.manage().window().maximize();
        driver.manage().deleteAllCookies();
    }
}
