package com.qburst.testing.automationcore.selenium.mobile;

import com.qburst.testing.automationcore.selenium.ElementImpl;
import io.appium.java_client.AppiumDriver;
import org.openqa.selenium.Point;
import org.openqa.selenium.WebElement;

public class MobileElementImpl extends ElementImpl implements MobileElement {


    public MobileElementImpl(WebElement element) {
        super(element);
    }

    private Point getCentre(){
        int centreY = this.getRect().getY() + (this.getSize().height/2);
        int centreX = this.getRect().getX() + (this.getSize().width/2);
        return new Point(centreX,centreY);
    }

    public void tap(){
        W3cAction.doTap((AppiumDriver) getWrappedDriver(), this.getCentre());
    }

    public void long_press(){
        W3cAction.doLongPress((AppiumDriver) getWrappedDriver(), this.getCentre());
    }

    public void swipe_up(){
        W3cAction.doSwipeToScreenTop((AppiumDriver) getWrappedDriver(), this.getCentre());
    }

}
