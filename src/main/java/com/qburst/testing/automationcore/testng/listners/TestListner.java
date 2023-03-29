package com.qburst.testing.automationcore.testng.listners;

import com.aventstack.extentreports.MediaEntityBuilder;
import com.aventstack.extentreports.Status;
import com.qburst.testing.automationcore.reports.ExtentReport;
import com.qburst.testing.automationcore.reports.HTMLEmailReport;
import com.qburst.testing.automationcore.selenium.ParentDriver;
import com.qburst.testing.automationcore.selenium.mobile.AppiumParams;
import com.qburst.testing.automationcore.testng.BaseTest;
import com.qburst.testing.automationcore.utils.Config;
import com.qburst.testing.automationcore.utils.TestLog;
import org.testng.*;

import java.io.PrintWriter;
import java.io.StringWriter;

public class TestListner implements ISuiteListener, ITestListener {


    /**
     * To report the failure in the HTML Report, HTML Email Report and the log
     * @param result
     */
    @Override
    public void onTestFailure(ITestResult result) {
        String encoded = getScreenshotAsBase64String(result);
        ExtentReport.getTest().fail("Test Failed", MediaEntityBuilder.createScreenCaptureFromBase64String(encoded).build());
        TestLog.log().error("End of Test: {} : Failed",result.getName());
        if(result.getThrowable()!=null){
            StringWriter sw = new StringWriter();
            PrintWriter pw = new PrintWriter(sw);
            result.getThrowable().printStackTrace(pw);
            ExtentReport.getTest().fail(result.getThrowable());
            TestLog.log().error(result.getThrowable());
        }
        HTMLEmailReport.addCount("Failed");
    }

    /**
     * Get screenshot as Base64 String
     * @param result
     * @return
     */
    private static String getScreenshotAsBase64String(ITestResult result) {
        ParentDriver driver = ((BaseTest) result.getInstance()).getDriver();
        return (String) driver.getScreenshotAs(ParentDriver.ScreenshotFileType.BASE64);
    }

    /**
     * Initialize the test configuration on test suite start
     * @param suite
     */
    @Override
    public void onStart(ISuite suite) {
        TestLog.log().info("Starting execution of Suite: {}",suite.getName());
        Config.initializaSystemTestConfig();
        HTMLEmailReport.setSuiteName(suite.getName());
        //ISuiteListener.super.onStart(suite);
    }

    /**
     * Save HTML Email report on completion of the test suite
     * @param suite
     */
    @Override
    public void onFinish(ISuite suite) {
        TestLog.log().info("End of Suite: {}",suite.getName());
//        ISuiteListener.super.onFinish(suite);
        HTMLEmailReport.flush();
    }

    /**
     * Intialize the extent report and HTML Email Report
     * @param result
     */
    @Override
    public void onTestStart(ITestResult result) {
        TestLog.log().info("Starting execution of Test: {}",result.getName());
        ExtentReport.startTest(result.getName(),result.getMethod().getDescription())
                .assignCategory(result.getTestContext().getName());
        if (AppiumParams.getAppType().equalsIgnoreCase("mobile.native")
                ||AppiumParams.getAppType().equalsIgnoreCase("mobile.web"))
            ExtentReport.getTest().assignDevice(AppiumParams.getPlatformName()+"_"+ AppiumParams.getDeviceName());
        HTMLEmailReport.addCount("TestCount");
    }

    @Override
    public void onTestSuccess(ITestResult result) {
        String encoded = getScreenshotAsBase64String(result);
        ExtentReport.getTest().pass("Test Passed", MediaEntityBuilder.createScreenCaptureFromBase64String(encoded).build());
        TestLog.log().info("End of Test: {} : Passed",result.getName());
        HTMLEmailReport.addCount("Passed");
    }

    @Override
    public void onTestSkipped(ITestResult result) {
        ExtentReport.getTest().log(Status.SKIP,"Test Skipped");
        TestLog.log().error("End of Test: {} : Skipped",result.getName());
        HTMLEmailReport.addCount("Skipped");
    }

    @Override
    public void onTestFailedButWithinSuccessPercentage(ITestResult result) {
        TestLog.log().error("End of Test: {} : Passed Conditionally",result.getName());
        ITestListener.super.onTestFailedButWithinSuccessPercentage(result);
    }

    @Override
    public void onTestFailedWithTimeout(ITestResult result) {
        TestLog.log().error("End of Test: {} : Failed due to Timeout",result.getName());
        ITestListener.super.onTestFailedWithTimeout(result);
    }

    @Override
    public void onStart(ITestContext context) {
        TestLog.log().info("Starting execution of Test Set: {}",context.getName());
        //ITestListener.super.onStart(context);
        HTMLEmailReport.startTest();
        HTMLEmailReport.addModule(context.getName());
    }

    @Override
    public void onFinish(ITestContext context) {
        TestLog.log().info("End of Test Set: {}",context.getName());
        ExtentReport.getReporter().flush();
        HTMLEmailReport.addstatus();

    }
}
