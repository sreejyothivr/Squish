package com.qburst.testing.automationcore.selenium.mobile;

import com.qburst.testing.automationcore.Constants;
import io.appium.java_client.AppiumDriver;
import org.openqa.selenium.Dimension;
import org.openqa.selenium.Point;
import org.openqa.selenium.interactions.Pause;
import org.openqa.selenium.interactions.PointerInput;
import org.openqa.selenium.interactions.Sequence;

import java.util.Arrays;

import static java.time.Duration.ofMillis;
import static org.openqa.selenium.interactions.PointerInput.Kind.TOUCH;
import static org.openqa.selenium.interactions.PointerInput.MouseButton.LEFT;
import static org.openqa.selenium.interactions.PointerInput.Origin.viewport;

public class W3cAction {
    private static final PointerInput FINGER = new PointerInput(TOUCH, "finger");


    private W3cAction() {
         //Adding private constructor to hide the implicit public constructor
    }

    public static void doTap(AppiumDriver driver, Point point, int duration) {
        Sequence tap = new Sequence(FINGER, 1)
                .addAction(FINGER.createPointerMove(ofMillis(0), viewport(), point.getX(), point.getY()))
                .addAction(FINGER.createPointerDown(LEFT.asArg()))
                .addAction(new Pause(FINGER, ofMillis(duration)))
                .addAction(FINGER.createPointerUp(LEFT.asArg()));
        driver.perform(Arrays.asList(tap));
    }

    public static void doTap(AppiumDriver driver, Point point) {
        doTap(driver, point, Constants.DEFAULT_DURATION_TAP);
    }

    public static void doLongPress(AppiumDriver driver, Point point) {
        doTap(driver, point, Constants.DEFAULT_DURATION_LONG_PRESS);
    }

    public static void doSwipe(AppiumDriver driver, Point start, Point end, int duration) {
        Sequence swipe = new Sequence(FINGER, 1)
                .addAction(FINGER.createPointerMove(ofMillis(0), viewport(), start.getX(), start.getY()))
                .addAction(FINGER.createPointerDown(LEFT.asArg()))
                .addAction(FINGER.createPointerMove(ofMillis(duration), viewport(), end.getX(), end.getY()))
                .addAction(FINGER.createPointerUp(LEFT.asArg()));
        driver.perform(Arrays.asList(swipe));
    }

    public static void doSwipeToScreenTop(AppiumDriver driver, Point start) {
        Dimension size = driver.manage().window().getSize();
        int endX = size.width / 2;
        int endY = (int) (size.height * 0.05);
        doSwipe(driver,start,new Point(endX,endY),Constants.DEFAULT_DURATION_SWIPE_UP);

    }

    public static void doSwipeScreenFromBottomToTop(AppiumDriver driver) {
        Dimension size = driver.manage().window().getSize();
        int startX = size.width / 2;
        int startY = (int) (size.height * 0.95);
        doSwipeToScreenTop(driver, new Point(startX,startY));
    }
}
