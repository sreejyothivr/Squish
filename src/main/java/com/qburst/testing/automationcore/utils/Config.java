package com.qburst.testing.automationcore.utils;

import java.io.IOException;
import java.io.InputStream;
import java.util.Properties;

public class Config {

    private Config() {
    }


    public static void initializaSystemTestConfig() {
        TestLog.log().warn("Default test configuration initialization. TestNG suite xml parameters will override this configuration");
        InputStream testConfigFileStream = Config.class.getClassLoader().getResourceAsStream("testconfig.properties");
        InputStream configFileStream = Config.class.getClassLoader().getResourceAsStream("config.properties");
        if (testConfigFileStream != null) {
            TestLog.log().info("testconfig.properties found in test resources. Initializing test config parameters as System Properties");
            initializaSystemTestConfig(testConfigFileStream);
        } else if (configFileStream != null) {
            TestLog.log().info("Framework did not find testconfig.properties in test resources. Initializing defaults config parameters from config.properties as System Properties");
            initializaSystemTestConfig(configFileStream);
        } else {
            TestLog.log().error("No configuration file found at test/resources/testconfig.properties or main/resources/config.properties");
        }
    }

    public static void initializaSystemTestConfig(InputStream configFileStream) {
        Properties prop = new Properties();
        try {
            prop.load(configFileStream);
            for (String name : prop.stringPropertyNames()) {
                if (System.getProperty(name) == null)
                    System.setProperty(name, prop.getProperty(name));
            }

        } catch (IOException e) {
            TestLog.log().info("Default configuration failed. testconfig properties file path shared: {}", configFileStream);
        }
    }
}
