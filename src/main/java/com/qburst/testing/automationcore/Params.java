package com.qburst.testing.automationcore;

public class Params {

    protected Params(){}

    public static void setAppType(String argAppType) {
        if (argAppType!=null)
            System.setProperty(Constants.PROPERTY_NAME_APPTYPE, argAppType);
    }

    public static String getAppType() {
        return System.getProperty(Constants.PROPERTY_NAME_APPTYPE, Constants.DEFAULT_APP_TYPE);
    }
}
