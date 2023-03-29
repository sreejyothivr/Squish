package com.qburst.testing.automationcore.selenium;

import com.qburst.testing.automationcore.Constants;
import com.qburst.testing.automationcore.Params;

public class SeleniumParams extends Params {

    protected SeleniumParams(){}

    private static final ThreadLocal<String> browser = new ThreadLocal<>();

    public static String getBrowser() {
        return browser.get();
    }

    public static void setBrowser(String argBrowser) {
        if (argBrowser != null)
            browser.set(argBrowser);
        else browser.set(Constants.DEFAULT_TEST_BROWSER);
    }

    public static void unload(){
        browser.remove();
    }
}
