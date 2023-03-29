<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents.</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
    <li><a href="#usage">Usage</a></li>
    <li><a href="#roadmap">Roadmap</a></li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#contact">Contact</a></li>
    <li><a href="#acknowledgments">Acknowledgments</a></li>
  </ol>
</details>


<!-- ABOUT THE PROJECT -->
## About The Project

**QTAF_Selenium_Cucumber_TestNG_Maven**
<p>It is a java-maven based core code base for Test Automation with below tools,technology and framework support:</p>
<h4>Tools and Technologies</h4>
<ol>
<li>Web Testing - Selenium(Ready to use)</li>
<li>Mobile Testing - Appium(Under Construction)</li>
<li>API Testing - RestAssured(Under Construction)</li>
</ol>
<h4>Framework Support</h4>
<ol>
<li>TestNG(Ready to use)</li>
<li>Cucumber(Under Construction)</li>
</ol>


## Getting Started

### Prerequisites
<p>Please make sure to install the below software inorder to use the QTAF_Selenium_Cucumber_TestNG_Maven framework</p>
<ol>
<li>Java: jdk 17(Latest LTS Version)</li>
<li>Maven: 3 or above</li>
<li>Eclipse/IntelliJ IDEA Community Edition</li>
<li>Git(optional): 2 or above</li>
</ol>

### Installation
<p>Download project in your local machine and Import Project as existing maven project in your IDE. </p>
<p>or</p>
<p>Clone this project using the below Git Command and Import Project as existing maven project in your IDE</p>

## Usage

### Execution
<ol>
<li>To run the template test suite located in src/test/resources/com/qburst/testing/automationcore/testng in the default chrome browser, please run the below maven command
<p>mvn clean test -Dtestng.suitexml=tesla_bvt_test.xml</p>
</li>
<li>Below Test Reports are generated.
<p>An Extent report with detailed test execution summary and logs at target/extent-report.html</p>
<p>An emailable html report with summary of test execution at target/html-email-report.html</p>
</li>
</ol>

### TestNG Suite xml
<p>TestNG suite xml has to be located at src/test/resources/com/qburst/testing/automationcore/testng/</p>

### Test Configuration
<p>Test Execution Configuration properties are placed in src/test/resources/testconfig.properties</p>

### Test Cases
<p>Test Cases has to be maintained in src/test/java/com/qburst/testing/automationcore/testng</p>

### Object Repository
<p>Pages, Objects and its Actions are maintained in the POM Repository : src/test/java/com/qburst/testing/automationcore/pagemodels/web/page</p>


## Roadmap

## Contributing

## Contact

## Acknowledgments

<p align="right">(<a href="#top">back to top</a>)</p>
