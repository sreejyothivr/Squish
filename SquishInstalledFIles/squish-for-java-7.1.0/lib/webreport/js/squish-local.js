/**
 * Copyright (C) 2015 - 2021 froglogic GmbH.
 * Copyright (C) 2022 The Qt Company Ltd.
 */

function hashHandling(data) {
    // Bind an event to window.onhashchange that, when the hash changes

    // the proper tests (or subset of tests) is displayed

    $(window).bind('hashchange', function(e) {
        var hash = location.hash;
        var testHash = getValueFromHash(hash, "test");

        squishTitle = $('#squishTitle');
        squishTitle.hide();
        if (testHash == "") {
            squishTitle.html($("<a>").attr("href", window.location.href).text("All Suites"));
            colourTestTitle(squishTitle, data.status);
            $('#squishResults').html(renderContent(data.tests, ""));
            activatePopups();
            accordianHandling();
            activateUI();
        } else {
            var uri = window.location.href.split("#")[0];
            $('#squishTitle').html($("<a>").attr("href", uri).text("All Suites"));
            $('#squishResults').fadeOut(300, function() {
                var id = testHash;
                var nested = id.split("-");
                nested.shift();
                var nested_tests = data;
                var newHash = "";
                for (var n in nested) {
                    nested_tests = nested_tests.tests[nested[n]];
                    newHash = newHash + "-" + nested[n];
                    $('#squishTitle').append(" > ").append($("<a>").attr("href", uri + "#test=" + newHash).text(nested_tests.name));
                    testStatus = nested_tests.status;
                }
                colourTestTitle(squishTitle, testStatus);


                $('#squishResults').html(renderContent(nested_tests.tests, id)).fadeIn(300, function() {
                    activatePopups();
                    accordianHandling();
                    activateUI();
                });
            });
        }
        $('#squishTitle').fadeIn(300);
    });

    // Since the event is only triggered when the hash changes, we need to trigger

    // the event now, to handle the hash the page may have loaded with.

    $(window).trigger('hashchange');

}

/* Merge data table containing results from singe test suite execution
   into one object with version property and tests table with results */
function mergeSingleResults(data, version) {
    var mergedData = {};
    mergedData.version = version;
    mergedData.tests = [];
    for (var i in data) {
        if ((data[i].version.major == version.major) && (data[i].version.minor <= version.minor))
            mergedData.tests.push(data[i].tests[0]);
    }
    return mergedData;
}

function dataErrorMessage() {
    $("#squishTestReport").children().hide();
    var errorMsgBox = $("<div>").addClass("ui error message");
    var errorMsg = $("<i>").addClass("warning circle icon");
    errorMsgBox.append(errorMsg);
    errorMsgBox.append("This report does not contain data file data/results-v1.js with test results or this file is corrupted. Please ensure that Web Report was generated properly using squishrunner with the 'html' report generator option. If the problem still persists please contact Squish Support (squish@froglogic.com) and attach the zipped report directory.");
    $("#squishTestReport").append(errorMsgBox);
}

$(document).ready(function() {

    // data is loaded in index.html via scripting data/results-v1.js
    if (typeof data === 'undefined') {
        dataErrorMessage();
    }
    var supportedVersion = { "major": 1, "minor": 2 };
    results = mergeSingleResults(data, supportedVersion);
    if (results.tests.length == 0) {
        dataErrorMessage();
    } else {
        setLastExecution(results.tests);
        if (isRetryUsed(results.tests)) {
            $('#squishFiltersCheckboxList').append("<div class='ui checkbox'>\
                                                    <input type='checkbox' id='showLast' name='fun' checked>\
                                                    <label>Last retry</label>\
                                                    </div>");
        }
        setStatus(results.tests);
        setOverallStatus(results);
        buildSummaryAndFilters(results);
        hashHandling(results);
        $('.ui.checkbox').checkbox();
        activateUI();
    }
});