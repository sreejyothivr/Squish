package com.qburst.testing.automationcore.selenium.browser;

public enum BrowserType {
    CHROME("Chrome"),
    SAFARI("Safari"),
    FIREFOX("Firefox"),
    IE("InternetExplorer"),
    EDGE("Edge");
    private final String arg;
    private BrowserType(String arg) {
        this.arg = arg;
    }

    public String getArgument() {
        return this.arg;
    }
}
