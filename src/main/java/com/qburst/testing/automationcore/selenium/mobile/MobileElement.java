package com.qburst.testing.automationcore.selenium.mobile;

import com.qburst.testing.automationcore.selenium.Element;

public interface MobileElement extends Element {
    /**
     * Tap on an element
     */
//    Point getCentre();
    void tap();

    /**
     * Press and hold on an element for a default duration
     */
    void long_press();

    /**
     * Press and swipe up an element to the top of the app screen
     */
    void swipe_up();
}
