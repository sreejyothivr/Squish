package com.qburst.testing.automationcore.reports;

import com.aventstack.extentreports.ExtentReports;
import com.aventstack.extentreports.ExtentTest;
import com.aventstack.extentreports.Status;
import com.aventstack.extentreports.reporter.ExtentSparkReporter;
import com.aventstack.extentreports.reporter.configuration.Theme;
import com.aventstack.extentreports.reporter.configuration.ViewName;
import com.qburst.testing.automationcore.utils.TestLog;

import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class ExtentReport {
    private static ExtentReports extent;
     static final String FILEPATH = System.getProperty("user.dir")+"/target/extent-report.html"; //TODO: Manage as system property
    static Map<Integer, ExtentTest> extentTestMap = new HashMap<>();

    private ExtentReport() {
    }

    public static  ExtentReports getReporter() {
        if (extent == null) {
            ExtentSparkReporter spark = new ExtentSparkReporter(FILEPATH);
            List<ViewName> DEFAULT_ORDER = Arrays.asList(ViewName.DASHBOARD, ViewName.CATEGORY, ViewName.TEST);
            spark.viewConfigurer().viewOrder().as(DEFAULT_ORDER);
            spark.config().setTimelineEnabled(false);
            spark.config().thumbnailForBase64(true);
            spark.config().setDocumentTitle("Automation Core");//TODO: parameterize
            spark.config().setReportName("Mobile");//TODO: parameterize
            spark.config().setTheme(Theme.STANDARD);//TODO: parameterize
            extent = new ExtentReports();
            extent.attachReporter(spark);
        }
        return extent;
    }

    public static  ExtentTest getTest() {
        return extentTestMap.get((int) (Thread.currentThread().getId()));
    }

    public static synchronized  ExtentTest startTest(String testName, String desc) {
        ExtentTest extentTest = getReporter().createTest(testName, desc);
        extentTestMap.put((int) Thread.currentThread().getId(), extentTest);
        return extentTest;

    }

    public static  void log(String msg) {
        log(Status.INFO,msg);
    }

    public static  void log(Status status, String msg) {
        TestLog.log().debug(msg);
        if (ExtentReport.getTest() != null)
            ExtentReport.getTest().log(status, msg);
        else {//TODO: Log into standard test log : SKIPPED: Add log to Extend Report. Extend report is not created by the framework used
        }
    }


}
