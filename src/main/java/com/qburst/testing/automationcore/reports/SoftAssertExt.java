package com.qburst.testing.automationcore.reports;

import com.aventstack.extentreports.Status;
import org.testng.asserts.IAssert;
import org.testng.asserts.SoftAssert;

public class SoftAssertExt extends SoftAssert {

    @Override
    public void assertTrue(boolean condition, String validationMessage) {
        super.assertTrue(condition, validationMessage);
    }

    @Override
    public void assertFalse(boolean condition, String validationMessage) {
        super.assertFalse(condition, validationMessage);
    }

    @Override
    public <T> void assertEquals(T actual, T expected, String validationMessage) {
        super.assertEquals(actual, expected, validationMessage);
    }

    @Override
    public void onBeforeAssert(IAssert<?> assertCommand) {
        if (assertCommand.getActual().equals(assertCommand.getExpected()))
            ExtentReport.log(Status.PASS, "Validation Passed - "+assertCommand.getMessage());
        else ExtentReport.log(Status.FAIL, "Validation Failed - "+assertCommand.getMessage());
    }
}
