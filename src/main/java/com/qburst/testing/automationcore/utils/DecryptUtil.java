package com.qburst.testing.automationcore.utils;

import org.apache.commons.codec.binary.Base64;

import javax.crypto.BadPaddingException;
import javax.crypto.Cipher;
import javax.crypto.IllegalBlockSizeException;
import javax.crypto.NoSuchPaddingException;
import javax.crypto.spec.SecretKeySpec;
import java.security.InvalidKeyException;
import java.security.Key;
import java.security.NoSuchAlgorithmException;

public class DecryptUtil {
    private static final String ALGO = "AES";

    private static final byte[] keyValue = new byte[] { 'm', 'Y', 'p', 'U', 'b', 'l', 'I', 'c', 'k', 'E', 'y', 'n', 'A',
            'e', 'E', 'M' };

    private DecryptUtil() {
    }

    public static String decrypt(String encryptedData) throws NoSuchPaddingException, NoSuchAlgorithmException, InvalidKeyException, IllegalBlockSizeException, BadPaddingException {
        Key key = generateKey();
        Cipher c = Cipher.getInstance(ALGO);
        c.init(Cipher.DECRYPT_MODE, key);
//        byte[] decordedValue = new BASE64Decoder().decodeBuffer(encryptedData);
        byte[] decordedValue = Base64.decodeBase64(encryptedData);
        byte[] decValue = c.doFinal(decordedValue);
        System.out.println(decValue);
        return new String(decValue);
    }

    private static Key generateKey() {
        return new SecretKeySpec(keyValue, ALGO);
    }

    public static String encrypt(String data) throws NoSuchPaddingException, NoSuchAlgorithmException, InvalidKeyException, IllegalBlockSizeException, BadPaddingException {
        Key key = generateKey();
        System.out.println(key);
        Cipher c = Cipher.getInstance(ALGO);
        System.out.println(c);
        c.init(Cipher.ENCRYPT_MODE, key);
        byte[] encVal = c.doFinal(data.getBytes());
        System.out.println(encVal);
//        String encryptedValue = new BASE64Encoder().encode(encVal);
        byte[] encryptedValue = Base64.decodeBase64(encVal);
        System.out.println(encryptedValue);
        return new String(encryptedValue);
    }
}
