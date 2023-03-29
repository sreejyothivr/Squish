package com.qburst.testing.automationcore.selenium.mobile.ios;

import com.qburst.testing.automationcore.Constants;
import com.qburst.testing.automationcore.FrameworkException;
import com.qburst.testing.automationcore.selenium.mobile.AppiumParams;
import com.qburst.testing.automationcore.selenium.mobile.MobileDriver;
import com.qburst.testing.automationcore.utils.TestLog;
import io.appium.java_client.ios.IOSDriver;
import io.appium.java_client.remote.MobileCapabilityType;
import io.appium.java_client.safari.options.SafariOptions;
import org.openqa.selenium.SessionNotCreatedException;
import org.openqa.selenium.remote.CapabilityType;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.net.URL;
import java.time.Duration;

public class iosMobileWebDriver extends MobileDriver {
    @Override
    public void open() {
        TestLog.log().info("Opening safari browser on the device");
        DesiredCapabilities cap = setiOSDeviceCapabilities();
        cap.setCapability(MobileCapabilityType.BROWSER_NAME, "Safari");
        cap.setCapability(SafariOptions.ACCEPT_INSECURE_CERTS_OPTION,true);
        cap.setCapability("safariAllowInvalidCertificates", true);
//        SafariOptions safariOptions = new SafariOptions();
//        safariOptions.setAcceptInsecureCerts(true);
        initDriver(cap);
    }

    private DesiredCapabilities setiOSDeviceCapabilities() {
        DesiredCapabilities cap = new DesiredCapabilities();
        cap.setCapability(CapabilityType.PLATFORM_NAME, AppiumParams.getPlatformName());
        cap.setCapability(MobileCapabilityType.DEVICE_NAME, AppiumParams.getDeviceName());
        cap.setCapability(MobileCapabilityType.AUTOMATION_NAME, AppiumParams.getAutomationName());
        cap.setCapability(MobileCapabilityType.UDID, AppiumParams.getUdid());
        cap.setCapability("newCommandTimeout", Constants.APPIUM_COMMAND_TIMEOUT);
        cap.setCapability("usePrebuiltWDA", false);
        cap.setCapability("wdaLaunchTimeout", "60000");
        cap.setCapability(MobileCapabilityType.PLATFORM_VERSION,AppiumParams.getPlatformVersion());
        return cap;
    }

    protected void initDriver(DesiredCapabilities cap) {
        URL serverURL = initURL();
        try {
            TestLog.log().info("Create iOS Driver");
            driver = new IOSDriver(serverURL, cap);
            TestLog.log().info("iOS Driver created");
            wait = new WebDriverWait(driver, Duration.ofMillis(Constants.DEFAULT_WAIT_TIMEOUT));
        } catch (SessionNotCreatedException e) {
            throw new FrameworkException("Could not start a driver session", e);
        }
    }

    @Override
    public void givePermission(Permission permission) {

    }
}
