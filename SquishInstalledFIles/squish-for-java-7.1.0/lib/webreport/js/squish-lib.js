/**
 * Copyright (C) 2015 - 2021 froglogic GmbH.
 * Copyright (C) 2022 The Qt Company Ltd.
 */

var statusEnum = {
	EXPECTED_SKIPPED : 0,
    PASS: 1,	
    SKIPPED: 2,
    WARNING: 3,
    FAIL: 4
}

function addZero(i) {
    if (i < 10) {
        i = "0" + i;
    }
    return i;
}

function formatDiff(diff) {
    if (diff == 0)
        return "< 1 sec."
    else if (diff < 60)
        return diff + " sec.";
    else {
        var mins = Math.floor(diff / 60);
        var secs = diff - mins * 60;
        if (mins < 60) {
            return mins + " min. " + secs + " sec.";
        } else {
            var h = Math.floor(mins / 60);
            mins = mins - h * 60;
            return h + "h " + mins + "min. " + secs + "sec.";
        }
    }
}

// Returns keys of given array obj
function keys(obj) {
    var keys = [];

    for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
            keys.push(key);
        }
    }
    return keys;
}

function testsFromPrefix(prefix) {
    prefix = prefix.substring(1)
    var indexes = prefix.split("-");
    var tests = results;
    for (var i in indexes) {
        tests = tests.tests[indexes[i]];
    }
    return tests.tests;
}


function close_accordion_section(section) {
    $(section).find('.acc-section-title').each(function() {
        $(this).removeClass('active');
        $(this).children(".suiteHeader").each(function() {
            $(this).children(".chevron").removeClass("down").addClass("right");
        });
    });
    $(section).find('.acc-section-content').slideUp(300).removeClass('open');
}

function applyFilters() {
    $('#showLogs').trigger('change');
    $('#showPasses').trigger('change');
    $('#showLast').trigger('change');
}

function activatePopups() {
    $('.icon.details').popup({
        inline: true,
        hoverable: false,
        position: 'bottom left',
        width: '100%',
        delay: { show: 0, hide: 0 }
    });

    $('span.name').popup({
        inline: true,
        hoverable: false,
        position: 'bottom left',
        width: '100%',
        delay: { show: 500, hide: 0 }
    });
}

function generateAndOpenTest(sectionContent) {
    var prefix = sectionContent.attr('id');
    var tests = testsFromPrefix(prefix);
    sectionContent.children('.acc').remove();
    sectionContent.append(renderContent(tests, prefix));
    $('.acc #' + prefix).fadeIn(300).addClass('open');
    $(this).children(".suiteHeader").each(function() {
        $(this).children(".chevron").removeClass("right").addClass("down");
    });
}

function openFailedSections(acc) {
    $(acc).children(".failSec").each(function() {
        var sectionTitle = $(this).children(".acc-section-title");
        if (sectionTitle.length > 0) {
            var sectionContent = $(this).children(".acc-section-content");
            if (!sectionTitle.is('.active')) {
                // expand this test element
                sectionTitle.addClass('active');
                generateAndOpenTest(sectionContent);
            }
            $(this).children(".acc-section-content").not(".acc-section-details").each(function() {
                $(this).children(".acc").each(function() {
                    openFailedSections($(this));
                });
            });
        }
    });
}

function accordianHandling() {

    // Accordian handling for results
    $('#squishResults').delegate(".acc-section-title", "click", function(e) {

        if ($(this).hasClass("empty") == false) {

            // Grab current anchor value
            var currentAttrValue = $(this).attr('href');
            var title = $(e.target).closest('a');
            var section = $(title).parent();
            var sectionContent = section.children(".acc-section-content");

            if ($(e.target).hasClass("toparrow")) {
                location.hash = currentAttrValue;
            } else if (title.is('.active')) {
                close_accordion_section(section);
                sectionContent.children('.acc').remove();
            } else {
                // Add active class to section title
                $(this).addClass('active');

                // Open up the hidden content panel and change triangle/arrow to opened
                generateAndOpenTest(sectionContent);

                applyFilters();
                activatePopups();
                activateUI();

                // Expand only failed Tests (all to the bottom)
                if ($(e.target).hasClass("fcount") || $(e.target).parent().hasClass("fcount")) {
                    var acc = $(section).children(".acc-section-content").children(".acc");
                    openFailedSections(acc);
                    applyFilters();
                    activatePopups();
                    activateUI();
                }

            }
        }
        e.preventDefault();
    });

}

