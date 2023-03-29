package com.qburst.testing.automationcore.selenium.mobile;

import com.qburst.testing.automationcore.Constants;
import com.qburst.testing.automationcore.FrameworkException;
import com.qburst.testing.automationcore.Params;
import com.qburst.testing.automationcore.selenium.SeleniumParams;
import com.qburst.testing.automationcore.selenium.mobile.platforms.Device;
import com.qburst.testing.automationcore.selenium.mobile.platforms.Platform;
import com.qburst.testing.automationcore.utils.TestLog;
import com.qburst.testing.automationcore.utils.XML;

import java.io.InputStream;
import java.util.List;

public class AppiumParams extends SeleniumParams {

    private static final ThreadLocal<String> deviceName = new ThreadLocal<>();
    private static final ThreadLocal<String> udid = new ThreadLocal<>();
    private static final ThreadLocal<String> avd = new ThreadLocal<>();
    private static final ThreadLocal<String> automationName = new ThreadLocal<>();

    private static final ThreadLocal<String> systemPort = new ThreadLocal<>();

    private static final ThreadLocal<String> appiumPort = new ThreadLocal<>();

    private static final ThreadLocal<String> platformVersion = new ThreadLocal<>();

    private static final ThreadLocal<String> chromeDriverPort = new ThreadLocal<>();



    private AppiumParams() {
        super();
    }

    public static String getPlatformName() {
        return System.getProperty(Constants.PROPERTY_NAME_PLATFORMNAME, Constants.DEFAULT_PLATFORM_NAME);
    }

    public static void setPlatformName(String argPlatformName) {
        if (argPlatformName!=null)
        System.setProperty(Constants.PROPERTY_NAME_PLATFORMNAME, argPlatformName);
    }

    public static String getDeviceName() {
        return deviceName.get();
    }

    private static void setDeviceName(String argDeviceName) {
        deviceName.set(argDeviceName);
    }

    public static String getUdid() {
        return udid.get();
    }

    private static void setUdid(String argUdid) {
        udid.set(argUdid);
    }

    public static String getAvd() {
        return avd.get();
    }

    public static String getAutomationName() {
        return automationName.get();
    }

    public static void setAutomationName(String argAutomationName) {
        automationName.set(argAutomationName);
    }

    private static void setAvd(String argAvd) {
        avd.set(argAvd);
    }

    public static String getSystemPort() {
        return systemPort.get();
    }

    public static void setSystemPort(String argSystemPort) {
        systemPort.set(argSystemPort);
    }

    public static String getAppiumPort() {
        return appiumPort.get();
    }

    public static void setAppiumPort(String argAppiumPort) {
        appiumPort.set(argAppiumPort);
    }

    public static String getPlatformVersion() {
        return platformVersion.get();
    }

    public static void setPlatformVersion(String argPlatformVersion) {
        platformVersion.set(argPlatformVersion);
    }

    public static String getChromeDriverPort() {
        return chromeDriverPort.get();
    }

    public static void setChromeDriverPort(String argChromeDriverPort) {
        chromeDriverPort.set(argChromeDriverPort);
    }



    public static void initDeviceParams(String deviceName) {
        InputStream inputStream = AppiumParams.class.getClassLoader().getResourceAsStream(Constants.DEVICE_CONFIG_FILE);

        if (deviceName == null || deviceName.isEmpty()) {
            deviceName = Constants.DEFAULT_DEVICE_NAME;
            TestLog.log().warn("No argument passed for Device Name from the test. Starting the test with default device: {}. Change default device in test.properties", deviceName);
        }

        List<Platform> platforms = XML.loadXMLAsObject(Platform.class, inputStream);
        if (platforms.isEmpty())
            throw new FrameworkException("Could not find platform and device configuration in the device config xml or the xml schema is not correct");
        for (Platform platform : platforms) {
            if (platform.getDevice(deviceName) != null) {
                initDeviceParams(platform, platform.getDevice(deviceName));
                return;
            }
        }
        throw new FrameworkException("Could not find any device configuration in the devices.xml or the xml schema is not correct");
    }

    private static void initDeviceParams(Platform platform, Device device) {
        setPlatformName(platform.getName());
        setAutomationName(device.getAndroidAutomationName());
        setDeviceName(device.getName());
        setAppiumPort(device.getAppiumport());
        setUdid(device.getudid());
        setAvd(device.getName());
        setSystemPort(device.getSystemPort());
        setChromeDriverPort(device.getChromeDriverPort());
        setPlatformVersion(device.getplatformVersion());
    }

    public static void unload() {
        deviceName.remove();
        udid.remove();
        avd.remove();
        automationName.remove();
        systemPort.remove();
        appiumPort.remove();
        chromeDriverPort.remove();
    }


}
