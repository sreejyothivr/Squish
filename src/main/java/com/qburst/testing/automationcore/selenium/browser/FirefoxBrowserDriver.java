package com.qburst.testing.automationcore.selenium.browser;

import com.qburst.testing.automationcore.Constants;
import com.qburst.testing.automationcore.FrameworkException;
import com.qburst.testing.automationcore.utils.TestLog;
import io.github.bonigarcia.wdm.WebDriverManager;
import org.openqa.selenium.firefox.FirefoxDriver;
import org.openqa.selenium.firefox.FirefoxDriverLogLevel;
import org.openqa.selenium.firefox.FirefoxOptions;
import org.openqa.selenium.remote.RemoteWebDriver;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.net.MalformedURLException;
import java.net.URL;
import java.time.Duration;

public class FirefoxBrowserDriver extends BrowserDriver {
    FirefoxOptions firefoxOptions;


    @Override
    public synchronized void open() {
        TestLog.log().info("Opening firefox browser");
        firefoxOptions = new FirefoxOptions();
        if (Constants.TEST_BROWSER_LOG.equalsIgnoreCase("true"))
            firefoxOptions.setLogLevel(FirefoxDriverLogLevel.TRACE);
        if (Constants.TEST_TRIGGER.equalsIgnoreCase("jenkins")||
                Constants.TEST_HEADLESS.equalsIgnoreCase("true")){
            firefoxOptions.setHeadless(true);
            firefoxOptions.addArguments("--window-size=1920x1080");
        }

        if (Constants.TEST_MODE.equalsIgnoreCase("grid"))
            openFirefoxInGrid();
        else openStandAloneFirefox();
        driver.manage().window().maximize();
        wait = new WebDriverWait(driver, Duration.ofMillis(Constants.DEFAULT_WAIT_TIMEOUT));
        driver.manage().deleteAllCookies();
    }

    private void openFirefoxInGrid() {
        TestLog.log().info("Opening browser in grid url: {}",Constants.TEST_GRID_URL);
        try {
            driver = new RemoteWebDriver(new URL(Constants.TEST_GRID_URL), firefoxOptions);
        } catch (MalformedURLException e) {
            throw new FrameworkException(e);
        }
    }

    private void openStandAloneFirefox() {
        WebDriverManager.firefoxdriver().setup();
        driver = new FirefoxDriver(firefoxOptions);
    }


}