// Calculates status (PASS,FAIL,WARNING,SKIPPED,EXPECTED_SKIPPED) of all tests elements
function setStatus(tests) {
    var status = statusEnum.EXPECTED_SKIPPED;
    for (var i in tests) {

        // Test element does NOT include subelements
        // This might also apply to skipped Scenarios / Test Cases 
        if (!(Array.isArray(tests[i].tests) && tests[i].tests.length>0)) {

            if (tests[i].type == "msg") {
                if ((tests[i].result == "FATAL") || (tests[i].result == "ERROR"))
                    tests[i].status = statusEnum.FAIL;
                else if (tests[i].result == "WARNING")
                    tests[i].status = statusEnum.WARNING;
                else
                    tests[i].status = statusEnum.PASS;

            } else if (isVerification(tests[i])) {
                if ((tests[i].result == "FATAL") ||
                    (tests[i].result == "FAIL") ||
                    (tests[i].result == "ERROR") ||
                    (tests[i].result == "XPASS"))
                    tests[i].status = statusEnum.FAIL;
                else
                    tests[i].status = statusEnum.PASS;
            } else if ((typeof tests[i].isSkipped !== 'undefined') && (tests[i].isSkipped == true)) {
                tests[i].tests = [];
                if((tests[i].type == "scenario")||(tests[i].type == "row")){
					// The Scenario OR Row from Scenario Outline was skipped durring tagged execution
					tests[i].status = statusEnum.EXPECTED_SKIPPED;
				}
				else {
					tests[i].status = statusEnum.SKIPPED;
				}
			} else if ((tests[i].type == "uicoverage")||(tests[i].type == "step")) tests[i].status = statusEnum.PASS;
        }

        // Test element contains subelements
        else {
            tests[i].status = setStatus(tests[i].tests);
        }

        if ((typeof tests[i].last !== 'undefined') && (tests[i].last == false)) {
            // do nothing; execution of given test case that is not last
			// should not alter the result
		} else if (tests[i].status == statusEnum.FAIL)
            status = statusEnum.FAIL
        else if (tests[i].status == statusEnum.WARNING && status < statusEnum.WARNING)
            status = statusEnum.WARNING
        else if (tests[i].status == statusEnum.SKIPPED && status < statusEnum.SKIPPED)
            status = statusEnum.SKIPPED
        else if (tests[i].status == statusEnum.PASS && status < statusEnum.PASS)
            status = statusEnum.PASS
    }

    return status;
}

function setLastExecution(tests) {
    for (var i = 0; i < tests.length; i++) {
		// Retry feature can retry test cases, scenario and rows (from scenario outline)
        if ((tests[i].type == "testcase")||(tests[i].type == "scenario")||(tests[i].type == "row")) {
            if ((i < tests.length - 1) &&
                (tests[i].name == tests[i + 1].name) &&
                (typeof tests[i + 1].retry !== 'undefined')) {
                tests[i].last = false;
            } else {
                tests[i].last = true;
            }
        }
        if (typeof tests[i].tests !== 'undefined') {
            setLastExecution(tests[i].tests);
        }
    }
}

function isRetryUsed(tests) {
    var rVal = false;
    for (var i = 0; i < tests.length; i++) {
        if (typeof tests[i].retry !== 'undefined') {
            return true;
        }

        if (typeof tests[i].tests !== 'undefined') {
            rVal = isRetryUsed(tests[i].tests);
            if (rVal) {
                return true;
            }
        }

    }
    return rVal;
}


