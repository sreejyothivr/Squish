package com.qburst.testing.automationcore.selenium.mobile.android.driver;

import com.qburst.testing.automationcore.Constants;
import com.qburst.testing.automationcore.FrameworkException;
import com.qburst.testing.automationcore.selenium.mobile.AppiumParams;
import com.qburst.testing.automationcore.selenium.mobile.MobileDriver;
import com.qburst.testing.automationcore.selenium.mobile.MobileElement;
import com.qburst.testing.automationcore.selenium.mobile.MobileElementImpl;
import com.qburst.testing.automationcore.selenium.mobile.android.Keys;
import com.qburst.testing.automationcore.utils.TestLog;
import io.appium.java_client.AppiumBy;
import io.appium.java_client.android.AndroidDriver;
import io.appium.java_client.remote.MobileCapabilityType;
import org.openqa.selenium.By;
import org.openqa.selenium.SessionNotCreatedException;
import org.openqa.selenium.remote.CapabilityType;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.net.URL;
import java.time.Duration;

public class AndroidMobileDriver extends MobileDriver {

    protected void initDriver(DesiredCapabilities cap) {
        URL serverURL = initURL();
        try {
            TestLog.log().info("Create Android Driver");
            driver = new AndroidDriver(serverURL, cap);
            TestLog.log().info("Android Driver created");
            wait = new WebDriverWait(driver, Duration.ofMillis(Constants.DEFAULT_WAIT_TIMEOUT));
        } catch (SessionNotCreatedException e) {
            throw new FrameworkException("Could not start a driver session", e);
        }
    }

    @Override
    public AndroidDriver getDriver() {
        return (AndroidDriver) super.getDriver();
    }

    @Override
    public void givePermission(Permission permission) {
        if (this.getDriver().getContext().equals("NATIVE_APP")) {
            this.getDriver().findElement(By.xpath(".//android.widget.Button[@text='" + permission.toString() + "']")).click();
            return;
        }
        String currentContext = this.getDriver().getContext();
        this.getDriver().context("NATIVE_APP");
        this.getDriver().findElement(By.xpath(".//android.widget.Button[@text='" + permission.toString() + "']")).click();
        staticWait(1000);
        this.getDriver().context(currentContext);
    }

    @Override
    public synchronized void open() {
        TestLog.log().info("Opening chrome browser on the device");
        AppiumParams.initDeviceParams(Constants.DEFAULT_DEVICE_NAME);
        DesiredCapabilities cap = setAndroidDeviceCapabilities();
        cap.setCapability("chromedriverExecutableDir", "/home/sandeep/SandeepDarsan/Workspace/Java/Lab/automationcore/drivers"); //TODO: Manage path
        initDriver(cap);
    }

    /**
     * To install an apk and open the app
     *
     * @param apkPath TODO: method optimization pending with overloaded method
     *                                               TODO: configuration to be parameterized using properties
     */
    public void open(String apkPath) {
        TestLog.log().info("Installing the apk file and opening the app");
        AppiumParams.initDeviceParams(Constants.DEFAULT_DEVICE_NAME);
        DesiredCapabilities cap = setAndroidDeviceCapabilities();
        cap.setCapability(MobileCapabilityType.APP, apkPath);
        initDriver(cap);
    }


    /**
     * To open existing app from device using AppPackage and AppActivity
     *
     * @param appPackage
     * @param appActivity Shell command to get App Package and App Activity - adb shell dumpsys window | grep -E mCurrentFocus
     *                    e.g.: appPackage:io.appium.android.apis, appActivity:io.appium.android.apis.accessibility.CustomViewAccessibilityActivity
     */
    public void open(String appPackage, String appActivity) {
        TestLog.log().info("Opening the app using appPackage and appActivity parameters");
        DesiredCapabilities cap = setAndroidDeviceCapabilities();
        cap.setCapability("appPackage", appPackage);
        cap.setCapability("appActivity", appActivity);
        initDriver(cap);
    }

    protected DesiredCapabilities setAndroidDeviceCapabilities() {
        DesiredCapabilities cap = new DesiredCapabilities();
        if (!Constants.TEST_APPIUM_TRIGGER.equalsIgnoreCase("device_farm")) {
            cap.setCapability(CapabilityType.PLATFORM_NAME, AppiumParams.getPlatformName());
            cap.setCapability(MobileCapabilityType.DEVICE_NAME, AppiumParams.getDeviceName());
            cap.setCapability(MobileCapabilityType.AUTOMATION_NAME, AppiumParams.getAutomationName());
//        cap.setCapability(MobileCapabilityType.UDID, GlobalParams.getUdid());
            //cap.setCapability("systemPort", AppiumParams.getSystemPort());
            cap.setCapability("avd", AppiumParams.getAvd());
            cap.setCapability("avdLaunchTimeout", Constants.AVD_LAUNCH_TIMEOUT);
            cap.setCapability("newCommandTimeout", Constants.APPIUM_COMMAND_TIMEOUT);
        }
        return cap;
    }


    public MobileElement findElement(AppiumBy.ByAccessibilityId byAccessibilityId) {
        return new MobileElementImpl(driver.findElement(byAccessibilityId));
    }


    public void typeWithKeyboard(String charsequence) {
        staticWait(1000); //TODO: wait for keyboard to show up with a costom wait method
        if (((AndroidDriver) driver).isKeyboardShown()) {
            for (char inputchar : charsequence.toCharArray()) {
                ((AndroidDriver) driver).pressKey(Keys.get(inputchar));
            }
        } else {
            throw new FrameworkException("The device keyboard is not displayed or enabled");
        }
    }

}
