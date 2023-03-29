package com.qburst.testing.automationcore.selenium.mobile.platforms;

public class Device {


    private String name;
    private String androidAutomationName; //TODO: refactor based on ios option
    private String androidAppPackage;
    private String androidAppActivity;
    private String androidAppLocation;
    private String udid;

    private String systemPort;

    private String appiumport;

    private String chromeDriverPort;

    private String platformVersion;

    public Device() {
    }

    public Device(String name, String androidAutomationName, String androidAppPackage, String androidAppActivity, String androidAppLocation) {
        this.name = name;
        this.androidAutomationName = androidAutomationName;
        this.androidAppPackage = androidAppPackage;
        this.androidAppActivity = androidAppActivity;
        this.androidAppLocation = androidAppLocation;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getAndroidAutomationName() {
        return androidAutomationName;
    }

    public void setAndroidAutomationName(String androidAutomationName) {
        this.androidAutomationName = androidAutomationName;
    }

    public String getAndroidAppPackage() {
        return androidAppPackage;
    }

    public void setAndroidAppPackage(String androidAppPackage) {
        this.androidAppPackage = androidAppPackage;
    }

    public String getAndroidAppActivity() {
        return androidAppActivity;
    }

    public void setAndroidAppActivity(String androidAppActivity) {
        this.androidAppActivity = androidAppActivity;
    }

    public String getAndroidAppLocation() {
        return androidAppLocation;
    }

    public void setAndroidAppLocation(String androidAppLocation) {
        this.androidAppLocation = androidAppLocation;
    }

    public String getudid() {
        return udid;
    }

    public void setudid(String udid) {
        this.udid = udid;
    }

    public String getSystemPort() {
        return systemPort;
    }

    public void setSystemPort(String systemPort) {
        this.systemPort = systemPort;
    }

    public String getChromeDriverPort() {
        return chromeDriverPort;
    }

    public void setChromeDriverPort(String chromeDriverPort) {
        this.chromeDriverPort = chromeDriverPort;
    }

    public String getAppiumport() {
        return appiumport;
    }

    public void setAppiumport(String appiumPort) {
        this.appiumport = appiumPort;
    }

    public String getplatformVersion() {
        return platformVersion;
    }

    public void setplatformVersion(String platformVersion) {
        this.platformVersion = platformVersion;
    }
}