function renderContent(tests, prefix) {
    var acc = $("<div>").addClass("acc");

    for (var i in tests) {
        var acc_sec = $("<div>").addClass("acc-section");
        if (prefix == "")
            tests[i].accId = "-" + i;
        else
            tests[i].accId = prefix + "-" + i;
        tests[i].level = (prefix.length) / 2;

        if (tests[i].type == "msg") {
            if (tests[i].result == "log")
                acc_sec.addClass("log");
            else if ((typeof tests[i].isFail !== 'undefined') && (tests[i].isFail == true))
                acc_sec.addClass("fail");
            acc_sec.append(new EJS({ text: new EJStemplates().message }).render(tests[i]));
        } else if (tests[i].type == "scriptedVerificationResult") {
            acc_sec.append(new EJS({ text: new EJStemplates().scriptedRes }).render(tests[i]));
        } else if (tests[i].type == "screenshotVerificationResult") {
            acc_sec.append(new EJS({ text: new EJStemplates().screenshotRes }).render(tests[i]));
        } else if (tests[i].type == "tableVerificationResult") {
            acc_sec.append(new EJS({ text: new EJStemplates().tableRes }).render(tests[i]));
        } else if (tests[i].type == "visualVerificationResult") {
            acc_sec.append(new EJS({ text: new EJStemplates().titanRes }).render(tests[i]));
        } else if (tests[i].type == "propertyVerificationResult") {
            acc_sec.append(new EJS({ text: new EJStemplates().objectPropertyRes }).render(tests[i]));
        } else if (tests[i].type == "uicoverage") {
            acc_sec.append(new EJS({ text: new EJStemplates().uiCoverage }).render(tests[i]));
        }

        if (tests[i].status == statusEnum.FAIL)
            acc_sec.addClass("failSec");
        else if (tests[i].status == statusEnum.WARNING)
            acc_sec.addClass("warnSec");
        else if ((tests[i].status == statusEnum.SKIPPED) || (tests[i].status == statusEnum.EXPECTED_SKIPPED))
            acc_sec.addClass("skippedSec");
        else if (((tests[i].type == "msg") || (tests[i].type == "uicoverage")) && (tests[i].status == statusEnum.PASS))
            acc_sec.addClass("logSec");
        else if (tests[i].type != "msg")
            acc_sec.addClass("passSec");

        if (typeof tests[i].last !== 'undefined' && tests[i].last == false) {
            acc_sec.addClass("notLastExecSec");
        }

        if (typeof tests[i].tests !== 'undefined') {
            var href = prefix + "-" + i;
            if (prefix == "") {
                href = "-" + i;
            }
            var acc_sec_title = $("<a>").addClass("acc-section-title").attr("href", "#test=" + href);
            if (tests[i].tests.length == 0)
                acc_sec_title.addClass("empty");

            var acc_sec_content = $("<div>").addClass("acc-section-content").attr("id", href);
            acc_sec_title.append(new EJS({ text: new EJStemplates().testTitle }).render(tests[i]));
            //acc_sec_content.append(renderContent(tests[i].tests,prefix+"-"+i))
            acc_sec.append(acc_sec_title);
            acc_sec.append(acc_sec_content);
        }
        acc.append(acc_sec);
    }

    return acc;
}

function buildSummaryAndFilters(data) {
    $('#squishSummary').html(new EJS({ text: new EJStemplates().summary }).render(data));

    $('#showLogs').change(function() {
        var check = $(this).prop('checked');
        if (check) {
            $(this).removeClass('hidden');
            $('#squishResults').find('.acc-section').filter('.logSec').fadeIn(300);
        } else {
            $('#squishResults').find('.acc-section').filter('.logSec').each(function() {
                $(this).children('.acc-section-title').each(function() {
                    $(this).removeClass('active');
                });
                $(this).children('.acc-section-content').slideUp(300).removeClass('open');
                $(this).fadeOut(300).addClass('hidden');
            });
        }
    });

    $('#showPasses').change(function() {
        var check = $(this).prop('checked');
        if (check) {
            $(this).removeClass('hidden');
            $('#squishResults').find('.acc-section').filter('.passSec').fadeIn(300);
        } else {
            $('#squishResults').find('.acc-section').filter('.passSec').each(function() {
                $(this).children('.acc-section-title').removeClass('active');
                $(this).children('.acc-section-content').slideUp(300).removeClass('open');
                $(this).fadeOut(300).addClass('hidden');
            });
        }
    });

    $('#showLast').change(function() {
        var check = $(this).prop('checked');
        if (check) {
            $('#squishResults').find('.acc-section').filter('.notLastExecSec').each(function() {
                $(this).children('.acc-section-title').removeClass('active');
                $(this).children('.acc-section-content').slideUp(300).removeClass('open');
                $(this).fadeOut(300).addClass('hidden');
            });
        } else {
            $(this).removeClass('hidden');
            $('#squishResults').find('.acc-section').filter('.notLastExecSec').fadeIn(300);
        }
    });

    function openAllSections(acc) {
        $(acc).children(".acc-section").each(function() {
            var sectionTitle = $(this).children(".acc-section-title");
            if (sectionTitle.length > 0) {
                var sectionContent = $(this).children(".acc-section-content");
                if (!sectionTitle.is('.active')) {
                    // expand this test element
                    sectionTitle.addClass('active');
                    generateAndOpenTest(sectionContent);
                }
                $(this).children(".acc-section-content").not(".acc-section-details").each(function() {
                    $(this).children(".acc").each(function() {
                        openAllSections($(this));
                    });
                });
            }
        });
    }

    $('#expandList').unbind('click').click(function() {
        openAllSections($("#squishResults").children(".acc"));
        applyFilters();
        activatePopups();
        activateUI();
    })

    $('#collapseList').unbind('click').click(function() {
        close_accordion_section($('#squishResults'));
        // Remove DOM elements
        $('#squishResults').children('.acc').children('.acc-section').children('.acc-section-content').children('.acc').remove();
    })

}

