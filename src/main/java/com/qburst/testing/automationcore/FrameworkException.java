package com.qburst.testing.automationcore;

import com.qburst.testing.automationcore.utils.TestLog;

public class FrameworkException extends RuntimeException{
    public FrameworkException() {
        super();
    }

    public FrameworkException(String message) {
        super(message);
        TestLog.log().fatal(message);
    }

    public FrameworkException(String message, Throwable cause) {
        super(message, cause);
        TestLog.log().fatal("{} {}", message, cause.getMessage());
    }

    public FrameworkException(Throwable cause) {
        super(cause);
    }

    public FrameworkException(String message, Throwable cause, boolean enableSuppression, boolean writableStackTrace) {
        super(message, cause, enableSuppression, writableStackTrace);
        TestLog.log().fatal("{} {}",message,cause.getMessage());
    }

}
