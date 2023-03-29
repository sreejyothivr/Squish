package com.qburst.testing.automationcore.selenium.mobile.appiumserverbuilder;

import com.qburst.testing.automationcore.FrameworkException;
import com.qburst.testing.automationcore.selenium.mobile.platforms.PlatformType;
import com.qburst.testing.automationcore.utils.TestLog;
import io.appium.java_client.service.local.AppiumDriverLocalService;
import io.appium.java_client.service.local.AppiumServiceBuilder;
import io.appium.java_client.service.local.flags.GeneralServerFlag;

import java.io.File;
import java.io.IOException;
import java.net.ServerSocket;

public class AppiumServerBuilder {

    private AppiumDriverLocalService server;

    public void start() {
        buildUsingDefaults();
    }

    public void start(String platform, int portNumber) {
        if (platform.equalsIgnoreCase(PlatformType.ANDROID.getArgument()))
            buildAppiumForAndroid(portNumber);
        else if (platform.equalsIgnoreCase(PlatformType.IOS.getArgument())) {
            buildAppiumForiOS(portNumber);
        } else
            throw new FrameworkException(String.format("Platform not supported by Framework. Platform: %s", platform));

    }

    private void buildUsingDefaults() {
        server = AppiumDriverLocalService.buildDefaultService()
                .withBasePath("/wd/hub/");
        server.start();
        server.clearOutPutStreams();
    }

    public void stop() {
        if (server != null) {
            TestLog.log().debug("Stop running Appium server");
            server.stop();
            TestLog.log().debug("Appium server stopped");
        }
    } //Kill existing process in linux : pkill -9 -f appium


    /**
     * Apiium CLI Server command to automatically manage driver :appium --allow-insecure chromedriver_autodownload
     */
    private void buildAppiumForAndroid(int portNumber) {
        TestLog.log().debug("Starting the Appium Server");
        server = AppiumDriverLocalService.buildService(new AppiumServiceBuilder()
                .withArgument(GeneralServerFlag.BASEPATH, "wd/hub")
                .usingPort(portNumber)
                .withArgument(GeneralServerFlag.SESSION_OVERRIDE)
                .withArgument(GeneralServerFlag.RELAXED_SECURITY)
                .withArgument(GeneralServerFlag.ALLOW_INSECURE, "chromedriver_autodownload")
                .withLogFile(new File("target/logs/server.log")));
        server.start();
        server.clearOutPutStreams();
    }

    private void buildAppiumForiOS(int portNumber) {
        TestLog.log().debug("Starting the Appium Server");
        server = AppiumDriverLocalService.buildService(new AppiumServiceBuilder()
                .withArgument(GeneralServerFlag.BASEPATH, "wd/hub")
                .usingPort(portNumber)
                .withArgument(GeneralServerFlag.SESSION_OVERRIDE)
                .withLogFile(new File("target/logs/server.log")));
        server.start();
        server.clearOutPutStreams();
    }

    public boolean isRunning(int port) {
        boolean runflag = false;
        ServerSocket socket;
        try {
            socket = new ServerSocket(port);
            socket.close();
        } catch (IOException e) {
            TestLog.log().warn("Server is already running on port: {}", port);
            runflag = true;
        }
        return runflag;
    }

    public boolean isRunning() {
        return isRunning(4723);
    }
}
