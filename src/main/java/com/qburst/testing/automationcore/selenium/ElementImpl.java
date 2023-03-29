package com.qburst.testing.automationcore.selenium;

import com.qburst.testing.automationcore.reports.ExtentReport;
import com.qburst.testing.automationcore.utils.TestLog;
import org.openqa.selenium.*;
import org.openqa.selenium.interactions.Coordinates;
import org.openqa.selenium.interactions.Locatable;
import org.openqa.selenium.remote.RemoteWebElement;

import java.util.List;

public class ElementImpl implements Element {

    private final WebElement element;

    /**
     * Creates a Element for a given WebElement.
     *
     * @param element element to wrap up
     */
    public ElementImpl(final WebElement element) {
        this.element = element;
    }

    @Override
    public boolean elementWired() {
        return (element != null);
    }

    @Override
    public void click() {
        try {
            element.click();
        } catch (ElementNotInteractableException e) {
            TestLog.log().debug("{} : ElementClickInterceptedException: proceeding with jsClick", this.getWrappedElement().toString());
            this.jsClick();
        }
        //TODO: add technical log -> (String.format("Click element %s -> ",this.getElementLocator()));
    }

    @Override
    public void click(String logMsg) {
        this.click();
        ExtentReport.log(logMsg);
    }

    @Override
    public void submit() {
        element.submit();
    }

    @Override
    public void sendKeys(CharSequence... keysToSend) {
        element.sendKeys(keysToSend);
        //TODO: Add technical log -> String.format("Input '%s' into element %s -> ",String.join("", keysToSend),this.getElementLocator());
    }

    @Override
    public void input(String inputText) {
        this.sendKeys(inputText);
    }

    @Override
    public void input(String inputText, String logMessage) {
        this.input(inputText);
        ExtentReport.log(logMessage);
    }

    @Override
    public void clear() {
        element.clear();
    }

    @Override
    public String getTagName() {
        return element.getTagName();
    }

    @Override
    public String getAttribute(String name) {
        return element.getAttribute(name);
    }

    @Override
    public boolean isSelected() {
        return element.isSelected();
    }

    @Override
    public boolean isEnabled() {
        return element.isEnabled();
    }

    @Override
    public String getText() {
        return element.getText();
    }

    @Override
    public List<WebElement> findElements(By by) {
        return element.findElements(by);
    }

    @Override
    public WebElement findElement(By by) {
        return element.findElement(by);
    }

    @Override
    public boolean isDisplayed() {
        try {
            if (element.getSize().height>0)
                return true;
        }catch (Exception ignore){
        }
        return false;
    }

    @Override
    public Point getLocation() {
        return element.getLocation();
    }

    @Override
    public Dimension getSize() {
        return element.getSize();
    }

    @Override
    public Rectangle getRect() {
        return element.getRect();
    }

    @Override
    public String getCssValue(String propertyName) {
        return element.getCssValue(propertyName);
    }

    @Override
    public <X> X getScreenshotAs(OutputType<X> target) throws WebDriverException {
        return element.getScreenshotAs(target);
    }

    @Override
    public Coordinates getCoordinates() {
        return ((Locatable) element).getCoordinates();
    }


    @Override
    public WebElement getWrappedElement() {
        return element;
    }

    @Override
    public WebDriver getWrappedDriver() {
        RemoteWebElement e = (RemoteWebElement) this.element;
        return e.getWrappedDriver();
    }

    @Override
    public void jsClick() {
        JavascriptExecutor executor = (JavascriptExecutor) this.getWrappedDriver();
        executor.executeScript("arguments[0].click();", this.element);
        //TODO: technical log -> ExtentReport.log(String.format("Click(using javascript) element %s -> ",this.getElementLocator()));
    }

    public void jsClick(String logMsg) {
        this.jsClick();
        ExtentReport.log(String.format("Click(using javascript): %s -> ", logMsg));
    }

    @Override
    public void moveToElement() {
        ((JavascriptExecutor) this.getWrappedDriver()).executeScript("arguments[0].scrollIntoView(true);", this.element);
    }

    @Override
    public void moveToElement(String logMsg) {
        this.moveToElement();
        ExtentReport.log(logMsg);
    }

    @Override
    public String getElementLocator() {
        return this.getWrappedElement().toString().split("->")[1];

    }
}
