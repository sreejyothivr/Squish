package com.qburst.testing.automationcore.selenium;

import org.openqa.selenium.TakesScreenshot;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.WrapsDriver;
import org.openqa.selenium.WrapsElement;
import org.openqa.selenium.interactions.Locatable;

/**
 * wraps a web element interface with extra functionality. Anything added here will be added to all descendants.
 */
public interface Element extends WebElement, WrapsElement, Locatable, TakesScreenshot, WrapsDriver {
    /**
     * Returns true when the inner element is ready to be used.
     *
     * @return boolean true for an initialized WebElement, or false if we were somehow passed a null WebElement.
     */
    boolean elementWired();

    void click(String logMsg);

    void input(String inputText);

    void input(String inputText, String logMessage);

    void jsClick();

    void moveToElement();

    void moveToElement(String logMsg);

    String getElementLocator();
}
