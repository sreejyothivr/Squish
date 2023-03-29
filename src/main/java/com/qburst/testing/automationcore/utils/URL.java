package com.qburst.testing.automationcore.utils;

public class URL {

    private URL() {
    }

    public static String appendURI(String baseURL, String uri){
        return String.format("%s/%s",baseURL,uri).replaceAll("(?<!http:|https:)//", "/");
    }
}
