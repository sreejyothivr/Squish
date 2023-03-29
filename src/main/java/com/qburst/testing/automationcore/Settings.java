package com.qburst.testing.automationcore;

import com.qburst.testing.automationcore.selenium.ParentDriver;
import com.qburst.testing.automationcore.selenium.browser.ChromeBrowserDriver;
import com.qburst.testing.automationcore.selenium.browser.FirefoxBrowserDriver;
import com.qburst.testing.automationcore.selenium.browser.SafariBrowserDriver;
import com.qburst.testing.automationcore.selenium.mobile.AppiumParams;
import com.qburst.testing.automationcore.selenium.mobile.MobileDriver;
import com.qburst.testing.automationcore.selenium.mobile.android.driver.AndroidMobileDriver;
import com.qburst.testing.automationcore.selenium.mobile.android.driver.AndroidMobileWebDriver;
import com.qburst.testing.automationcore.selenium.mobile.appiumserverbuilder.AppiumServerBuilder;
import com.qburst.testing.automationcore.selenium.mobile.ios.iosMobileWebDriver;
import com.qburst.testing.automationcore.selenium.mobile.platforms.PlatformType;

public class Settings {

    private static ThreadLocal<AppiumServerBuilder> appiumServer = new ThreadLocal<>();


    private AppiumServerBuilder getAppiumServer() {
        return appiumServer.get();
    }

    /**
     * set the AppiumServer instance local to the thread
     * @param argAppiumServer : Appium Server Instance
     */
    private void setAppiumServer(AppiumServerBuilder argAppiumServer) {
        appiumServer.set(argAppiumServer);
    }

    /**
     * Start the appium server in the given port
     */
    public void startAppiumServer(int portNumber) {
        setAppiumServer(new AppiumServerBuilder());
        try {
            getAppiumServer().stop();
            getAppiumServer().start(AppiumParams.getPlatformName(), portNumber);
        } catch (Exception e) {
            //getAppiumServer().stop();
            //throw new FrameworkException("Could not start Appium Server", e);
        }
    }

    /**
     * Unload the thread safe variable
     */
    public void unload() {
        appiumServer.remove();
    }

    /**
     * Stop the appium server
     */
    public void stopAppiumServer() {
        if (getAppiumServer() != null)
            getAppiumServer().stop();
    }


    /**
     * Creates driver instance based on the type of the app under test
     * @param appType  : type of the app
     * @param platform : device platform
     * @param browser : browser for web test
     * @return
     */
    public ParentDriver createNewDriverInstance(String appType, String platform, String browser) {
        ParentDriver driverInsatnce = null;
        switch (appType) {
            case "mobile.web":
                return createNewMobileWebDriverInstance(platform, browser);
            case "mobile.native":
                //implementation pending
                break;
            case "web":
                return createNewWebDriverInstance(browser);
            case "api":
                //implementation pending
                break;
            default:
                throw new FrameworkException(String.format("App type not supported by framework. App Type: %s", appType));

        }
        return driverInsatnce;
    }

    /**
     * @param browser create a web driver instance for given browser
     * @return
     */
    private ParentDriver createNewWebDriverInstance(String browser) {
        switch (browser.toLowerCase()) {
            case "chrome":
                return new ChromeBrowserDriver();
            case "firefox":
                return new FirefoxBrowserDriver();
            case "safari":
                return new SafariBrowserDriver();
            default:
                throw new FrameworkException(String.format("Supported Browsers: Chrome, Firefox. Browser is currently not supported by framework. Browser: %s", browser));

        }
    }

    /**
     * Create a web driver instance for mobile device
     * @param platform : device platform
     * @param browser : browser name
     * @return
     */
    public MobileDriver createNewMobileWebDriverInstance(String platform, String browser) {
        if (platform.equalsIgnoreCase(PlatformType.ANDROID.getArgument()) )
            return new AndroidMobileWebDriver();
        else if (platform.equalsIgnoreCase(PlatformType.IOS.getArgument()))
            return new iosMobileWebDriver();
        else throw new FrameworkException(String.format("Platform not supported by framework. Platform Type Type: %s", platform));

    }

    public MobileDriver createNewMobileDriverInstance(String platform) {
        if (platform.equalsIgnoreCase(PlatformType.ANDROID.getArgument()))
            return new AndroidMobileDriver();
        else if (platform.equalsIgnoreCase(PlatformType.IOS.getArgument()))
            return null; //TODO: Impliment iOS driver
        else throw new FrameworkException(String.format("Platform not supported by framework. App Type: %s", platform));

    }
}
