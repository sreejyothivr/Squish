/**
 * Copyright (C) 2015 - 2021 froglogic GmbH.
 * Copyright (C) 2022 The Qt Company Ltd.
 */
function EJStemplates() {

    EJStemplates.statusEnum = {
		EXPECTED_SKIPPED: 0,
        PASS: 1,
        SKIPPED: 2,
        WARNING: 3,
        FAIL: 4
    }

    EJStemplates.entityMap = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;"
    };

    EJStemplates.escapeHtml = function(string) {
        return String(string).replace(/[&<>]/g, function(s) {
            return EJStemplates.entityMap[s];
        });
    }

    EJStemplates.escapeRegExp = function(str) {
        return str.replace(/[\-\[\]\{\}\(\)\*\+\?\^\$\|]/g, "\\$&");
    }

    EJStemplates.makeClickableLinks = function(string) {
        var matchedURLs = []
        var re = /((http|https|ftp|file):\/\/\S+)(\s|$)/g;
        while ((result = re.exec(string)) != null) {
            matchedURLs.push(result[1]);
        }

        // Remove duplicates
        var uniqueMatchedURLs = [];
        $.each(matchedURLs, function(i, el) {
            if ($.inArray(el, uniqueMatchedURLs) === -1) uniqueMatchedURLs.push(el);
        });

        for (var i = 0; i < uniqueMatchedURLs.length; i++) {
            var string = string.replace(new RegExp(EJStemplates.escapeRegExp(uniqueMatchedURLs[i]), 'g'), "<a href=\"" + uniqueMatchedURLs[i] + "\">" + uniqueMatchedURLs[i] + "</a>");
        }

        return string;
    }

    EJStemplates.getTime = function(d) {
        var h = addZero(d.getHours());
        var m = addZero(d.getMinutes());
        var s = addZero(d.getSeconds());
        return h + ":" + m + ":" + s;
    }

    EJStemplates.getColor = function(status, type) {
        if ((status == statusEnum.PASS) && ((type == "msg") || (type == "uicoverage"))) {
            color = "log";
        } else if (status == statusEnum.PASS) {
            color = "pass";
        } else if (status == statusEnum.FAIL) {
            color = "fail";
        } else if (status == statusEnum.WARNING) {
            color = "warning";
        } else if ((status == statusEnum.SKIPPED)||(status == statusEnum.EXPECTED_SKIPPED)) {
            color = "skipped"
        }
        return color;
    }

    EJStemplates.getIcon = function(status, type) {
        if ((status == statusEnum.PASS) && ((type == "msg") || (type == "uicoverage"))) {
            icon = "file text outline";
        } else if (status == statusEnum.PASS) {
            icon = "green checkmark";
        } else if (status == statusEnum.FAIL) {
            icon = "red warning circle";
        } else if (status == statusEnum.WARNING) {
            icon = "darkyellow warning";
        }
        return icon;
    }

    EJStemplates.typePrint = function(type) {
        // As name of test suite starts with suite_ and test case with tst_
        // there is no need to provice test type before it's name
        type = type.charAt(0).toUpperCase() + type.substring(1);
        if (type == "Scenariooutline") {
            type = "Scenario Outline";
        }

        if ((type != 'Testsuite') && (type != 'Testcase')) {
            return type + ": ";
        }
        return "";
    }

    EJStemplates.subTypePrint = function(type) {
        // As name of test suite starts with suite_ and test case with tst_
        // there is no need to provice test type before it's name
        type = type.charAt(0).toUpperCase() + type.substring(1);
        if (type == 'Testcase') type = 'Test Case';
        return type + "(s)";
    }

    EJStemplates.removeXprotocol = function(uri) {
        return uri.replace('x-testsuite:/', '').replace('x-testcase:/', '');
    }

    this.desktopScreenshot = "<i class='file image outline link icon screenshot' data-img-url='<%= imgDesktopUrl %>'></i>";




    this.scriptedRes = "<span class='suiteHeader <%=EJStemplates.getColor(status,type)%> suiteHeader_l<%= level %> small smallsize1'>\
                        <div class='ui three column grid'>\
                        <div class='two wide column'>\
                        <i class='<%=EJStemplates.getIcon(status,type)%> icon details'></i>\
                        <div class='ui flowing popup'>\
                        <table class='ui definition single line table'>\
                        <tbody>\
                        <% if(typeof uri !== 'undefined'){ %>\
                            <tr>\
                            <td>Location</td>\
                            <td> <%= EJStemplates.removeXprotocol(uri) %>:<%=  (typeof lineNo === 'undefined') ? '' : lineNo %></td>\
                            </tr>\
                        <% } %>\
                        <tr>\
                        <td>Date</td>\
                        <td><%= new Date(time).toString() %></td>\
                        </tr>\
                        </tbody>\
                        </table>\
                        </div><%= result %> <span class='time'><%=EJStemplates.getTime(new Date(time))%></span></div>\
                        <div class='seven wide column'>\
                        <% if(typeof screenshotUri !== 'undefined'){\
                            imgDesktopUrl = 'data/'+screenshotUri.replace('x-results:/',''); %>\
                            <%= new EJS({text: new EJStemplates().desktopScreenshot}).render(imgDesktopUrl) %>\
                        <% } %>\
                        <span class='whitespace-pre'><%=(typeof text === 'undefined') ? '' : EJStemplates.makeClickableLinks(EJStemplates.escapeHtml(text))%></span>\
                        </div>\
                        <div class='seven wide column whitespace-pre'><%=(typeof detail === 'undefined') ? '' : EJStemplates.makeClickableLinks(EJStemplates.escapeHtml(detail))%></div>\
                        </div>\
                        </span>";

    this.message = "<span class='suiteHeader <%= EJStemplates.getColor(status,type) %> suiteHeader_l<%= level %> small smallsize1'>\
                    <div class='ui three column grid'>\
                    <div class='two wide column'>\
                    <i class='<%= EJStemplates.getIcon(status,type) %> icon details'></i>\
                    <div class='ui flowing popup'>\
                    <table class='ui definition single line table'>\
                    <tbody>\
                    <tr>\
                    <td>Location</td>\
                    <td> <%=  (typeof uri === 'undefined') ? '' : EJStemplates.removeXprotocol(uri) %>:<%=  (typeof lineNo === 'undefined') ? '' : lineNo %></td>\
                    </tr>\
                    <tr>\
                    <td>Date</td>\
                    <td><%= new Date(time).toString() %></td>\
                    </tr>\
                    </tbody>\
                    </table>\
                    </div><%= result %> <span class='time'><%=EJStemplates.getTime(new Date(time))%></span></div>\
                    <div class='seven wide column whitespace-pre'><%= (typeof text === 'undefined') ? '' : EJStemplates.makeClickableLinks(EJStemplates.escapeHtml(text)) %></div>\
                    <div class='seven wide column'>\
                    <% if(typeof screenshotUri !== 'undefined'){\
                        imgDesktopUrl = 'data/'+screenshotUri.replace('x-results:/',''); %>\
                        <%= new EJS({text: new EJStemplates().desktopScreenshot}).render(imgDesktopUrl) %>\
                    <% } %>\
                    <span class='whitespace-pre'><%=(typeof detail === 'undefined') ? '' : EJStemplates.escapeHtml(detail)%></span>\
                    </div>\
                    </div>\
                    </span>";

    this.uiCoverage = "<span class='suiteHeader <%= EJStemplates.getColor(status,type) %> suiteHeader_l<%= level %> small smallsize1'>\
                    <div class='ui three column grid'>\
                    <div class='two wide column'>\
                    <i class='<%= EJStemplates.getIcon(status,type) %> icon details'></i>\
                    <div class='ui flowing popup'>\
                    <table class='ui definition single line table'>\
                    <tbody>\
                    <tr>\
                    <td>Date</td>\
                    <td><%= new Date(time).toString() %></td>\
                    </tr>\
                    </tbody>\
                    </table>\
                    </div></div>\
                    <div class='seven wide column'>UI Coverage</div>\
                    <div class='seven wide column'>\
                    <% if(typeof uri !== 'undefined'){\
                        var xmlName = uri.replace('x-results:/','');\
                        var uiCoverageXml = 'data/'+xmlName;%>\
                        <a class='covlink' href='<%= uiCoverageXml %>'><%= xmlName %></a>\
                    <% } %>\
                    </div>\
                    </div>\
                    </span>";

    this.objectPropertyRes = " <span class='suiteHeader <%= EJStemplates.getColor(status,type) %> suiteHeader_l<%= level %> small smallsize1'>\
                                <div class='ui three column grid'>\
                                <div class='two wide column'>\
                                <i class='<%= EJStemplates.getIcon(status,type) %> icon details'></i>\
                                <div class='ui flowing popup'>\
                                <table class='ui definition single line table'>\
                                <tbody>\
                                <tr>\
                                <td>Location</td>\
                                <td><%= EJStemplates.removeXprotocol(uri) %></td>\
                                </tr>\
                                <td>Object</td>\
                                <td><%= objectName %></td>\
                                </tr>\
                                </tr>\
                                <td>Property</td>\
                                <td><%= property %></td>\
                                </tr>\
                                </tr>\
                                <td>Expected</td>\
                                <td><%= (typeof expectedValue === 'undefined') ? '\"\"' :  expectedValue %></td>\
                                </tr>\
                                <tr>\
                                <td>Date</td>\
                                <td><%= new Date(time).toString() %></td>\
                                </tr>\
                                </tbody>\
                                </table>\
                                </div>\
                                <%= result %> <span class='time'><%=EJStemplates.getTime(new Date(time))%></span>\
                                </div>\
                                <div class='seven wide column'>\
                                <% if(typeof screenshotUri !== 'undefined'){\
                                    imgDesktopUrl = 'data/'+screenshotUri.replace('x-results:/',''); %>\
                                    <%= new EJS({text: new EJStemplates().desktopScreenshot}).render(imgDesktopUrl) %>\
                                <% } %>\
                                <span class='whitespace-pre'><%=EJStemplates.escapeHtml(text)%></span>\
                                </div>\
                                <div class='seven wide column whitespace-pre'><%= (typeof detail === 'undefined') ? '' :  EJStemplates.escapeHtml(detail) %></div>\
                                </div>\
                                </span>";

    this.titanRes = " <span class='suiteHeader <%= EJStemplates.getColor(status,type) %> suiteHeader_l<%= level %> small smallsize1'>\
                                <div class='ui three column grid'>\
                                <div class='two wide column'>\
                                <i class='<%= EJStemplates.getIcon(status,type) %> icon details'></i>\
                                <div class='ui flowing popup'>\
                                <table class='ui definition single line table'>\
                                <tbody>\
                                <tr>\
                                    <td>Location</td>\
                                    <td><%= EJStemplates.removeXprotocol(uri) %>:<%= lineNo %></td>\
                                </tr>\
                                    <td>Object</td>\
                                    <td><%= objectName %></td>\
                                </tr>\
                                </tr>\
                                    <td>VP</td>\
                                    <td><%= EJStemplates.removeXprotocol(vpUri) %></td>\
                                </tr>\
                                <tr>\
                                    <td>Date</td>\
                                    <td><%= new Date(time).toString() %></td>\
                                </tr>\
                                </tbody>\
                                </table>\
                                </div>\
                                <%= result %> <span class='time'><%=EJStemplates.getTime(new Date(time))%></span>\
                                </div>\
                                <div class='seven wide column'>\
                                <% if(typeof screenshotUri !== 'undefined'){\
                                    imgDesktopUrl = 'data/'+screenshotUri.replace('x-results:/',''); %>\
                                    <%= new EJS({text: new EJStemplates().desktopScreenshot}).render(imgDesktopUrl) %>\
                                <% } %>\
                                <span class='whitespace-pre'><%=EJStemplates.escapeHtml(text)%></span>\
                                </div>\
                                <div class='seven wide column'>\
                                    <% if(typeof failedObjectDump !== 'undefined'){\
                                        failedObjectDumpUrl = 'data/'+failedObjectDump.replace('x-results:/',''); %>\
                                        <i class='file outline link failedObjectDump icon' data-xml-url='<%= failedObjectDumpUrl %>'></i>\
                                    <% } %>\
                                    <span class='whitespace-pre'><%= (typeof detail === 'undefined') ? '' :  EJStemplates.escapeHtml(detail) %></span>\
                                </div>\
                                </div>\
                                </span>";


    this.testTitle = "<% \
    var subType = getFirstSubType(tests);\
    var subElem = 0;\
    var fcount = 0;\
    var scount = 0;\
    var result = '';\
    if (isComplex(tests) && isHomogeneous(tests)){\
        for (var i in tests){\
            if(typeof tests[i].tests !== 'undefined'){\
                if (typeof tests[i].last==='undefined' || tests[i].last==true){\
                subElem += 1;}\
                if ((tests[i].status == EJStemplates.statusEnum.FAIL)\
                && (typeof tests[i].last==='undefined' || tests[i].last==true  ) )\
                    fcount += 1;\
                else if (tests[i].status == EJStemplates.statusEnum.SKIPPED)  \
                    scount += 1;\
            }\
        }\
    }\
    else { \
        subType = 'Verification';\
        subElem = countVerifications(tests, 'any');\
        fcount = countVerifications(tests, EJStemplates.statusEnum.FAIL);\
        for (var i in tests){\
            if ((tests[i].result == 'FATAL')||(tests[i].result == 'ERROR')){\
                result = tests[i].result;\
                break;\
            }\
        }\
    }\
    var pcount = subElem - fcount - scount;\
    var procNum = 100;\
    if(subElem>0){\
        procNum = Math.floor((pcount/subElem)*100);\
    } \
    if ((result=='FATAL')||(result=='ERROR'))\
        procNum = 0;\
    var bigsize = 'bigsize0';\
    var mediumsize = 'mediumsize0';\
    var smallsize = 'smallsize0';\
    if(level>0){\
        bigsize = 'bigsize1';\
        mediumsize = 'mediumsize1';\
        smallsize = 'smallsize1';\
    }\
%>\
    <span class='suiteHeader <%= EJStemplates.getColor(status,type) %> suiteHeader_l<%= level %>'>\
        <span class='proc'>\
		    <% if((subElem != 0)||((status!=EJStemplates.statusEnum.SKIPPED)&&(status!=EJStemplates.statusEnum.EXPECTED_SKIPPED))){ %>\
            <span class='big <%= bigsize %>'><%= procNum %></span>\
                <span class='small <%= smallsize %>'>%</span>\
            </span>\
			<% } else {%>\
	            <span class='big <%= bigsize %>'></span>\
                <span class='small <%= smallsize %>'></span>\
            </span>\
			<% } %>\
			<span class='failures <%= smallsize %>'>\
                    <% if(result == '') { \
                        if((status!=EJStemplates.statusEnum.SKIPPED) || (subElem != 0) ){%>\
                        <span class='big'><%= subElem %></span>\
                        <span class='small'><%= EJStemplates.subTypePrint(subType) %></span>\
                        <% }\
                        if(fcount>0) { %>\
                        <span class='fcount'>\
                        <span class='big'><%= fcount %></span>\
                        <span class='small'>failed</span>\
                        </span>\
                        <% }\
                        if(scount>0) { %>\
                        <span class=\"skippedColor\">\
                        (<span class='big'><%= scount %></span>\
                        <span class='small'>skipped</span>)\
                        </span>\
                        <% }\
                    } else { %>\
                        <span class='small <%= smallsize %> fcount'><%= result %></span>\
                        <% } %>\
                        </span>\
                        <% if(tests.length>0){ %> \
                        <i class='chevron right black icon'></i>\
                        <% } else {%>\
                        <i class='chevron right black icon disabled'></i>\
                        <% } %> \
                        <span class='name small <%= smallsize %>'> \
		<%= EJStemplates.typePrint(type) %><%= EJStemplates.escapeHtml(name) %>\
        <% if (typeof retry!== 'undefined') { %>\
            (retry:<%= retry.count %>)\
        <% } %>\
	<% if(tests.length>0){ %>\
	   <i class='icon expand toparrow'></i>\
	<% } %>\
	</span>\
	<% if((typeof summary !== 'undefined')||((typeof description !== 'undefined'))){ %>\
		<div class='ui flowing popup'>\
        	<table class='ui definition table'>\
              <tbody>\
              <% if(typeof summary !== 'undefined'){ %>\
                <tr>\
                  <td>Summary</td>\
                  <td><%= summary %></td>\
                </tr>\
               <% } %>\
              <% if(typeof description !== 'undefined'){ %>\
                <tr>\
                  <td>Description</td>\
                  <td><%= description %></td>\
                </tr>\
               <% } %>\
            </tbody>\
            </table>\
        </div>\
     <% } %>\
	<span class='duration small <%= smallsize %>'><%= formatDiff((new Date(stop).getTime()-new Date(start).getTime())/1000) %></span>\
     </span>";

    this.screenshotRes = "<%\
    if(typeof failedImageUri !== 'undefined')\
        imgUrl = 'data/'+failedImageUri.replace('x-results:/','');\
    %>\
    <span class='suiteHeader <%= EJStemplates.getColor(status,type) %> suiteHeader_l<%= level %> small smallsize1'>\
    <div class='ui three column grid'>\
            <div class='two wide column'>\
                <i class='<%= EJStemplates.getIcon(status,type) %> icon details'></i>\
                <div class='ui flowing popup'>\
                    <table class='ui definition single line table'>\
                        <tbody>\
                            <tr>\
                                <td>Object</td>\
                                <td><%= objectName %></td>\
                            </tr>\
                            <tr>\
                                 <td>Location</td>\
                                 <td> <%= EJStemplates.removeXprotocol(uri) %></td>\
                            </tr>\
                            <tr>\
                                  <td>Date</td>\
                                  <td><%= new Date(time).toString() %></td>\
                            </tr>\
                        </tbody>\
                    </table>\
                    </div>\
                    <%= result %> <span class='time'><%=EJStemplates.getTime(new Date(time))%></span>\
                </div>\
                <div class='seven wide column'>\
                <% if(typeof screenshotUri !== 'undefined'){\
                    imgDesktopUrl = 'data/'+screenshotUri.replace('x-results:/',''); %>\
                    <%= new EJS({text: new EJStemplates().desktopScreenshot}).render(imgDesktopUrl) %>\
                <% } %>\
                <span class='whitespace-pre'><%= EJStemplates.escapeHtml(text) %></span>\
                </div>\
                <div class='seven wide column'>\
                        <% if(status==EJStemplates.statusEnum.FAIL){ %>\
                        <i class='file image outline link icon screenshot' data-img-url='<%= imgUrl %>'></i>\
                        <% } %>\
                        <span class='whitespace-pre'><%= (typeof detail === 'undefined') ? '' :  EJStemplates.escapeHtml(detail) %></span>\
                        </div>\
                    </div>\
                </span>";

    EJStemplates.cellsToString = function(cells) {
        var rowTxt = "";
        for (var i in cells) {
            rowTxt += "\'" + cells[i].properties[0].value + "\' ";
        }
        return rowTxt;
    }

    this.tableRes = "\
        <span class='suiteHeader <%= EJStemplates.getColor(status,type) %> suiteHeader_l<%= level %> small smallsize1'>\
        <div class='ui three column grid'>\
        <div class='two wide column'>\
            <i class='<%= EJStemplates.getIcon(status,type) %> icon details'></i>\
            <div class='ui flowing popup'>\
            <table class='ui definition single line table'>\
                <tbody>\
                    <tr>\
                        <td>Location</td><td> <%= objectName %></td>\
                    </tr>\
                    <tr>\
                        <td>Date</td><td><%= new Date(time).toString() %></td>\
                    </tr>\
                </tbody>\
            </table>\
            </div>\
            <%= result %> <span class='time'><%=EJStemplates.getTime(new Date(time))%></span>\
        </div>\
        <div class='seven wide column'>\
            <% if(typeof screenshotUri !== 'undefined'){\
                imgDesktopUrl = 'data/'+screenshotUri.replace('x-results:/',''); %>\
                <%= new EJS({text: new EJStemplates().desktopScreenshot}).render(imgDesktopUrl) %>\
            <% } %>\
            <span class='whitespace-pre'><%= EJStemplates.escapeHtml(text) %></span>\
        </div>\
        <div class='seven wide column'>\
        <span class='whitespace-pre'><%= (typeof detail === 'undefined') ? '' :  EJStemplates.escapeHtml(detail) %></span>\
        <% if(typeof tablediff !== 'undefined'){\
		    for (var i in tablediff) { %>\
		    <br><%= tablediff[i].diffType %> <%= tablediff[i].elementType %> in line <%= tablediff[i].diffValue.line %>\
		    <br><%= EJStemplates.cellsToString(tablediff[i].diffValue.cells) %>\
	        <% } %>\
	    <% } %>\
	</div>\
</div>\
</span>\
";

    this.summary = "<%\
    delete startMin;\
    delete startMax;\
    for (var i in tests){\
        if ((typeof startMin === 'undefined')|| (new Date(tests[i].start).getTime < startMin.getTime()))\
            startMin = new Date(tests[i].start);\
        if ((typeof startMax === 'undefined')||(new Date(tests[i].stop).getTime > stopMax.getTime()))\
            stopMax = new Date(tests[i].stop);\
    }\
    duration = (stopMax.getTime()-startMin.getTime())/1000;\
    %>\
    <div class='ui three column grid'>\
    <div class='six wide column'>\
    <div class='ui basic horizontal segment'>\
    <table class='ui celled striped table'>\
    <thead>\
    <tr><th colspan='2'>Time data</th>\
    </tr></thead>\
    <tbody>\
     <tr>\
     <td>Start</td><td id='startTime'><%= startMin.toString() %></td>\
     </tr>\
     <tr>\
     <td>End</td><td id='stopTime'><%= stopMax.toString() %></td>\
     </tr>\
     <tr>\
     <td>Duration</td><td id='duration'><%= formatDiff(duration) %></td>\
     </tr>\
     </tbody>\
     </table>\
    </div>\
    </div>\
    <div class='five wide column'>\
    <div class='ui basic horizontal segment'>\
    <table class='ui celled table'>\
    <thead>\
    <tr><th></th>\
    <th>Test Suites</th><th>Test Cases</th>\
    </tr></thead>\
    <tbody>\
    <tr class='positive'>\
      <td><i class='icon checkmark'></i>Passes</td>\
      <td id='passTS'><%= count(tests,'TestSuite',EJStemplates.statusEnum.PASS) %></td>\
      <td id='passTC'><%= count(tests,'TestCase',EJStemplates.statusEnum.PASS) %></td>\
    </tr>\
    <tr class='warning'>\
      <td><i class='attention icon'></i>Warnings</td>\
      <td id='warnTS'><%= count(tests,'TestSuite',EJStemplates.statusEnum.WARNING) %></td>\
      <td id='warnTC'><%= count(tests,'TestCase',EJStemplates.statusEnum.WARNING) %></td>\
    </tr>\
    <tr class='error'>\
      <td><i class='warning circle icon'></i>Failures</td>\
      <td id='failTS'><%= count(tests,'TestSuite',EJStemplates.statusEnum.FAIL) %></td>\
      <td id='failTC'><%= count(tests,'TestCase',EJStemplates.statusEnum.FAIL) %></td>\
    </tr>\
    <tr class='disabled'>\
        <td><i class='warning circle icon'></i>Skipped</td>\
        <td id='disTS'><%= count(tests,'TestSuite',EJStemplates.statusEnum.SKIPPED) %></td>\
        <td id='disTC'><%= count(tests,'TestCase',EJStemplates.statusEnum.SKIPPED) %></td>\
        </tr>\
    <tr>\
      <td>Total</td>\
      <td id='totalTS'><%= count(tests,'TestSuite','any') %></td>\
      <td id='totalTC'><%= count(tests,'TestCase','any') %></td>\
    </tr>\
</tbody>\
</table>\
    </div>\
  </div>\
  <div class='five wide column'>\
      <% if(count(tests,'feature','any')>0) { %>\
    <div class='ui basic horizontal segment'>\
<table class='ui celled table'>\
  <thead>\
    <tr><th></th><th>Features</th><th>Scenarios</th><th>Steps</th>\
  </tr></thead>\
  <tbody>\
    <tr class='positive'>\
      <td><i class='icon checkmark'></i>Passes</td>\
      <td id='passFt'><%= count(tests,'feature',EJStemplates.statusEnum.PASS) %></td>\
      <td id='passSc'><%= count(tests,'scenario',EJStemplates.statusEnum.PASS) + count(tests,'row',EJStemplates.statusEnum.PASS) %></td>\
      <td id='passSt'><%= count(tests,'step',EJStemplates.statusEnum.PASS) %> </td>\
    </tr>\
    <tr class='warning'>\
      <td><i class='attention icon'></i>Warnings</td>\
      <td id='warnFt'><%= count(tests,'feature',EJStemplates.statusEnum.WARNING) %></td>\
      <td id='warnSc'><%= count(tests,'scenario',EJStemplates.statusEnum.WARNING) + count(tests,'row',EJStemplates.statusEnum.WARNING) %></td>\
      <td id='warnSt'><%= count(tests,'step',EJStemplates.statusEnum.WARNING) %></td>\
    </tr>\
    <tr class='error'>\
      <td><i class='warning circle icon'></i>Failures</td>\
      <td id='failFt'><%= count(tests,'feature',EJStemplates.statusEnum.FAIL) %></td>\
      <td id='failSc'><%= count(tests,'scenario',EJStemplates.statusEnum.FAIL) + count(tests,'row',EJStemplates.statusEnum.FAIL) %></td>\
      <td id='failSt'><%= count(tests,'step',EJStemplates.statusEnum.FAIL) %></td>\
    </tr>\
    <tr class='disabled'>\
      <td><i class='warning circle icon'></i>Skipped</td>\
      <td id='disFt'><%= count(tests,'feature',EJStemplates.statusEnum.SKIPPED) %></td>\
      <td id='disSc'><%= count(tests,'scenario',EJStemplates.statusEnum.SKIPPED) + count(tests,'row',EJStemplates.statusEnum.SKIPPED) + count(tests,'scenario',EJStemplates.statusEnum.EXPECTED_SKIPPED)%></td>\
      <td id='disSt'><%= count(tests,'step',EJStemplates.statusEnum.SKIPPED) %></td>\
    </tr>\
    <tr>\
      <td>Total</td>\
      <td id='totalFt'><%= count(tests,'feature','any') %></td>\
      <td id='totalSc'><%= count(tests,'scenario','any') + count(tests,'row','any')%></td>\
      <td id='totalSt'><%= count(tests,'step','any') %></td>\
    </tr>\
</tbody>\
</table>\
</div>\
<% } %>\
</div>\
</div>";

}