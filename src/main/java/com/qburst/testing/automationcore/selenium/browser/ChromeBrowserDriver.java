package com.qburst.testing.automationcore.selenium.browser;

import com.qburst.testing.automationcore.Constants;
import com.qburst.testing.automationcore.FrameworkException;
import com.qburst.testing.automationcore.utils.TestLog;
import io.github.bonigarcia.wdm.WebDriverManager;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeDriverLogLevel;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.remote.RemoteWebDriver;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.net.MalformedURLException;
import java.net.URL;
import java.time.Duration;

public class ChromeBrowserDriver extends BrowserDriver {

    private ChromeOptions chromeOptions;

    @Override
    public synchronized void open() {
        TestLog.log().info("Opening chrome browser");
        chromeOptions = new ChromeOptions();
        chromeOptions.addArguments("--start-maximized");
        chromeOptions.addArguments("--no-sandbox");
        chromeOptions.addArguments("--disable-dev-shm-usage");
        chromeOptions.addArguments("--remote-allow-origins=*");
        chromeOptions.setAcceptInsecureCerts(true);
        if (Constants.TEST_BROWSER_LOG.equalsIgnoreCase("true"))
            chromeOptions.setLogLevel(ChromeDriverLogLevel.ALL);
        if (Constants.TEST_TRIGGER.equalsIgnoreCase("jenkins")||
                Constants.TEST_HEADLESS.equalsIgnoreCase("true")){
            chromeOptions.addArguments("--headless"); //!!!should be enabled for Jenkins
            chromeOptions.addArguments("--disable-setuid-sandbox");
            chromeOptions.addArguments("--disable-gpu");
            chromeOptions.addArguments("--window-size=1920x1080"); //!!!should be enabled for Jenkins
        }

        if (Constants.TEST_MODE.equalsIgnoreCase("grid"))
            openChromeInGrid();
        else openStandAloneChrome();
        wait = new WebDriverWait(driver, Duration.ofMillis(Constants.DEFAULT_WAIT_TIMEOUT));
        driver.manage().deleteAllCookies();
    }

    private void openChromeInGrid() {
        TestLog.log().info("Opening browser in grid url: {}",Constants.TEST_GRID_URL);
        try {
            driver = new RemoteWebDriver(new URL(Constants.TEST_GRID_URL),chromeOptions);
        } catch (MalformedURLException e) {
            throw new FrameworkException(e);
        }
    }

    private void openStandAloneChrome() {
        WebDriverManager.chromedriver().setup();
        driver = new ChromeDriver(chromeOptions);
    }


}
