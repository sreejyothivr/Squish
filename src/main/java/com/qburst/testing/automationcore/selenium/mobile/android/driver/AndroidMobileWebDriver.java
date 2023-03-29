package com.qburst.testing.automationcore.selenium.mobile.android.driver;

import com.qburst.testing.automationcore.Constants;
import com.qburst.testing.automationcore.selenium.mobile.AppiumParams;
import com.qburst.testing.automationcore.utils.TestLog;
import io.appium.java_client.remote.MobileCapabilityType;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.remote.DesiredCapabilities;

public class AndroidMobileWebDriver extends AndroidMobileDriver {


    @Override
    public synchronized void open() {
        TestLog.log().info("Opening chrome browser on the device");
        DesiredCapabilities cap = setAndroidDeviceCapabilities();
        cap.setCapability(MobileCapabilityType.BROWSER_NAME, "Chrome");
        if (!Constants.TEST_APPIUM_TRIGGER.equalsIgnoreCase("device_farm")) {
            //cap.setCapability("chromeDriverPort", AppiumParams.getChromeDriverPort());
            cap.setCapability("chromedriverExecutableDir", System.getProperty("user.dir") + "/drivers/" + AppiumParams.getDeviceName());
            //cap.setCapability(MobileCapabilityType.ACCEPT_INSECURE_CERTS,true);
            ChromeOptions chromeOptions = new ChromeOptions();
            chromeOptions.setAcceptInsecureCerts(true);
            chromeOptions.addArguments("--ignore-ssl-errors=yes");
            chromeOptions.addArguments("--ignore-certificate-errors");
            cap.setCapability(ChromeOptions.CAPABILITY,chromeOptions);
        }else{
            cap.setCapability("chromeDriverPort", 11000);
            cap.setCapability("chromedriverExecutableDir", System.getProperty("user.dir") + "/drivers/"); //TODO: Manage path

        }
        initDriver(cap);
    }
}
