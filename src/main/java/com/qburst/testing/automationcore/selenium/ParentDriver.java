package com.qburst.testing.automationcore.selenium;

import com.qburst.testing.automationcore.FrameworkException;
import com.qburst.testing.automationcore.reports.ExtentReport;
import com.qburst.testing.automationcore.utils.TestLog;
import org.openqa.selenium.*;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.util.List;

public abstract class ParentDriver {
    protected WebDriver driver;
    protected WebDriverWait wait;

    public enum ScreenshotFileType {BASE64, BYTES, FILE}
    public enum Permission{ALLOW {@Override public String toString(){return "Allow";}},BLOCK{@Override public String toString(){return "Block";}}}


    public abstract void open();

    public abstract WebDriver getDriver();

    public abstract Element findElement(By by);

    public abstract List<Element> findElements(By by);

    public abstract Element findVisibleElement(By by);

    public abstract Element findClickableElement(By by);

    public abstract Element findPresentElement(By by);

    public abstract void givePermission(Permission permission);

    public abstract boolean saveScreenRecording(String media, String outputDir, String outputFileName);

    public abstract void takeScreenshot(String imagePath);

    public abstract Object getScreenshotAs(ScreenshotFileType opTyp);

    public abstract void startScreenRecording();

    public abstract Object stopScreenRecording();

    public final void navigate(String url) {
        TestLog.log().info("Navigate to application url : {}", url);
        if (driver != null) driver.get(url);
        else {
            throw new FrameworkException("Browser Driver is not initialised and opened. Browser should be opened before calling navigate()");
        }
        ExtentReport.log(String.format("Navigate to the application url: %s", url));
    }

    public void close() {
        if (driver != null) driver.quit();
    }

    public void staticWait(long duration) {
        try {
            Thread.sleep(duration);
        } catch (InterruptedException e) {
            TestLog.log().warn("Interrupted!", e);
            Thread.currentThread().interrupt();
        }
    }

    public void click(Element element) {
        try {
            element.click();
        } catch (ElementClickInterceptedException e) {
            element.jsClick();
        }
    }



}
