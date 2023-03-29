package com.qburst.testing.automationcore.utils;

import com.qburst.testing.automationcore.FrameworkException;
import org.apache.commons.codec.binary.Base64;
import org.apache.commons.io.FileUtils;
import org.apache.commons.io.IOUtils;

import java.io.*;

public class FileOps {

    private FileOps() {
    }

    public boolean isFileExists(String filePath){
        File file = new File(filePath);
        return file.exists();
    }

    public static boolean copyFile(File file, String imagePath) {
        try {
            FileUtils.copyFile(file, new File(imagePath));
            return true;
        } catch (IOException e) {
            throw new FrameworkException(e);
        }
    }

    public static void createDir(String outputDir) {
        File dir = new File(outputDir);
        if (!dir.exists()) dir.mkdirs();
    }

    public static boolean saveStringIntoFile(String content, String outputFilePath) {
        File file = new File(outputFilePath);
        try (
                BufferedWriter bw = new BufferedWriter(new FileWriter(file));
        ) {
            bw.write(content);
            return true;
        } catch (IOException e) {
            throw new FrameworkException(e);
        }
    }

    public static boolean saveMedia(String media, String outputFilePath) {
        try (FileOutputStream stream = new FileOutputStream(outputFilePath)) {
            stream.write(Base64.decodeBase64(media));
            return true;
        } catch (IOException e) {
            throw new FrameworkException(e);
        }
    }

    public static String readFileAsString(String filePath){
        try (BufferedReader br = new BufferedReader(new FileReader(filePath))){
            return IOUtils.toString(br);
        }catch (IOException e) {
            throw new FrameworkException(e);
        }
    }
}
