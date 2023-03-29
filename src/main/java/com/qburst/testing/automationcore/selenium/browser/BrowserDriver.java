package com.qburst.testing.automationcore.selenium.browser;

import com.qburst.testing.automationcore.FrameworkException;
import com.qburst.testing.automationcore.selenium.Element;
import com.qburst.testing.automationcore.selenium.ElementImpl;
import com.qburst.testing.automationcore.selenium.ParentDriver;
import org.openqa.selenium.*;
import org.openqa.selenium.support.ui.ExpectedCondition;
import org.openqa.selenium.support.ui.ExpectedConditions;

import java.util.ArrayList;
import java.util.List;

public abstract class BrowserDriver extends ParentDriver {

    @Override
    public WebDriver getDriver() {
        return this.driver;
    }

    @Override
    public Element findElement(By by) {
        return new ElementImpl(driver.findElement(by));
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
        return new ElementImpl(wait.until(ExpectedConditions.visibilityOfElementLocated(by)));
    }

    @Override
    public Element findClickableElement(By by) {
        return new ElementImpl(wait.until(ExpectedConditions.elementToBeClickable(by)));
    }

    @Override
    public Element findPresentElement(By locator) {
        return new ElementImpl(wait.until((ExpectedCondition<WebElement>) driver -> {
            try {
                WebElement element = driver.findElement(locator);
                return element != null && element.isEnabled() ? element : null;
            } catch (StaleElementReferenceException | NotFoundException var4) {
                return null;
            }
        }));
    }

    @Override
    public void givePermission(Permission permission) {
        //Implementation pending
        throw new FrameworkException("This action is currently unsupported in the browser");
    }

    @Override
    public void takeScreenshot(String imagePath) {

    }

    @Override
    public Object getScreenshotAs(ScreenshotFileType opType) {
        switch (opType) {
            case BASE64:
                return ((TakesScreenshot) this.getDriver()).getScreenshotAs(OutputType.BASE64);
            case BYTES:
                return ((TakesScreenshot) this.getDriver()).getScreenshotAs(OutputType.BYTES);
            case FILE:
                return ((TakesScreenshot) this.getDriver()).getScreenshotAs(OutputType.FILE);
            default:
                throw new IllegalStateException("Unexpected value: " + opType);
        }
    }

    @Override
    public void startScreenRecording() {
        throw new FrameworkException("This action is currently unsupported in the browser");
    }

    @Override
    public Object stopScreenRecording() {
        throw new FrameworkException("This action is currently unsupported in the browser");
    }

    @Override
    public boolean saveScreenRecording(String media, String outputDir, String outputFileName) {
        throw new FrameworkException("This action is currently unsupported in the browser");
    }
}
