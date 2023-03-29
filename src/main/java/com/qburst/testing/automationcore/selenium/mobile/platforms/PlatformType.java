package com.qburst.testing.automationcore.selenium.mobile.platforms;

public enum PlatformType {
    ANDROID("Android"),
    IOS("iOS");
    private final String arg;
    private PlatformType(String arg) {
        this.arg = arg;
    }

    public String getArgument() {
        return this.arg;
    }
}
