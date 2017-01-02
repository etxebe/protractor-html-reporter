var xmlDocument = require('xmldoc');
var fileSystem = require('fs');
var fs = require('fs-extra');
var filePath = require('path');
var _ = require('lodash');


//stores informatations for every suite
var suitesData = [];

//stores data that is used for the whole report
var report = {
  name: '',
  browser: '',
  browserVersion: '',
  platform: '',
  time: new Date(),
  screenshotPath: '',
  modifiedSuiteName: false,
  screenshotsOnlyOnFailure: true
};

//stores statistics per one suite
var suite = {
  name: '',
  tests: 0,
  failed: 0,
  errors: 0,
  skipped: 0,
  passed: 0
};

//stores statistics for all suites
var allSuites = {
  tests: 0,
  failed: 0,
  errors: 0,
  skipped: 0,
  passed: 0,
  totalTime: 0,
  reportAs: 'TestCases'
};

//stores all suites summary (needed for piecharts)
var suitesSummary = {
  suites: 0,
  passed: 0,
  failed: 0
};


/** Function: getPath
 * Returns the path to the given file based on passed directory.
 *
 * Parameters:
 *    (String) filename - Filename
 *    (String) (optional) dir - directory to look for given file
 */
function getPath(filename, dir) {
  if (dir) {
    fs.ensureDirSync(dir);
    return filePath.join(dir, filename);
  } else {
    return filePath.join(__dirname, filename);
  }
}

function readFile(filename) {
  return fileSystem.readFileSync(filename, 'utf-8');
}

//time passed in seconds
function getTime(time) {
  var hours = Math.floor(time/3600);
  var minutes = Math.floor(time % 3600/60);
  var seconds = (time % 3600) % 60;

  return hours + 'h ' + minutes + 'min ' + seconds + 's';
}

var HTMLReport = function() {

  var generateSummaries = function(reportXml, report) {

    var testStartedOn;
    var testCases;
    var totalCasesPerSuite;
    var xmlData = fileSystem.readFileSync(reportXml, 'utf8');
    var testResultXml = new xmlDocument.XmlDocument(xmlData);
    var testSuites = testResultXml.childrenNamed('testsuite');
    testStartedOn = testSuites[0].attr.timestamp;
    totalSuites = testSuites.length;
    suitesSummary.suites = testSuites.length;


    for (var i=0; i<totalSuites; i++) {
      //suite statistics
      suite.name = testSuites[i].attr.name;
      suite.tests = parseInt(testSuites[i].attr.tests);
      suite.failed = parseInt(testSuites[i].attr.failures);
      suite.errors = parseInt(testSuites[i].attr.errors);
      suite.skipped = parseInt(testSuites[i].attr.skipped);
      suite.passed = suite.tests - suite.failed - suite.errors - suite.skipped;

      if (suite.failed > suite.tests) {
        suite.failed = suite.tests;
        suite.passed = 0;
      }

      //test cases statistics
      var testCasesNames = [];
      var testCasesResults = [];
      var testCasesTimes = [];
      var testCasesMessages = [];
      var screenshotsNamesOnFailure = [];
      testCases = testSuites[i].childrenNamed('testcase');
      totalCasesPerSuite = testCases.length;
      for (var j=0; j<totalCasesPerSuite; j++) {
        //get test cases results
        if(testCases[j].firstChild == null) {
          testCasesResults.push('Passed');
        } else if (testCases[j].firstChild.name == 'failure'){
          testCasesResults.push('Failed');
        } else if (testCases[j].firstChild.name == 'skipped'){
          testCasesResults.push('Skipped');
        }

        //get test cases times
        testCasesTimes.push(Math.ceil(testCases[j].attr.time));

        //get test cases messages
        if(testCases[j].firstChild == null) {
          testCasesMessages.push('None');
        } else if (testCases[j].firstChild.name == 'failure') {
          testCasesMessages.push(testCases[j].firstChild.attr.message);
        } else {
          testCasesMessages.push('None');
        }

        //get test cases names
        testCasesNames.push(testCases[j].attr.name);

        //get test cases screenshots names (on failure only)
          if (testCasesResults[j] != 'Failed' && report.screenshotsOnlyOnFailure) {
            screenshotsNamesOnFailure.push('None');
          } else {
            if (report.modifiedSuiteName) {
              screenshotsNamesOnFailure.push(report.browser +'-'+ suite.name.substring(suite.name.indexOf(".")+1) + ' ' + testCasesNames[j] + '.png');
              // screenshotsNamesOnFailure.push(report.browser +'-'+ testSuites[i].attr.name.substring(testSuites[i].attr.name.indexOf(".")+1) + ' ' + testCasesNames[j] + '.png');
            }
            else {
              screenshotsNamesOnFailure.push(report.browser +'-'+ suite.name + ' ' + testCasesNames[j] + '.png');
            }
          }
      }

      //store suite data
      suitesData.push({'keyword': 'TestSuite', 'name': suite.name, 'testcases': testCasesNames, 'testcasesresults':testCasesResults, 'testcasestimes': testCasesTimes, 'testcasesmessages': testCasesMessages, 'screenshotsNames':screenshotsNamesOnFailure, 'tests': suite.tests, 'failed': suite.failed, 'errors': suite.errors, 'skipped': suite.skipped, 'passed': suite.passed});

      //total statistics
      allSuites.tests += suite.tests;
      allSuites.failed += suite.failed;
      allSuites.errors += suite.errors;
      allSuites.passed += suite.passed;
      allSuites.skipped += suite.skipped;
      allSuites.totalTime += Math.ceil(parseFloat(testSuites[i].attr.time));

      //suites summary
      if (suite.failed >0) {
        suitesSummary.failed += 1;
      } else {
        suitesSummary.passed += 1;
      }
    }
  }

this.from = function(reportXml, testConfig) {
    //set report data based on testConfig
    report.name = testConfig.reportTitle || 'Test Execution Report';
    report.screenshotPath = testConfig.screenshotPath || './screenshots';
    report.browser = testConfig.testBrowser || 'unknown';
    report.browserVersion = testConfig.browserVersion || 'unknownBrowser';
    report.modifiedSuiteName = testConfig.modifiedSuiteName || false;
    if (testConfig.screenshotsOnlyOnFailure == undefined) {
      report.screenshotsOnlyOnFailure = true;
    } else {
      report.screenshotsOnlyOnFailure = testConfig.screenshotsOnlyOnFailure;
    }
    // report.platform = testConfig.platform;

    //generate statistics
    var testDetails = generateSummaries(reportXml, report);

    //set report data based on statistics
    allSuites.totalTime = getTime(allSuites.totalTime);
    report.time = report.time.toLocaleString();

    //write to html file
    var testOutputPath = getPath('/' + report.browser + '-test-report.html', testConfig['outputPath'] || './');
    fileSystem.writeFileSync(
      testOutputPath,
      _.template(readFile(getPath('index.tmpl')))({
        styles: readFile(getPath('style.css')),
        report: report,
        allSuites: allSuites,
        suitesSummary: suitesSummary,
        testsuites: _.template(readFile(getPath('testsuites.tmpl')))({
          suitesData: suitesData,
          _: _, suite: suite,
          report: report
        }),
        piechart: readFile(getPath('piechart.js'))
      })

    );
  }

};

module.exports = HTMLReport;