/*
 For given hash and attribute name returns value of given attribute.
 i.e. getValueFromHash("#name=Calculator&date=2015-01-27T16:33:02+01:00", "name") == "Calculator"
 If given hash does not have requested attribute empty string is returned.
*/
function getValueFromHash(hash, attribute) {
    hash = hash.replace('#', '');
    var parameters = hash.split("&");
    for (var i in parameters) {
        keyvalue = parameters[i].split('=');
        if (keyvalue[0] == attribute)
            return keyvalue[1];
    }
    return "";
}

function setOverallStatus(results) {
    var status = statusEnum.PASS;
    for (var i in results.tests) {
        if (results.tests[i].status == statusEnum.FAIL)
            status = statusEnum.FAIL
        else if (results.tests[i].status == statusEnum.WARNING && status < statusEnum.WARNING)
            status = statusEnum.WARNING
        else if (results.tests[i].status == statusEnum.SKIPPED && status < statusEnum.SKIPPED)
            status = statusEnum.SKIPPED
    }
    results.status = status;
}

function colourTestTitle(squishTitle, testStatus) {
    squishTitle.removeClass("positive").removeClass("negative").removeClass("warning");
    statusIcon = $("<i>").addClass("icon");
    if (testStatus == statusEnum.FAIL) {
        squishTitle.addClass("negative");
        statusIcon.addClass("warning").addClass("circle");
    } else if (testStatus == statusEnum.PASS) {
        squishTitle.addClass("positive");
        statusIcon.addClass("checkmark");
    } else if (testStatus == statusEnum.WARNING) {
        squishTitle.addClass("warning");
        statusIcon.addClass("attention");
    }
    squishTitle.prepend(statusIcon);
}

/* For given test element calculates number of test elements.
   When retry functionality is used, only last execution of given Test Case/BDD Scenario is counted.
*/
function count(tests, type, status) {
    var n = 0;
    for (var i in tests) {
        if ((tests[i].type.toUpperCase() == type.toUpperCase()) &&
            ((status == 'any') || (tests[i].status == status)) &&
            (typeof tests[i].last === 'undefined' || tests[i].last == true))
            n += 1;
        else if (typeof tests[i].tests !== 'undefined') n += count(tests[i].tests, type, status)
    }
    return n;
}


function getFirstSubType(tests) {
    for (var i in tests) {
        if (typeof tests[i].tests !== 'undefined') {
            if (tests[i].type == 'scenariooutline')
                return 'scenario';
            return tests[i].type;
        }
    }
}

/*
    Test elements is complex if it contains other test elements.
 */
function isComplex(tests) {
    for (var i in tests) {
        if (typeof tests[i].tests !== 'undefined')
            return true;
    }
    return false;
}

/*
    For given test element calculates number of verifications with given status.
*/
function countVerifications(tests, status) {
    var n = 0;
    for (var i in tests) {
        if (isVerification(tests[i]) && ((status == 'any') || (tests[i].status == status))) n += 1;
        else if (typeof tests[i].tests !== 'undefined') n += countVerifications(tests[i].tests, status)
    }
    return n;
}

function isVerification(test) {
    if ((test.type == "scriptedVerificationResult") || (test.type == "screenshotVerificationResult") || (test.type == "visualVerificationResult") || (test.type == "tableVerificationResult") || (test.type == "propertyVerificationResult")) {
        return true;
    }
    return false;
}

function scenarioHandler(testType) {
    if (testType == 'scenariooutline')
        return 'scenario';
    return testType;
}

/* A test element is Homogeneous when:
- AND All complex sub test elements are of the same type
- AND all verifications are inside of sub test element
 */
function isHomogeneous(tests) {
    var res = false;
    var sawVerification = false;
    var isComplex = false;
    var subType = '';

    for (var i in tests) {

        if (isVerification(tests[i]))
            sawVerification = true;

        // Test element is complex
        if (typeof tests[i].tests !== 'undefined') {

            if (sawVerification) return false;

            if ((subType != '') && (subType != scenarioHandler(tests[i].type))) {
                // Complex sub test elements are NOT of the same type
                return false;
            } else if (subType == '') {
                subType = scenarioHandler(tests[i].type);
            }

        }
    }
    return true;
}

function activateUI() {

    $('.icon.screenshot').unbind('click').click(function(e) {
        var url = $(this).data('img-url');
        var img = $(this).parent().children('img');
        if (img.length) {
            // Hide image
            img.remove();
        } else {
            //Show image
            var newImg = $("<img>").addClass("ui fluid bordered image").attr('src', url).hide();
            $(this).parent().append(newImg);
            newImg.fadeIn();
        }
    });

    $('.icon.failedObjectDump').unbind('click').click(function(e) {
        var url = $(this).data('xml-url');
        window.location.href = url;
    });

}