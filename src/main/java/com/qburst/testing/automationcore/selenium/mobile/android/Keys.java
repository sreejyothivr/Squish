package com.qburst.testing.automationcore.selenium.mobile.android;

import io.appium.java_client.android.nativekey.AndroidKey;
import io.appium.java_client.android.nativekey.KeyEvent;

public class Keys {

    public static KeyEvent get(char inputchar){
        switch (String.valueOf(inputchar)){
            case "a":return new KeyEvent().withKey(AndroidKey.A);
            case "b":return new KeyEvent().withKey(AndroidKey.B);
            case "c":return new KeyEvent().withKey(AndroidKey.C);
            case "d":return new KeyEvent().withKey(AndroidKey.D);
            case "e":return new KeyEvent().withKey(AndroidKey.E);
            case "f":return new KeyEvent().withKey(AndroidKey.F);
            case "g":return new KeyEvent().withKey(AndroidKey.G);
            case "h":return new KeyEvent().withKey(AndroidKey.H);
            case "i":return new KeyEvent().withKey(AndroidKey.I);
            case "j":return new KeyEvent().withKey(AndroidKey.J);
            case "k":return new KeyEvent().withKey(AndroidKey.K);
            case "l":return new KeyEvent().withKey(AndroidKey.L);
            case "m":return new KeyEvent().withKey(AndroidKey.M);
            case "n":return new KeyEvent().withKey(AndroidKey.N);
            case "o":return new KeyEvent().withKey(AndroidKey.O);
            case "p":return new KeyEvent().withKey(AndroidKey.P);
            case "q":return new KeyEvent().withKey(AndroidKey.Q);
            case "r":return new KeyEvent().withKey(AndroidKey.R);
            case "s":return new KeyEvent().withKey(AndroidKey.S);
            case "t":return new KeyEvent().withKey(AndroidKey.T);
            case "u":return new KeyEvent().withKey(AndroidKey.U);
            case "v":return new KeyEvent().withKey(AndroidKey.V);
            case "w":return new KeyEvent().withKey(AndroidKey.W);
            case "x":return new KeyEvent().withKey(AndroidKey.X);
            case "y":return new KeyEvent().withKey(AndroidKey.Y);
            case "z":return new KeyEvent().withKey(AndroidKey.Z);

            default:throw new RuntimeException(String.format("The key %c is not a valid AndroidKeyField",inputchar));
        }
    }
}
