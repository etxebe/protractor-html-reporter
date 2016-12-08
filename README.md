protractor-html-reporter
=================================

Generates html report with piecharts based on xml file with tests results. For generating xml file with tests results you can use  [jasmine-reporters](https://www.npmjs.com/package/jasmine-reporters).   
This reporter can also display screenshots taken on test failure. To get the screenshots you can use [jasmine2-protractor-utils](https://www.npmjs.com/package/jasmine2-protractor-utils) module.
This package is inspired by [cucumber-html-report](https://www.npmjs.com/package/cucumber-html-reporter).

repo : https://github.com/etxebe/protractor-html-reporter

Sample images
----------------------------------
<img src="https://raw.githubusercontent.com/etxebe/protractor-html-reporter/master/sample1.jpg" width="400" height="200" />
<img src="https://raw.githubusercontent.com/etxebe/protractor-html-reporter/master/sample2.jpg" width="400" height="200" />
<img src="https://raw.githubusercontent.com/etxebe/protractor-html-reporter/master/sample3.jpg" width="400" height="200" />
<img src="https://raw.githubusercontent.com/etxebe/protractor-html-reporter/master/sample4.jpg" width="400" height="200" />

How to use
----------------------------------
* Converting the xml file to html
   ```javascript
    var HTMLReport = require('protractor-html-reporter');

	testConfig = {
                reportTitle: 'Test Execution Report',
                outputPath: './',
                screenshotPath: './screenshots',
                testBrowser: browserName,
                browserVersion: browserVersion
            };
    new HTMLReport().from('xmlresults.xml', testConfig);
    ```

* Using with protractor conf.js file

    ```javascript	
    //HTMLReport called once tests are finished
    onComplete: function() {
         var browserName, browserVersion;
         var capsPromise = browser.getCapabilities();

         capsPromise.then(function (caps) {
            browserName = caps.get('browserName');
            browserVersion = caps.get('version');

            var HTMLReport = require('protractor-html-reporter');

			testConfig = {
                reportTitle: 'Test Execution Report',
                outputPath: './',
                screenshotPath: './screenshots',
                testBrowser: browserName,
                browserVersion: browserVersion
            };
            new HTMLReport().from('xmlresults.xml', testConfig);
        });
     }
     ```

* In order to obtain results in xml file you can use [jasmine-reporters](https://www.npmjs.com/package/jasmine-reporters) module:

    ```javascript
    var jasmineReporters = require('jasmine-reporters');
    jasmine.getEnv().addReporter(new jasmineReporters.JUnitXmlReporter({
        consolidateAll: true,
        savePath: './',
        filePrefix: 'xmlresults'
    }));
    ```
	
* In order to obtain screenshots on failure you can use [jasmine2-protractor-utils](https://www.npmjs.com/package/jasmine2-protractor-utils) module:
	```javascript
	//In exports.config put this:
    plugins: [{
        package: 'jasmine2-protractor-utils',
        disableHTMLReport: true,
        disableScreenshot: false,
        screenshotPath:'./screenshots',
        screenshotOnExpectFailure:false,
        screenshotOnSpecFailure:true,
        clearFoldersBeforeTest: true
      }],
      ```
      
Options
----------------------------------      
* reportTitle  
The report title displayed in generated html report.  
* outputPath  
The path where to write html report.
* screenshotPath  
The path where to look for screenshots.
* testBrowser   
The name of browser on which the tests were executed. It's necessary if you want to display screenshots in your report.
* browserVersion
The version of the browser.

Credits
----------------------------------
Credit to the developers of [cucumber-html-report](https://www.npmjs.com/package/cucumber-html-reporter) for developing pretty HTML reporting. The protractor-html-reporter is based on this one. I've added some new things, some thing were removed and instead of json file this reporter is based on xml file.


