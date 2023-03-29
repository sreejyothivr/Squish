package com.qburst.testing.automationcore.utils;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.type.CollectionType;
import com.fasterxml.jackson.dataformat.xml.XmlMapper;
import com.qburst.testing.automationcore.FrameworkException;

import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;

public class XML {

    /**
     * Load a xml file into a class
     * @param tClass : target class
     * @param inputStream : input stream to the source xml file
     * @return object of target class
     */
    public static <T> List<T> loadXMLAsObject(Class<T> tClass, InputStream inputStream) {
        try {
            ObjectMapper mapper = new XmlMapper();
            CollectionType listType =
                    mapper.getTypeFactory().constructCollectionType(ArrayList.class, tClass);
            List<T> tList = mapper.readValue(inputStream,listType);
            return tList;
        } catch (IOException e) {
            throw new FrameworkException("Failed to load the xml file into the class, please verify the xml schema against the class",e);
        }
    }



}
