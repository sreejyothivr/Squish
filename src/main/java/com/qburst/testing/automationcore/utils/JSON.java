package com.qburst.testing.automationcore.utils;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.qburst.testing.automationcore.FrameworkException;

import java.io.IOException;
import java.io.InputStream;

public class JSON {

    private JSON() {
    }

    public static <T> T loadJSONAsObject(Class<T> tClass, InputStream inputStream) {
        try {
            ObjectMapper objectMapper = new ObjectMapper();
            return objectMapper.readValue(inputStream, tClass);
        } catch (IOException e) {
            TestLog.log().fatal("Failed to load locator file, please verify locator file against the class {}",tClass);
            throw new FrameworkException("Failed to load locator file, please verify locator file against the class",e);
        }
    }
}
