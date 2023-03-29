package com.qburst.testing.automationcore.selenium.mobile.platforms;

import java.util.List;

public class Platform {
    private String name;
    private List<Device> devices;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public List<Device> getDevices() {
        return devices;
    }

    public Device getDevice(String deviceName){
        for (Device device : devices) {
            if (device.getName().equals(deviceName)) return device;
        }
        return null;
    }

    public void setDevices(List<Device> devices) {
        this.devices = devices;
    }


}
