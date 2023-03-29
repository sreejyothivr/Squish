package com.qburst.testing.automationcore;

public class Constants {

    private static final String FALSE = "false";

    public static final String EMAIL_AUTH_NAME = System.getProperty("email.auth.id", "sandeep.darsan@qburst.com");
    public static final String EMAIL_AUTH_PWD = System.getProperty("email.auth.pwd");
    public static final String EMAIL_TO_EMAIL = System.getProperty("email.to.email");
    public static final String EMAIL_TO_NAME = System.getProperty("email.to.name");
    public static final String EMAIL_FROM_EMAIL = System.getProperty("email.from.email");
    public static final String EMAIL_FROM_NAME = System.getProperty("email.from.name");
    public static final String EMAIL_SUBJECT = System.getProperty("email.subject", "Test Execution Summary");
    public static final Long DEFAULT_WAIT_TIMEOUT = Long.valueOf(System.getProperty("default.wait.timeout","10000"));
    public static final Long DEFAULT_DELAY_TIMEOUT = Long.valueOf(System.getProperty("default.delay.timeout","10000"));

    public static final String TEST_ENVIRONMENT = System.getProperty("test.environment", "PROD");
    public static final String TEST_TRIGGER = System.getProperty("test.trigger", "local");
    public static final Long APPIUM_COMMAND_TIMEOUT = Long.valueOf(System.getProperty("appium.command.timeout","60"));
    public static final String TEST_APPIUM_TRIGGER = System.getProperty("test.appium.trigger", "local");
    public static final String APPIUM_PORT = System.getProperty("test.appium.port","4723");
    public static final String TEST_MODE = System.getProperty("test.mode", "standalone");
    public static final String TEST_GRID_URL = System.getProperty("test.grid.url","http://localhost:4445");
    public static final String TEST_BROWSER_LOG = System.getProperty("test.browser.log", FALSE);
    public static final String TEST_HEADLESS = System.getProperty("test.headless", FALSE);

    protected Constants() {
    }

    public static final String DEFAULT_APP_TYPE = System.getProperty("default.app.type", "web");
    public static final String DEFAULT_PLATFORM_NAME = System.getProperty("default.platform.name", "Android");
    public static final String DEVICE_CONFIG_FILE = System.getProperty("test.device.config", "devices.xml");
    public static final String DEFAULT_DEVICE_NAME = System.getProperty("default.appium.device", "Pixel_3");
    public static final String DEFAULT_TEST_BROWSER = System.getProperty("test.browser", "chrome");
    public static final String PROJECT_NAME = System.getProperty("project.name", "Automation Core");
    public static final String EMAIL_HOST = System.getProperty("email.host.name", "smtp.gmail.com");
    public static final String HTML_EMAIL_REPORT_FLAG = System.getProperty("email.report.flag", FALSE);

    public static final String APPIUM_URL = System.getProperty("test.appium.url","http://0.0.0.0:4723/wd/hub");


    public static final int AVD_LAUNCH_TIMEOUT = 180000;
    public static final int DEFAULT_DURATION_TAP = 500;
    public static final int DEFAULT_DURATION_LONG_PRESS = 1500;

    public static final int DEFAULT_DURATION_SWIPE_UP = 1000;

    //System Property Names
    public static final String PROPERTY_NAME_APPTYPE = "test.app.type";
    public static final String PROPERTY_NAME_PLATFORMNAME = "test.platform.name";
}
