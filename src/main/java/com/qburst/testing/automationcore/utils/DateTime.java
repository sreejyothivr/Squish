package com.qburst.testing.automationcore.utils;

import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.Date;

public class DateTime {

    private DateTime() {
    }

    public static String getDateTime(){
        DateFormat format = new SimpleDateFormat("yyyy-MM-dd-HH-mm-ss");
        Date date = new Date();
        return format.format(date);
    }
}
