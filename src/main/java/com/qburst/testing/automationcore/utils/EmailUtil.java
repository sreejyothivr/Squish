package com.qburst.testing.automationcore.utils;

import com.qburst.testing.automationcore.Constants;
import org.apache.commons.mail.DefaultAuthenticator;
import org.apache.commons.mail.EmailException;
import org.apache.commons.mail.HtmlEmail;

public class EmailUtil {

    public static void sendHTMLEmail(String html) throws EmailException {
            HtmlEmail email = new HtmlEmail();
            email.setHostName(Constants.EMAIL_HOST);
            email.setSmtpPort(465);
            email.setAuthenticator(new DefaultAuthenticator(Constants.EMAIL_AUTH_NAME, Constants.EMAIL_AUTH_PWD));
            email.setSSLOnConnect(true);
            email.addTo(Constants.EMAIL_TO_EMAIL, Constants.EMAIL_TO_NAME);
            email.setFrom(Constants.EMAIL_FROM_EMAIL, Constants.EMAIL_FROM_NAME);
            email.setSubject(Constants.EMAIL_SUBJECT);

            // set the html message
            email.setHtmlMsg(html);

            // set the alternative message
            email.setTextMsg("Your email client does not support HTML messages");

            // send the email
            email.send();

    }
}
