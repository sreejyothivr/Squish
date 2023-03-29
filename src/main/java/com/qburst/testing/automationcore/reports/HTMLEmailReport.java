package com.qburst.testing.automationcore.reports;

import com.qburst.testing.automationcore.Constants;
import com.qburst.testing.automationcore.utils.EmailUtil;
import com.qburst.testing.automationcore.utils.FileOps;
import com.qburst.testing.automationcore.utils.TestLog;
import org.apache.commons.mail.EmailException;

import java.util.HashMap;
import java.util.Map;

public class HTMLEmailReport {

    private static final String FILEPATH = System.getProperty("user.dir") + "/target/html-email-report.html";
    private static final String FAILED = "failed";
    private static final String PASSED = "passed";

    private static String suiteName;
    private static ThreadLocal<Integer> id = new ThreadLocal<>();

    public static Integer getId() {
        return id.get();
    }

    public static void setId(Integer id) {
        HTMLEmailReport.id.set(id);
    }

    private static Map<Integer, Map<String, String>> htmlModuleMap = new HashMap<>();

    private HTMLEmailReport() {
    }

    public static String getReporter() {
        String reportTemplateString = FileOps.readFileAsString(HTMLEmailReport.class.getClassLoader().getResource("HTMLEmailTemplate.html").getPath());
        StringBuilder tableStringBld = new StringBuilder();
        for (Map.Entry<Integer, Map<String, String>> entry :
                htmlModuleMap.entrySet()) {
            int threadId = entry.getKey();
            tableStringBld
                    .append("<tr style=\"text-align:center; vertical-align:middle\">")
                    .append(getCellString(htmlModuleMap.get(threadId).get("modulename")))
                    .append(getCellString(htmlModuleMap.get(threadId).get("testcount")))
                    .append(getCellString(String.valueOf(getCount(threadId, PASSED))))
                    .append(getCellString(String.valueOf(getCount(threadId, FAILED))))
                    .append(getCellString(String.valueOf(getCount(threadId, "skipped"))))
                    .append(getCellString(htmlModuleMap.get(threadId).get("status")))
                    .append("</tr>");
        }
        return reportTemplateString
                .replace("<!--PROJECTNAME-->", Constants.PROJECT_NAME)
                .replace("<!--SUITENAME-->", suiteName)
                .replace("<!--TOTALTEST-->", String.valueOf(htmlModuleMap.size()))
                .replace("<!--TOTALTESTCASES-->", String.valueOf(getTotalCount("testcount")))
                .replace("<!--TOTALPASSTESTCASES-->", String.valueOf(getTotalCount(PASSED)))
                .replace("<!--TOTALFAILTESTCASES-->", String.valueOf(getTotalCount(FAILED)))
                .replace("<!--TOTALSKIPTESTCASES-->", String.valueOf(getTotalCount("skipped")))
                .replace("<!--TABLECONTENT-->", tableStringBld.toString());
    }

    public static void setSuiteName(String suiteName) {
        HTMLEmailReport.suiteName = suiteName;
    }

    public static synchronized void startTest() {
        Map<String, String> htmlModuleStatusMap = new HashMap<>();
        if (!existingId())
            setId(getCurrentThreadId());
        else setId(createNewId());
        htmlModuleMap.put(getId(), htmlModuleStatusMap);

    }

    public static void addModule(String moduleName) {
        htmlModuleMap.get(getId()).put("modulename", moduleName);
    }

    public static void addCount(String countHeader) {
        int count = getCount(getId(), countHeader) + 1;
        htmlModuleMap.get(getId()).put(countHeader.toLowerCase(), String.valueOf(count));
    }

    private static Integer getCount(int threadId, String countHeader) {
        if (htmlModuleMap.get(threadId).get(countHeader.toLowerCase()) != null)
            return Integer.parseInt(htmlModuleMap.get(threadId).get(countHeader.toLowerCase()));
        return 0;
    }

    private static Integer getTotalCount(String countHeader) {
        int totalCount = 0;
        for (Map.Entry<Integer, Map<String, String>> entry :
                htmlModuleMap.entrySet()) {
            int threadId = entry.getKey();
            totalCount += getCount(threadId, countHeader);
        }
        return totalCount;
    }

    private static Integer getCurrentThreadId() {
        return (int) Thread.currentThread().getId();
    }

    public static void addstatus() {
        String status;
        if (getCount(getId(), FAILED) > 0)
            status = "Failed";
        else status = "Passed";
        htmlModuleMap.get(getId()).put("status", status);
    }

    public static void flush() {
        FileOps.saveStringIntoFile(getReporter(), FILEPATH);
        if (Constants.HTML_EMAIL_REPORT_FLAG.equalsIgnoreCase("true")) {
            try {
                EmailUtil.sendHTMLEmail(getReporter());
            } catch (EmailException e) {
                TestLog.log().error("Failed to send email report", e);
            }
        }
    }


    private static String getCellString(String cellVal) {
        String bgcolor = "#f4f6f7";
        if (cellVal.equalsIgnoreCase(FAILED))
            bgcolor = " #ec7063";
        if (cellVal.equalsIgnoreCase(PASSED))
            bgcolor = " #82e0aa";
        return String.format("<td bgcolor=\"%s\"><p>%s</p></td>", bgcolor, cellVal);
    }

    private static Integer createNewId() {
        return getId() + 1;
    }

    private static boolean existingId() {
        try {
            return htmlModuleMap.containsKey(getId());
        } catch (NullPointerException ignore) {
            return false;
        }

    }

}
