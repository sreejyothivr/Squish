package com.qburst.testing.automationcore.testng;

import com.qburst.testing.automationcore.Constants;
import com.qburst.testing.automationcore.FrameworkException;
import com.qburst.testing.automationcore.Params;
import com.qburst.testing.automationcore.Settings;
import com.qburst.testing.automationcore.selenium.ParentDriver;
import com.qburst.testing.automationcore.selenium.SeleniumParams;
import com.qburst.testing.automationcore.selenium.mobile.AppiumParams;
import com.qburst.testing.automationcore.utils.Config;
import com.qburst.testing.automationcore.utils.TestLog;
import io.appium.java_client.android.AndroidDriver;
import io.appium.java_client.service.local.AppiumDriverLocalService;
import org.testng.annotations.*;

public class BaseTest extends Settings {

    protected ParentDriver driver;

    /**
     * To perform the pre-requisites before starting the test suite execution
     *
     * @param appType       : type of the app under test(optional). Will proceed with default in case not passed from suite xml
     * @param platformName: device platform. Will proceed with default in case not passed from suite xml
     */
    @Parameters({"appType", "platformName"})
    @BeforeSuite(alwaysRun = true)
    public void beforeSuite(@Optional String appType, @Optional String platformName) {
        Config.initializaSystemTestConfig();
        Params.setAppType(appType);
        switch (Params.getAppType().toLowerCase()) {
            case "mobile.web":
            case "mobile.native":
                String[] portNumbers = Constants.APPIUM_PORT.split(":");
                AppiumParams.setPlatformName(platformName);
                for (String portNumberStr : portNumbers) {
                    int portNumber = Integer.parseInt(portNumberStr);
                    startAppiumServer(portNumber);
                }
                break;
            case "web":
            case "api":
                //do nothing
                break;
            default:
                throw new FrameworkException(String.format("App type not supported by framework. App Type: %s", Params.getAppType()));

        }

    }

    /**
     * To initialize the test parameters
     *
     * @param deviceName : device name for mobile test
     * @param browser:   browser name for web test
     */
    @Parameters({"deviceName", "browser"})
    @BeforeTest(alwaysRun = true)
    public void beforeTest(@Optional String deviceName, @Optional String browser) {

        switch (Params.getAppType().toLowerCase()) {
            case "mobile.web":
            case "mobile.native":
                SeleniumParams.setBrowser(browser);
                if (!Constants.TEST_APPIUM_TRIGGER.equalsIgnoreCase("device_farm")) {
                    AppiumParams.initDeviceParams(deviceName);
                    deviceName = AppiumParams.getDeviceName();
                }
                else deviceName = System.getenv("DEVICEFARM_DEVICE_NAME");
                TestLog.log().info("Device Name : {}", deviceName);
                break;
            case "web":
                SeleniumParams.setBrowser(browser);
                break;
            case "api":
                //TODO:implementation pending
                break;

        }
    }

    /**
     * To initialize the drivers and  before each method.
     */
    @BeforeMethod(alwaysRun = true)
    public void beforeMethod() {

        switch (Params.getAppType().toLowerCase()) {
            case "mobile.web":
            case "mobile.native":
            case "web":
                driver = createNewDriverInstance(Params.getAppType().toLowerCase()
                        , AppiumParams.getPlatformName(), SeleniumParams.getBrowser());
                driver.open();
                break;
            case "api":
                //TODO:implementation pending
                break;

        }
    }

    /**
     * Tear down the browser
     */
    @AfterMethod(alwaysRun = true)
    public void afterMethod() {
        driver.close();
    }

    /**
     * Tear down the appium server and unload the thread local variables
     */
    @AfterSuite(alwaysRun = true)
    public void tearDown() {
        stopAppiumServer();
        this.unload();
        SeleniumParams.unload();
        AppiumParams.unload();
    }


    /**
     * @return the driver instance
     */
    public ParentDriver getDriver() {
        return driver;
    }

}
