package com.qburst.testing.automationcore.selenium.mobile;

import com.qburst.testing.automationcore.Constants;
import com.qburst.testing.automationcore.FrameworkException;
import com.qburst.testing.automationcore.selenium.Element;
import com.qburst.testing.automationcore.selenium.ElementImpl;
import com.qburst.testing.automationcore.selenium.ParentDriver;
import com.qburst.testing.automationcore.utils.FileOps;
import com.qburst.testing.automationcore.utils.TestLog;
import io.appium.java_client.AppiumDriver;
import io.appium.java_client.remote.SupportsContextSwitching;
import io.appium.java_client.screenrecording.CanRecordScreen;
import org.openqa.selenium.*;
import org.openqa.selenium.support.ui.ExpectedCondition;
import org.openqa.selenium.support.ui.ExpectedConditions;

import java.io.File;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;

public abstract class MobileDriver extends ParentDriver {


    public enum ContextHandles {
        NATIVE_APP,WEBVIEW;
    }

    @Override
    public AppiumDriver getDriver() {
        return (AppiumDriver) driver;
    }

    protected URL initURL() {
        TestLog.log().info("Initialize the appium server url");
        String urlString = String.format(Constants.APPIUM_URL,AppiumParams.getAppiumPort());
        URL url;
        try {
            url = new URL(urlString);
        } catch (MalformedURLException e) {
            throw new FrameworkException(e);
        }
        return url;
    }

    @Override
    public MobileElement findElement(By by) {
        return new MobileElementImpl(driver.findElement(by));
    }

    @Override
    public List<Element> findElements(By by) {
        List<Element> elements = new ArrayList<>();
        List<WebElement> webElements = driver.findElements(by);
        for (WebElement webElement : webElements) {
            elements.add(new ElementImpl(webElement));
        }
        return elements;
    }

    @Override
    public Element findVisibleElement(By by) {
        return new MobileElementImpl(wait.until(ExpectedConditions.visibilityOfElementLocated(by)));
    }

    @Override
    public Element findClickableElement(By by) {
        return new MobileElementImpl(wait.until(ExpectedConditions.elementToBeClickable(by)));    }

    @Override
    public Element findPresentElement(By by) {
        return new MobileElementImpl(wait.until((ExpectedCondition<WebElement>) driver -> {
            try {
                WebElement element = driver.findElement(by);
                return element != null && element.isEnabled() ? element : null;
            } catch (StaleElementReferenceException | NotFoundException var4) {
                return null;
            }
        }));    }

    @Override
    public void startScreenRecording(){
        ((CanRecordScreen)this.getDriver()).startRecordingScreen();
    }

    @Override
    public String stopScreenRecording(){
        return ((CanRecordScreen)this.getDriver()).stopRecordingScreen();
    }

    @Override
    public boolean saveScreenRecording(String media, String outputDir, String outputFileName){
        FileOps.createDir(outputDir);
        String outputFilePath = outputDir+File.separator+outputFileName+".mp4";
        return FileOps.saveMedia(media,outputFilePath);
    }

    @Override
    public void takeScreenshot(String imagePath) {
        File file = (File) getScreenshotAs(ScreenshotFileType.FILE);
        FileOps.copyFile(file, imagePath);
    }

    @Override
    public Object getScreenshotAs(ScreenshotFileType opType){
        switch (opType){
            case BASE64:
                return this.getDriver().getScreenshotAs(OutputType.BASE64);
            case BYTES:
                return this.getDriver().getScreenshotAs(OutputType.BYTES);
            case FILE:
                return this.getDriver().getScreenshotAs(OutputType.FILE);
            default:
                throw new IllegalStateException("Unexpected value: " + opType);
        }
    }

    public void swipeScreenUp() {
        swipeScreenUp(1);
    }

    public void swipeScreenUp(int times) {
        for (int i = 0; i < times; i++) {
            W3cAction.doSwipeScreenFromBottomToTop((AppiumDriver) driver);
        }
    }

    //TODO; Optimize the method to check for required handle's availability first
    public void switchContext(ContextHandles handle) {
        StringBuilder bld = new StringBuilder();
        Set<String> contextHandles = ((SupportsContextSwitching) driver).getContextHandles();
        for (String contextHandle : contextHandles) {
            bld.append(contextHandle);
        }
        String handleString = bld.toString();

        try {
            if (handle == ContextHandles.NATIVE_APP) {
                ((SupportsContextSwitching) driver).context(contextHandles.toArray()[0].toString());
            } else if (handle == ContextHandles.WEBVIEW) {
                ((SupportsContextSwitching) driver).context(contextHandles.toArray()[1].toString());
            }
        } catch (ArrayIndexOutOfBoundsException e) {
            throw new FrameworkException(String.format("The required context handle not found. Available handles are : %s  ExceptionCause: %s",handleString,e));
        }
    }

}
