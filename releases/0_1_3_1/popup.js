app = angular.module("popupApp", ['ngMaterial', 'ngMessages', 'material.svgAssetsCache']);
app.controller("popup", ['$scope', function ($scope) {

    $scope.log = Array();

    $scope.log.push({ version: "0.1.3.1", log: [ "USD Quick Access for manage Unified Service Desk configurations", "Available HUD now in form, grid and ribbon pages", "Filter solution list by name"] });
    $scope.log.push({ version: "0.1.2.1", log: ["Fixed bug with Webresources"]});
    $scope.log.push({ version: "0.1.2", log: ["Ported to AngularJS", "Updated styles to Material", "Updated button bar", "Added 'Required' selector to controls", "Download metadata (entities, fields and relationships)", "Added 'Schema name' to metadata relationships table", "Two new shortcuts: set all no mandatory and set all visible/enable/no mandatory", "Filter for Webresrouces: In solution/All", "Edit record: added open in window for lookups", "Edit record: search records dynamically", "Edit record: when updating optionset value, show the values for select one", "Query constructor: execute script", "Query constructor: include execution sentence flag", "Query constructor: download code", "Count records: select either all records or a view", "Count records: fetch XML" ] });
    $scope.log.push({ version: "0.1.1", log: ["Stable release", "Changed name to 'Dynamics CRM HUDCRM'"] });
    $scope.log.push({ version: "0.0.9", log: ["Changed beta to stable", "Changed Popup menú onClick extension", "Fixed multilanguage bug for query constructor and metadata entities", "Added Required Level to UI controls", "Fixed 'undefined' in lookUp info entity field", "Added IS_ONPREMISE in CRM Header info tab", "Added Endpoint Info in CRM tab"] });
    $scope.log.push({ version: "beta 0.0.8", log: ["Query constructor", "Ported to Dynamics CRM 2011 (When popup of record -> Right click over the window -> Show as tab)", "Fixed N:1 Relations Schema name"] });
    $scope.log.push({ version: "beta 0.0.7", log: ["Fixed 1:N and N:1 relations bug in metadata entities explorer", "Fixed Webresources editor", "Added Edit Record", "Extra info for lookups tiles", "Shortcut for Edit Record from lookups"] });
    $scope.log.push({ version: "beta 0.0.6", log: ["Changed execution. Now HUDCRM only will be executed when you click the chromebar icon", "Fixed bug save + publish many times", "Added entity relations into Metadata explorer", "Added 'Save' button to HUD Editor", "Added Guid of WR in HUD Editor", "Added Entity primary attributes info", "Added Tiles for grids", "Added Records count"] });
    $scope.log.push({ version: "beta 0.0.5", log: ["HUD Editor for webresources", "Modify Save&Publish webresources in-form", "Reload specific webresource", "Beautify code in HUD Editor", "Diff in HUD Editor", "Shortcuts to modify webresources (now also for 2015)", "Shortcuts to form header webresources", "Added Metadata Entity Browser"] });
    $scope.log.push({ version: "beta 0.0.4", log: ["Fixed define many times globals variables", "Fixed relative path to solutions", "Fixed relative path to webresources", "Added FetchXML functionality (tested in 2015/16)"] });
    $scope.log.push({ version: "beta 0.0.3", log: ["Shortcuts to Solutions", "Shortcuts to modify webresources (only 2016+)", "Notification system for new features", "CRM Instance found icon notification", "Fixed show HUD when navigating with CRM menu"] });
}]);

function onload() {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { action: "loadHUDCRM" }, function (response) {
            $("#injectedJS").css("display", "")
        });
    });
}
onload();