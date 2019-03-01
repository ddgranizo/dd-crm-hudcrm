
var app = null;
//TODO: control start when all files are loaded. Add variable at end of every file injected and control that boolean

function startInitialing() {

    try {
        app = angular.module("hudApp", ['ngMaterial', 'ngMessages', 'material.svgAssetsCache', 'mdDatetime']);
    } catch (e) {
        console.error(e);
    }
    var typeInput = { text: 1, bool: 2, options: 3, list: 4, area: 5, lookup: 6 };
    app.controller(
        "hudController",
        ['$scope', '$window', '$mdDialog', '$mdColorPalette', 'crmRepositoryService', '$q', '$mdSidenav', '$timeout',
            function ($scope, $window, $mdDialog, $mdColorPalette, crmRepositoryService, $q, $mdSidenav, $timeout) {


                $scope.isForm = HUDCRM_CORE.isForm;
                $scope.isGrid = HUDCRM_CORE.isGrid;
                $scope.isDashboard = HUDCRM_CORE.isDashboard;
                $scope.version = HUDCRM_CORE.versionCRM;
                $scope.apply0131Changes = $scope.version >= 9;

                $scope.isUSD = false;

                $scope.cachedUSDConfigurations = null;
                $scope.cachedUSDItems = null;

                $scope.editRecordHistory = Array();
                $scope.hidden = false;
                $scope.tileStyle = { blue: "label label-primary" };
                $scope.onClickMainTile = function () {
                    $scope.hidden = !$scope.hidden;
                }

                $scope.$on('generalVisibilityChanged', function (event, data) { $scope.hidden = !data.visible; });
                $scope.$on('openEditRecord', function (event, data) { $scope.showUiEditRecordDialog($scope, $timeout, crmRepositoryService, data.entity, data.id, $scope.editRecordHistory); });

                $scope.$on('clickToolbar_Info_CRM', function (event, data) { $scope.showUiCrmMenuDialog($scope); });
                $scope.$on('clickToolbar_Info_Entity', function (event, data) { $scope.showUiEntityMenuDialog($scope); });
                $scope.$on('clickToolbar_Info_UI', function (event, data) { $scope.showUiPageUiMenuDialog($scope); });
                $scope.$on('clickToolbar_Info_Metadata', function (event, data) { $scope.showUiMetadataDialog($scope, crmRepositoryService); });
                $scope.$on('clickToolbar_Shortcut_SetAllVisible', function (event, data) { $scope.setAllControlsVisible(); });
                $scope.$on('clickToolbar_Shortcut_SetAllEnabled', function (event, data) { $scope.setAllControlsEnabled(); });
                $scope.$on('clickToolbar_Shortcut_SetAllNoMandatory', function (event, data) { $scope.setAllControlsNoRequired(); });
                $scope.$on('clickToolbar_Shortcut_SetAllBothThree', function (event, data) { $scope.setAllControlsVisible(); $scope.setAllControlsEnabled(); $scope.setAllControlsNoRequired(); });
                $scope.$on('clickToolbar_Shortcut_Solutions', function (event, data) { $scope.showUiSolutionsMenuDialog($scope); });
                $scope.$on('clickToolbar_Shortcut_Webresources', function (event, data) { $scope.showUiWebresourcesMenuDialog($scope, crmRepositoryService); });
                $scope.$on('clickToolbar_Tools_EditRecord', function (event, data) { $scope.initializeEditRecord(); });
                $scope.$on('clickToolbar_Tools_QueryConstructor', function (event, data) { $scope.showUiQueryConstructorDialog($scope, crmRepositoryService, $mdSidenav); });
                $scope.$on('clickToolbar_Tools_CountRecord', function (event, data) { $scope.showUiCountRecordsDialog($scope, crmRepositoryService); });
                $scope.$on('clickToolbar_Tools_FetchXML', function (event, data) { $scope.showUiFetchXMLMenuDialog($scope, crmRepositoryService); });
                $scope.$on('clickToolbar_Tools_USDQuickAccess', function (event, data) { $scope.showUIUSDQuickAccessMenuDialog($scope, crmRepositoryService, $q); });

                $scope.initializeEditRecord = function () {
                    var entity = HUDCRM_CORE.getEntityProperties() != null ? HUDCRM_CORE.getEntityProperties()["name"] : null;
                    var id = HUDCRM_CORE.getEntityProperties() != null ? HUDCRM_CORE.getEntityProperties()["id"] : null;
                    $scope.showUiEditRecordDialog($scope, $timeout, crmRepositoryService, entity, id, $scope.editRecordHistory);
                }

                $scope.loadingSolutions = true;
                $scope.solutions = null;
                $scope.loadingWebresources = true;
                $scope.webresources = null;
                $scope.solutionsComponents = null;
                $scope.loadingMetadataEntities = true;
                $scope.loadingMetadataEntity = true;
                $scope.metadataEntities = null;
                $scope.loadAsync = function () {
                    //preapre webresoures
                    var uiWebresources = $scope.webresources; //ui
                    var headerWebresources = HUDCRM_COMMONFUNCTIONS.completeWebResources(); //header of webpage
                    var mixed = mixWr(uiWebresources, headerWebresources);
                    $scope.webresources = mixed;

                    crmRepositoryService.getSolutions().then(function (solutions) {
                        //load solutions
                        $scope.solutions = solutions;
                        $scope.loadingSolutions = false;
                        //console.log(solutions);
                        return crmRepositoryService.getSolutionsComponents(solutions.Entities);
                    }, function (e) { console.error(e); }).then(function (solutionsComponents) {
                        //load solutions components
                        $scope.solutionsComponents = solutionsComponents;
                        //console.log(solutionsComponents);
                        //console.log($scope.webresources);
                        var names = Array();
                        for (var i = 0; i < $scope.webresources.length; i++) {
                            names.push($scope.webresources[i].nameWR);
                        }
                        //FIX WR----V 0.1.2->0.1.3
                        if (names.length == 0) {
                            //FIX WR-----V 0.1.2.1 -> 0.1.3.1
                            $scope.loadingWebresources = false;
                            return $q.reject();
                            //return null;
                        }
                        //-------------------------
                        return crmRepositoryService.getWebresourcesId(names);
                    }, function (e) { console.error(e); }).then(function (wrs) {
                        //set ids to every WR in $scope.webresources
                        if (wrs != null && typeof (wrs.Entities != 'undefined')) { //FIX WR----V 0.1.2->0.1.3
                            angular.forEach(wrs.Entities, function (wrId) {
                                angular.forEach($scope.webresources, function (wrNoId) {
                                    if (wrId.values["name"] == wrNoId["nameWR"]) {
                                        wrNoId["id"] = wrId.values["webresourceid"];
                                        if ("webresourcetype" in wrId.values) {
                                            wrNoId["webresourcetype"] = wrId.values["webresourcetype"].Value;
                                        }
                                    }
                                });
                            });
                            //set solutionId 
                            angular.forEach($scope.solutionsComponents.Entities, function (solutionsComponent) {
                                angular.forEach($scope.webresources, function (wr) {
                                    if (wr["id"] == solutionsComponent.values["objectid"]) {
                                        wr["solutionid"] = solutionsComponent.values["solutionid"]["Id"];
                                    }
                                });
                            });
                        }
                        $scope.loadingWebresources = false;
                    }, function (e) { console.error(e); });

                    crmRepositoryService.retrieveMetadataEntities().then(function (entities) {
                        $scope.loadingMetadataEntities = false;
                        var entitiesSort = HUDCRM_TOOL.sortArray(entities, "displayName");
                        $scope.metadataEntities = entitiesSort;
                    }, function (e) { console.error(e); });

                    if ($scope.isForm) {
                        //metadataentities and entity fields info
                        var entityName = HUDCRM_CORE.getEntityProperties()["name"];
                        crmRepositoryService.retrieveMetadataFieldsEntity(entityName).then(function (fields) {
                            var fieldsSorted = HUDCRM_TOOL.sortArray(fields["attributes"], "displayName");
                            fields["attributes"] = fieldsSorted;
                            $scope.addCachedMetadataFields(entityName, fields);
                            $scope.loadingMetadataEntity = false;
                            //TODO: include values of SchemaName and primaryIdAttribute to Entity dialog info
                        }, function (e) { console.error(e); });
                    }

                    //check if USD is installed
                    crmRepositoryService.getUSDHostedControlTopOne().then(function (data) {
                        $scope.isUSD = true;
                    }, function (e) { $scope.isUSD = false; console.error(e); });
                }
                $scope.cachedMetadataFields = Object();
                $scope.getCachedMetadataFields = function (entity) {
                    if (entity in $scope.cachedMetadataFields) {
                        return $scope.cachedMetadataFields[entity];
                    }
                    return null;
                }
                $scope.addCachedMetadataFields = function (entity, value) {
                    if (entity in $scope.cachedMetadataFields) {

                    } else {
                        $scope.cachedMetadataFields[entity] = value;
                    }
                }
                function mixWr(wrUi, wrHeader) {
                    var wrs = wrUi;
                    for (var i = 0; i < wrHeader.length; i++) {
                        var found = false;
                        a: for (var j = 0; j < wrUi.length; j++) {
                            if (wrUi[j].nameWR == wrHeader[i].nameWR) {
                                found = true;
                                break a;
                            }
                        }
                        if (!found) {
                            wrs.push(wrHeader[i]);
                        }
                    }
                    return wrs;
                }
                $scope.tree = null;
                $scope.attributes = null;
                $scope.controlsInTabs = null;
                $scope.setUiScanedObject = function (obj) {
                    $scope.tree = obj.tree;
                    $scope.attributes = obj.attributes;
                    $scope.controlsInTabs = obj.controlsInTabs;
                    $scope.webresources = obj.webresources;
                    $scope.loadAsync();

                }
                $scope.updateRequiredElement = function (element, type, required) {
                    HUDCRM_UI.setRequiredControl(element, type, required);
                    $scope.updatePropertyOfElementInTree(element, "required", $scope.tree, required);
                }
                $scope.updateDisabledElement = function (element, type, disabled) {
                    HUDCRM_UI.setDisabledControl(element, type, disabled);
                    $scope.updatePropertyOfElementInTree(element, "disabled", $scope.tree, disabled);
                }
                $scope.updateVisibilityElement = function (element, type, visible) {
                    HUDCRM_UI.setVisibilityControl(element, type, visible);
                    $scope.updatePropertyOfElementInTree(element, "visible", $scope.tree, visible);
                }

                $scope.updateTabState = function (element, state) {
                    console.log("tab: " + element + " -> " + state);
                }
                $scope.setAllControlsVisible = function () {
                    if ($scope.tree == null) {
                        return null;
                    }
                    try {
                        var tree = $scope.tree;
                        angular.forEach(tree.tabs, function (tab) {
                            $scope.updateVisibilityElement(tab.name, HUDCRM_UI.typesUiTiles.tab, true);
                            angular.forEach(tab.sections, function (section) {
                                $scope.updateVisibilityElement(section.name, HUDCRM_UI.typesUiTiles.section, true);
                                angular.forEach(section.controls, function (control) {
                                    $scope.updateVisibilityElement(control.name, HUDCRM_UI.typesUiTiles.control, true);
                                });
                            });
                        });
                        angular.forEach(tree.controls, function (control) {
                            $scope.updateVisibilityElement(control.name, HUDCRM_UI.typesUiTiles.control, true);
                        });
                    } catch (e) {
                        console.error(e);
                    }
                }
                $scope.setAllControlsEnabled = function () {
                    if ($scope.tree == null) {
                        return null;
                    }
                    try {
                        var tree = $scope.tree;
                        angular.forEach(tree.tabs, function (tab) {
                            $scope.updateDisabledElement(tab.name, HUDCRM_UI.typesUiTiles.tab, false);
                            angular.forEach(tab.sections, function (section) {
                                $scope.updateDisabledElement(section.name, HUDCRM_UI.typesUiTiles.section, false);
                                angular.forEach(section.controls, function (control) {
                                    if (control.type != HUDCRM_UI.controlType.subgrid && control.type != HUDCRM_UI.controlType.webresource && control.type != HUDCRM_UI.controlType.iframe) {
                                        $scope.updateDisabledElement(control.name, HUDCRM_UI.typesUiTiles.control, false);
                                    }
                                });
                            });
                        });
                        angular.forEach(tree.controls, function (control) {
                            if (control.type != HUDCRM_UI.controlType.subgrid && control.type != HUDCRM_UI.controlType.webresource && control.type != HUDCRM_UI.controlType.iframe) {
                                $scope.updateDisabledElement(control.name, HUDCRM_UI.typesUiTiles.control, false);
                            }
                        });
                    } catch (e) {
                        console.error(e);
                    }
                }
                $scope.setAllControlsNoRequired = function () {
                    if ($scope.tree == null) {
                        return null;
                    }
                    try {
                        var tree = $scope.tree;
                        angular.forEach(tree.tabs, function (tab) {
                            $scope.updateDisabledElement(tab.name, HUDCRM_UI.typesUiTiles.tab, false);
                            angular.forEach(tab.sections, function (section) {
                                $scope.updateDisabledElement(section.name, HUDCRM_UI.typesUiTiles.section, false);
                                angular.forEach(section.controls, function (control) {
                                    if (control.type != HUDCRM_UI.controlType.subgrid && control.type != HUDCRM_UI.controlType.webresource && control.type != HUDCRM_UI.controlType.iframe) {
                                        $scope.updateRequiredElement(control.name, HUDCRM_UI.typesUiTiles.control, "none");
                                    }
                                });
                            });
                        });
                        angular.forEach(tree.controls, function (control) {
                            if (control.type != HUDCRM_UI.controlType.subgrid && control.type != HUDCRM_UI.controlType.webresource && control.type != HUDCRM_UI.controlType.iframe) {
                                $scope.updateRequiredElement(control.name, HUDCRM_UI.typesUiTiles.control, "none");
                            }
                        });
                    } catch (e) {
                        console.error(e);
                    }
                }

                $scope.currentModalUiControl = null;
                $scope.currentModalUiControlType = null;
                $scope.clickOnTile = function (nameTile, type) {
                    $scope.currentModalUiControl = nameTile;
                    $scope.currentModalUiControlType = type;
                    $scope.showUiElementInfoDialog($scope);
                }
                $scope.openEditorWr = function (webresourceId, referenced) {
                    $scope.showWebresourceEditMenuDialog($scope, crmRepositoryService, webresourceId, referenced);
                }
                $scope.showUIUSDQuickAccessMenuDialog = function ($mainScope, crmRepositoryService, $q) {
                    $mdDialog.show({
                        parent: angular.element(document.body),
                        clickOutsideToClose: false,
                        fullscreen: true,
                        template: ['<md-dialog  aria-label="USD Quick access" style="width:100%; height: 100%">',
                            '<form ng-cloak >',
                            '<md-toolbar layout="row" >',
                            '<div class="md-toolbar-tools">',
                            '<md-button class="md-icon-button" ng-click="reloadConfigurations()" aria-label="Close">',
                            '<md-icon md-svg-src="img/icons/reload.svg"></md-icon>',
                            '</md-button>',
                            '<h4>USD Quick access</h4>',
                            '<span flex></span>',
                            '<md-button class="md-icon-button" ng-click="cancel()" aria-label="Close">',
                            '<md-icon md-svg-src="img/icons/ic_close_24px.svg"></md-icon>',
                            '</md-button>',
                            '</div>',
                            '</md-toolbar>',
                            '<md-dialog-content style="width:100%; height:100%" >',

                            '<md-card ng-show="error">',
                            '<div class="md-padding">',
                            '<div><span>Error:</span></div>',
                            '<div><span style="color: red">{{errorMessage}}</span></div>',
                            '</div>',
                            '</md-card>',

                            '<div class="md-padding" ng-show="loading">',
                            '<loading-big show="loading" key="Loading records..."></loading-big>',
                            '</div>',

                            '<div class="md-padding" ng-show="complete">',
                            '<div  layout="row">',

                            '<div flex="50" layout="row" layout-align="center center">',
                            '<div flex>',
                            '<label>Configurations</label>',
                            '<md-select ng-model="selectedConfigId">',
                            '<md-option ng-repeat="config in configurations" value="{{config.id}}">{{config.display}}</md-option>',
                            '</md-select>',
                            '</div>',
                            '<div ng-show="selectedConfigId!=0">',
                            
                            '<md-button class="md-icon-button" ng-click="openConfiguration(selectedConfigId)" aria-label="Close">',
                            '<md-tooltip md-z-index="999999">Open configuration in CRM</md-tooltip>',
                            '<md-icon md-svg-src="img/icons/ic_launch_black_24px.svg"></md-icon>',
                            '</md-button>',
                            '</div>',
                            '</div>',

                            '<div flex="50">',
                            '<label>Types</label>',
                            '<md-select ng-model="selectedTypes" multiple>',
                            '<md-option ng-repeat="type in types" value="{{type.id}}">{{type.display}}</md-option>',
                            '</md-select>',
                            '</div>',

                            '</div>',

                            '<md-input-container  class="md-block" > ',
                            '<label >Filter</label>',
                            '<input style="font-size: 16px" ng-model="filter.val">',
                            '</md-input-container>',

                            '<div style="scroll-y: auto">',
                            '<table  class="table table-hover table-mc-light-blue">',
                            '<thead>',
                            '<tr style="color: black">',
                            '<th><h5>#</h5></th>',
                            '<th><h5>Type</h5></th>',
                            '<th><h5>Name</h5></th>',
                            '<th><h5></h5></th>',
                            '</tr>',
                            '</thead>',
                            '<tbody>',
                            '<tr ng-repeat="item in filteredItems">',
                            '<td>{{$index+1}}</td>',
                            '<td>{{definitions[item.entity].display}}</td>',
                            '<td>{{item.display}}</td>',
                            '<td><md-button ng-click="openRecord(item.entity, item.id)" aria-label="button"><md-icon md-svg-src="img/icons/ic_launch_black_24px.svg"></md-icon></md-button></td>',
                            '</tr>',
                            '</tbody>',
                            '</table>',
                            '</div>',

                            '</div>',

                            '</md-dialog-content>',
                            '</form>',
                            '</md-dialog>'].join("")
                        ,
                        controller: function ($scope, $mdDialog) {

                            $scope.filter = { val: null };

                            $scope.complete = false;
                            $scope.selectedConfigId = 0;
                            $scope.selectedTypes = [];


                            $scope.openConfiguration = function (config) {
                                $scope.openRecord("msdyusd_configuration", config);
                            }


                            $scope.openRecord = function (entity, id) {
                                var url = HUDCRM_TOOL.getUrl() + "/main.aspx?etn=" + entity + "&pagetype=entityrecord&id={" + id + "}";
                                HUDCRM_TOOL.navigate(url);
                            }

                            $scope.types = [
                                { display: "Hosted application", id: "uii_hostedapplication" },
                                { display: "Toolbar", id: "msdyusd_toolbarstrip" },
                                { display: "Action call", id: "msdyusd_agentscriptaction" },
                                { display: "Event", id: "msdyusd_uiievent" },
                                { display: "Scriptlet", id: "msdyusd_scriptlet" },
                                { display: "Search", id: "msdyusd_entitysearch" },
                                { display: "Window route", id: "msdyusd_windowroute" },
                                { display: "Session", id: "msdyusd_sessioninformation" },
                                { display: "Agent script", id: "msdyusd_task" },
                                { display: "Form", id: "msdyusd_form" },
                                { display: "Option", id: "uii_option" },
                                { display: "Files", id: "msdyusd_customizationfiles" },
                            ];


                            $scope.error = false;
                            $scope.errorMessage = null;

                            $scope.definitions = {
                                msdyusd_configuration: { display: "Configuration", entity: "msdyusd_configuration", field: "msdyusd_name", intersection: "" },
                                uii_hostedapplication: { display: "Hosted application", entity: "uii_hostedapplication", field: "uii_name", intersection: "msdyusd_configuration_hostedcontrol" },
                                msdyusd_toolbarstrip: { display: "Toolbar", entity: "msdyusd_toolbarstrip", field: "msdyusd_name", intersection: "msdyusd_configuration_toolbar" },
                                msdyusd_agentscriptaction: { display: "Action call", entity: "msdyusd_agentscriptaction", field: "msdyusd_name", intersection: "msdyusd_configuration_actioncalls" },
                                msdyusd_uiievent: { display: "Event", entity: "msdyusd_uiievent", field: "msdyusd_name", intersection: "msdyusd_configuration_event" },
                                msdyusd_scriptlet: { display: "Scriptlet", entity: "msdyusd_scriptlet", field: "msdyusd_name", intersection: "msdyusd_configuration_scriptlet" },
                                msdyusd_entitysearch: { display: "Search", entity: "msdyusd_entitysearch", field: "msdyusd_name", intersection: "msdyusd_configuration_entitysearch" },
                                msdyusd_windowroute: { display: "Window route", entity: "msdyusd_windowroute", field: "msdyusd_name", intersection: "msdyusd_configuration_windowroute" },
                                msdyusd_sessioninformation: { display: "Session", entity: "msdyusd_sessioninformation", field: "msdyusd_name", intersection: "msdyusd_configuration_sessionlines" },
                                msdyusd_task: { display: "Agent script", entity: "msdyusd_task", field: "msdyusd_name", intersection: "msdyusd_configuration_agentscript" },
                                msdyusd_form: { display: "Form", entity: "msdyusd_form", field: "msdyusd_name", intersection: "msdyusd_configuration_form" },
                                uii_option: { display: "Option", entity: "uii_option", field: "uii_name", intersection: "msdyusd_configuration_option" },
                                msdyusd_customizationfiles: { display: "Files", entity: "msdyusd_customizationfiles", field: "msdyusd_name", intersection: "msdyusd_customizationfiles_configuration" },
                            }

                            $scope.configurations = $mainScope.cachedUSDConfigurations;
                            $scope.items = $mainScope.cachedUSDItems;

                            $scope.showCRMError = function (e) {
                                $scope.loading = false;
                                $scope.error = true;
                                $scope.errorMessage = HUDCRM_SOAP.deserializeFaultString(e.data);
                                console.error(e);
                            }


                            $scope.$watch('filter.val', function (newVal) {
                                $scope.filterItems();
                            });
                            $scope.$watch('selectedConfigId', function (newVal) {
                                $scope.filterItems();
                            });
                            $scope.$watch('selectedTypes', function (newVal) {
                                $scope.filterItems();
                            }, true);

                            $scope.filterItems = function () {
                                if ($scope.items != null) {
                                    var subItems = $scope.items.filter(function (item) {
                                        return $scope.selectedTypes.length == 0 || $scope.selectedTypes.indexOf(item.entity) > -1
                                    }).filter(function (item) {
                                        return $scope.selectedConfigId == 0 || item.configs.indexOf($scope.selectedConfigId) > -1
                                    }).filter(function (item) {
                                        return $scope.filter.val == "" || $scope.filter.val == null ||
                                            item.display.trim().toLowerCase().indexOf($scope.filter.val.toLowerCase()) > -1
                                    });
                                    $scope.filteredItems = subItems;
                                }
                            }

                            $scope.filteredItems = null;


                            $scope.reloadConfigurations = function () {
                                $scope.items = [];
                                $scope.loading = true;
                                $scope.complete = false;
                                crmRepositoryService.getUSDConfigurations($scope.definitions.msdyusd_configuration.entity,
                                    $scope.definitions.msdyusd_configuration.field, null).then(function (data) {
                                        $scope.configurations = [];

                                        var objPromises = {};

                                        $scope.configurations.push({ isAll: true, id: 0, display: "All" });
                                        for (var i = 0; i < data.Entities.length; i++) {
                                            var config = data.Entities[i];
                                            $scope.configurations.push({ isAll: false, id: config.id, display: config.values["msdyusd_name"] });
                                            for (entity in $scope.definitions) {
                                                if (entity != "msdyusd_configuration") {
                                                    var itemDef = $scope.definitions[entity];
                                                    objPromises[config.id + "." + itemDef.entity] =
                                                        crmRepositoryService.getUSDItems(itemDef.entity, itemDef.field, itemDef.entity + "id", config.id, itemDef.intersection);
                                                }
                                            }
                                        }
                                        $mainScope.cachedUSDConfigurations = $scope.configurations;
                                        $q.all(objPromises).then(function (dataItems) {
                                            for (pair in dataItems) {
                                                var configId = pair.split(".")[0];
                                                var entity = pair.split(".")[1];
                                                var values = dataItems[pair];
                                                for (var i = 0; i < values.Entities.length; i++) {
                                                    var id = values.Entities[i].id;
                                                    var displayName = values.Entities[i].values[$scope.definitions[entity].field];
                                                    var found = false;
                                                    for (var j = 0; j < $scope.items.length; j++) {
                                                        var item = $scope.items[j];
                                                        if (item.id == id && item.entity == entity) {
                                                            found = true;
                                                            if (item.configs.indexOf(configId) < 0) {
                                                                item.configs.push(configId);
                                                            }
                                                        }
                                                    }
                                                    if (!found) {
                                                        $scope.items.push({ id: id, display: displayName, entity: entity, configs: [configId] });
                                                    }
                                                }
                                            }
                                            $mainScope.cachedUSDItems = $scope.items;
                                            $scope.filteredItems = $scope.items;
                                            $scope.filterItems();
                                            $scope.loading = false;
                                            $scope.complete = true;
                                        }, function (e) { $scope.showCRMError(e); });
                                    }, function (e) { $scope.showCRMError(e); });
                            }

                            if ($scope.configurations == null) {
                                $scope.reloadConfigurations();
                            } else {
                                $scope.complete = true;
                            }

                            $scope.cancel = function () {
                                $mdDialog.cancel();
                            };
                        },
                    });
                }
                $scope.showUiSolutionsMenuDialog = function ($mainScope) {
                    $mdDialog.show({
                        parent: angular.element(document.body),
                        clickOutsideToClose: true,
                        template: ['<md-dialog  aria-label="Solutions">',
                            '<form ng-cloak >',
                            '<md-toolbar layout="row" >',
                            '<div class="md-toolbar-tools">',
                            '<h4>Solutions</h4>',
                            '<span flex></span>',
                            '<md-button class="md-icon-button" ng-click="cancel()" aria-label="Close">',
                            '<md-icon md-svg-src="img/icons/ic_close_24px.svg"></md-icon>',
                            '</md-button>',
                            '</div>',
                            '</md-toolbar>',
                            '<md-dialog-content style="width:400px; max-width:400px; min-height:85px; max-height:810px;" >',
                            '<md-card>',
                            '<div><label>Solutions in CRM</label></div>',
                            '<div ng-show="loadingSolutions" layout="row" layout-sm="column" layout-align="space-around">',
                            '<md-progress-circular md-mode="indeterminate"></md-progress-circular>',
                            '</div>',
                            '<div ng-if="solutions!=null">',
                            '<div ng-if="solutions.length==0">Not solutions founds</div>',
                            '<input-text key="Filter" value="filter.val" ></input-text>',
                            '<md-button ng-repeat="solution in displayingSolutions" class="md-raised" style="width: auto;" ng-click="navigate(solution)">{{solution.values.uniquename}}</md-button>',
                            '</div>',
                            '</md-card>',
                            '</md-dialog-content>',
                            '</form>',
                            '</md-dialog>'].join("")
                        ,
                        controller: function ($scope, $mdDialog) {

                            $scope.filter = { val: null };

                            $scope.$watch('filter.val', function (newVal) {
                                if (newVal == null || newVal == "") {
                                    $scope.displayingSolutions = $scope.solutions;
                                } else {
                                    $scope.displayingSolutions = $scope.solutions.filter(function (item) {
                                        var name = item.values.uniquename;
                                        return name.trim().toLowerCase().indexOf(newVal.toLowerCase()) >= 0;
                                    })
                                }
                            });

                            $scope.loadingSolutions = $mainScope.loadingSolutions;
                            $scope.navigate = function (solution) {
                                var url = HUDCRM_TOOL.getUrl() + "/tools/solution/edit.aspx?id={" + solution.values.solutionid + "}";
                                HUDCRM_TOOL.navigate(url);
                            }

                            $scope.tree = $mainScope.tree;
                            $scope.solutions = $mainScope.solutions.Entities;
                            $scope.displayingSolutions = $scope.solutions;

                            $scope.cancel = function () {
                                $mdDialog.cancel();
                            };
                        },
                    });
                }
                $scope.showUiPageUiMenuDialog = function ($mainScope) {
                    $mdDialog.show({
                        parent: angular.element(document.body),
                        clickOutsideToClose: true,
                        template: ['<md-dialog  aria-label="Page UI">',
                            '<form ng-cloak >',
                            '<md-toolbar layout="row" >',
                            '<div class="md-toolbar-tools">',
                            '<h4>Page UI</h4>',
                            '<span flex></span>',
                            '<md-button class="md-icon-button" ng-click="cancel()" aria-label="Close">',
                            '<md-icon md-svg-src="img/icons/ic_close_24px.svg"></md-icon>',
                            '</md-button>',
                            '</div>',
                            '</md-toolbar>',
                            '<md-dialog-content style="width:400px; max-width:400px; max-height:810px;" >',
                            '<md-card>',
                            '<div><label>Tabs</label></div>',
                            '<div><md-button ng-repeat="tab in tabs" class="md-raised"  style="width: auto;" ng-click="navigateTab(tab)">{{getLabel(tab)}}</md-button></div>',
                            '</md-card>',
                            '<md-card>',
                            '<div><label>Header controls</label></div>',
                            '<div><md-button ng-repeat="control in controls" class="md-raised"  style="width: auto;" ng-click="navigateControl(control)">{{getLabel(control)}}</md-button></div>',
                            '</md-card>',
                            '</md-dialog-content>',
                            '</form>',
                            '</md-dialog>'].join("")
                        ,
                        controller: function ($scope, $mdDialog) {

                            $scope.tree = $mainScope.tree;
                            $scope.tabs = Array();
                            $scope.controls = Array();
                            if (typeof $scope.tree.tabs != 'undefined' && $scope.tree.tabs != null) {
                                $scope.tabs = $scope.tree.tabs;
                            }
                            if (typeof $scope.tree.tabs != 'undefined' && $scope.tree.tabs != null) {
                                $scope.controls = $scope.tree.controls;
                            }
                            $scope.getLabel = function (item) {
                                if (item.label == HUDCRM_XRM.stringNoLabel) {
                                    return item.name;
                                }
                                return item.label;
                            }

                            $scope.navigateTab = function (tab) {
                                $mdDialog.cancel();
                                $mainScope.clickOnTile(tab.name, HUDCRM_UI.typesUiTiles.tab);
                            }
                            $scope.navigateControl = function (control) {
                                $mdDialog.cancel();
                                $mainScope.clickOnTile(control.name, HUDCRM_UI.typesUiTiles.control);
                            }
                            $scope.setAllVisible = function () {
                                $mainScope.setAllControlsVisible();
                                //console.log("all visible");
                            }
                            $scope.setAllEnabled = function () {
                                $mainScope.setAllControlsEnabled();
                                //console.log("all enabled");
                            }

                            $scope.cancel = function () {
                                $mdDialog.cancel();
                            };
                        },
                    });
                }
                $scope.showUiEntityMenuDialog = function ($mainScope) {
                    $mdDialog.show({
                        parent: angular.element(document.body),
                        clickOutsideToClose: true,
                        template: ['<md-dialog  aria-label="Entity properties">',
                            '<form ng-cloak >',
                            '<md-toolbar layout="row" >',
                            '<div class="md-toolbar-tools">',
                            '<h4>Entity properties</h4>',
                            '<span flex></span>',
                            '<md-button class="md-icon-button" ng-click="cancel()" aria-label="Close">',
                            '<md-icon md-svg-src="img/icons/ic_close_24px.svg"></md-icon>',
                            '</md-button>',
                            '</div>',
                            '</md-toolbar>',
                            '<md-dialog-content style="width:400px; max-width:400px; max-height:810px;" >',
                            '<md-tabs md-dynamic-height md-border-bottom>',
                            '<md-tab label="entity info">',
                            '<md-card>',
                            '<input-text key="Logical name" value="entityInfo.name" ></input-text>',
                            '<input-text key="Id" value="entityInfo.id" ></input-text>',
                            '<input-text key="Form type" value="entityInfo.formType" ></input-text>',
                            '<loading-small show="loadingMeta()" key="Loading entity metadata..."></loading-small>',
                            '<div ng-show="!loadingMeta()">',
                            '<input-text key="Primary name id" value="primaryId" ></input-text>',
                            '<input-text key="Primary name attribute" value="primaryName" ></input-text>',
                            '<input-text key="Schema name" value="schemaName" ></input-text>',
                            '<input-text key="Type code" value="typeCode" ></input-text>',
                            '<input-text key="Is custom entity" value="isCustom" ></input-text>',
                            '</div>',
                            '</md-card>',
                            '</md-tab>',
                            '<md-tab label="form selector">',
                            '<md-card>',
                            '<div ng-repeat="property in formSelectorProperties">',
                            '<input-text key="{{property.key}}" value="property.value" ></input-text>',
                            '</div>',
                            '</md-card>',
                            '</md-tab>',
                            '</md-tabs>',
                            '</md-dialog-content>',
                            '</form>',
                            '</md-dialog>'].join("")
                        ,
                        controller: function ($scope, $mdDialog) {
                            $scope.entityProperties = Array();
                            $scope.formSelectorProperties = Array();
                            var version = HUDCRM_CORE.getApplicationVersion();
                            $scope.entityInfo = HUDCRM_CORE.getEntityProperties();
                            $scope.loadingMeta = function () { return $mainScope.loadingMetadataEntity }

                            $scope.$watch('loadingMeta()', function (newVal, oldVal) {
                                if (oldVal && !newVal) {
                                    $scope.loadAsyncValues();
                                }
                            });

                            $scope.loadAsyncValues = function () {
                                var cached = $mainScope.getCachedMetadataFields($scope.entityInfo["name"]);
                                console.log(cached);
                                if (cached != null) {
                                    $scope.schemaName = cached["SchemaName"];
                                    $scope.isCustom = cached["IsCustomEntity"];
                                    $scope.typeCode = cached["ObjectTypeCode"];
                                    $scope.primaryId = cached["PrimaryIdAttribute"];
                                    $scope.primaryName = cached["PrimaryNameAttribute"];
                                }
                            }
                            //TODO: add asynchronous values from 

                            var formSelector = HUDCRM_CORE.getFormSelector();
                            for (var i = 0; i < formSelector.length; i++) {
                                var pos = i + 1;
                                $scope.formSelectorProperties.push({ key: "Form " + pos, value: formSelector[i].label + " [" + formSelector[i].id + "]" });
                            }
                            if (!$scope.loadingMeta()) {
                                $scope.loadAsyncValues();
                            }

                            $scope.cancel = function () {
                                $mdDialog.cancel();
                            };
                        },
                    });
                }
                $scope.showUiCrmMenuDialog = function ($mainScope) {
                    $mdDialog.show({
                        parent: angular.element(document.body),
                        clickOutsideToClose: true,
                        template: ['<md-dialog  aria-label="CRM Instance Info">',
                            '<form ng-cloak >',
                            '<md-toolbar layout="row" >',
                            '<div class="md-toolbar-tools">',
                            '<h4>CRM Instance Info</h4>',
                            '<span flex></span>',
                            '<md-button class="md-icon-button" ng-click="cancel()" aria-label="Close">',
                            '<md-icon md-svg-src="img/icons/ic_close_24px.svg"></md-icon>',
                            '</md-button>',
                            '</div>',
                            '</md-toolbar>',
                            '<md-dialog-content style="width:400px; max-width:400px; max-height:810px;" >',
                            '<md-tabs md-dynamic-height md-border-bottom>',
                            '<md-tab label="header info">',
                            '<md-card>',
                            '<div ng-repeat="property in headerProperties">',
                            '<input-text key="{{property.key}}" value="property.value" ></input-text>',
                            '</div>',
                            '</md-card>',
                            '</md-tab>',
                            '<md-tab label="endpoint info">',
                            '<md-card>',
                            '<div ng-repeat="property in endpointProperties">',
                            '<input-text key="{{property.key}}" value="property.value" ></input-text>',
                            '</div>',
                            '</md-card>',
                            '</md-tab>',
                            '</md-tabs>',
                            '</md-dialog-content>',
                            '</form>',
                            '</md-dialog>'].join("")
                        ,
                        controller: function ($scope, $mdDialog) {
                            $scope.headerProperties = Array();
                            $scope.endpointProperties = Array();
                            var version = HUDCRM_CORE.getApplicationVersion();
                            var headerInfo = HUDCRM_COMMONFUNCTIONS.getCRMHeaderInfo(version);

                            for (property in headerInfo) {
                                $scope.headerProperties.push({ key: property, value: headerInfo[property] });
                            }

                            //TODO: add username (token asynchronously);
                            var username = "username";
                            var svcUtil = HUDCRM_COMMONFUNCTIONS.getCrmSvcUtilString(username);
                            console.log("version: " + HUDCRM_CORE.versionCRM);
                            var strConnection = HUDCRM_COMMONFUNCTIONS.getStringConnection(HUDCRM_CORE.versionCRM, username, !headerInfo.IS_ONPREMISE);
                            $scope.endpointProperties.push({ key: "String connection", value: strConnection });
                            $scope.endpointProperties.push({ key: "CRM Service Util Command", value: svcUtil });
                            $scope.cancel = function () {
                                $mdDialog.cancel();
                            };
                        },
                    });
                }
                $scope.showUiElementInfoDialog = function ($mainScope) {
                    $mdDialog.show({
                        parent: angular.element(document.body),
                        clickOutsideToClose: true,
                        template: ['<md-dialog  aria-label="UI Element ({{currentElementType}})">',
                            '<form ng-cloak >',
                            '<md-toolbar layout="row" >',
                            '<div class="md-toolbar-tools">',
                            '<h4>UI Element ({{currentElementType}})</h4>',
                            '<span flex></span>',
                            '<md-button class="md-icon-button" ng-click="cancel()" aria-label="Close">',
                            '<md-icon md-svg-src="img/icons/ic_close_24px.svg"></md-icon>',
                            '</md-button>',
                            '</div>',
                            '</md-toolbar>',
                            '<md-dialog-content style="width:400px; max-width:400px; max-height:810px;" >',
                            '<md-card>',
                            '<div ng-if="parent!=null">',
                            '<div><label>Parent element ({{parentType}})</label></div>',
                            '<div><md-button class="md-raised" style="width: auto;" ng-click="navigateParent(parent)">{{parent.label}}</md-button></div>',
                            '</div>',
                            '</md-card>',
                            '<md-card>',
                            '<div ng-repeat="property in properties">',
                            //Input text
                            '<input-text ng-if="property.type==inputType.text" key="{{property.key}}" value="property.value" ></input-text>',
                            //Input bool. TODO: create directive
                            '<input-bool ng-if="property.type==inputType.bool" key="{{property.key}}" value="property.value"  handler="property.handler(value)" ></input-bool>',
                            //Input options
                            '<input-select ng-if="property.type==inputType.options" value="property.value" handler="property.handler(value)" options="property.options" key="{{property.key}}"></input-select>',
                            //Input list
                            '<input-list ng-if="property.type==inputType.list" value="property.value" ></input-list>',
                            //Input area
                            '<input-area ng-if="property.type==inputType.area" value="property.value" key="{{property.key}}" ></input-area>',
                            //input lookup
                            '<input-lookup ng-if="property.type==inputType.lookup" open-edit-record="openEditRecord(entity, id)"  key="{{property.key}}" value="property.value" ></input-lookup>',
                            '</div>',
                            '</md-card>',
                            '<div ng-if="children.length>0">',
                            '<md-card>',
                            '<div><label>Children elements ({{childType}}s)</label></div>',
                            '<div><md-button ng-repeat="child in children" class="md-raised"  style="width: auto;" ng-click="navigateChild(child)">{{getLabel(child)}}</md-button></div>',
                            '</md-card>',
                            '</div>',
                            '</md-dialog-content>',
                            '</form>',
                            '</md-dialog>'].join("")
                        ,
                        controller: function ($scope, $mdDialog) {

                            $scope.inputType = typeInput;
                            $scope.properties = Array();
                            $scope.tree = $mainScope.tree;
                            $scope.currentElementName = $mainScope.currentModalUiControl;
                            $scope.currentElementType = $mainScope.currentModalUiControlType;
                            $scope.parent = $mainScope.getParentElementUI($scope.currentElementName, $scope.tree);
                            $scope.children = $mainScope.getChildrenElementUI($scope.currentElementName, $scope.tree);
                            $scope.element = $mainScope.getElementUI($scope.currentElementName, $scope.tree);
                            $scope.parentType = "tab";
                            if ($scope.currentElementType == "control") {
                                $scope.parentType = "section";
                            }
                            $scope.childType = "control";
                            if ($scope.currentElementType == "tab") {
                                $scope.childType = "section";
                            }
                            $scope.navigateChild = function (child) {
                                $mdDialog.cancel();
                                $mainScope.clickOnTile(child.name, $scope.childType);
                            }

                            $scope.navigateParent = function (parent) {
                                $mdDialog.cancel();
                                $mainScope.clickOnTile(parent.name, $scope.parentType);
                            }

                            $scope.openEditRecord = function (entity, id) {
                                $mdDialog.cancel();
                                $scope.$root.$broadcast('openEditRecord', { id: id, entity: entity });

                            }

                            $scope.getLabel = function (item) {
                                //TODO: when click on Webresource, the parent name apperas "[NOLABEL]"
                                if (item.label == HUDCRM_XRM.stringNoLabel) {
                                    return item.name;
                                }
                                return item.label;
                            }
                            $scope.getIfRequiredApply = function (type) {
                                if (type != "subgrid" && type != "kbsearch" && type != "webresource" && type != "iframe") {
                                    return true;
                                }
                                return false;
                            }
                            $scope.getIfDisabledApply = function (type) {
                                if (type != "subgrid" && type != "kbsearch" && type != "webresource" && type != "iframe") {
                                    return true;
                                }
                                return false;
                            }
                            $scope.getIfLengthApply = function (type) {
                                if (type == "memo" || type == "string") {
                                    return true;
                                }
                                return false;
                            }
                            $scope.getIfOptionsApply = function (type) {
                                if (type == "optionset" || type == "boolean") {
                                    return true;
                                }
                                return false;
                            }
                            $scope.getIfLookupApply = function (type) {
                                if (type == "lookup") {
                                    return true;
                                }
                                return false;
                            }
                            $scope.getIfWebresourceApply = function (type) {
                                if (type == "webresource") {
                                    return true;
                                }
                                return false;
                            }
                            if ($scope.currentElementType == "control") {
                                $scope.properties.push({ key: "Name", value: $scope.element.name, type: typeInput.text, handler: function () { } });
                                $scope.properties.push({ key: "Label", value: $scope.element.label, type: typeInput.text, handler: function () { } });
                                $scope.properties.push({ key: "Type", value: $scope.element.type, type: typeInput.text, handler: function () { } });
                                $scope.properties.push({ key: "Visible ", value: $scope.element.visible, type: typeInput.bool, handler: function (value) { $mainScope.updateVisibilityElement($scope.element.name, $scope.currentElementType, value) } });
                                if ($scope.getIfDisabledApply($scope.element.type)) {
                                    $scope.properties.push({ key: "Disabled ", value: $scope.element.disabled, type: typeInput.bool, handler: function (value) { $mainScope.updateDisabledElement($scope.element.name, $scope.currentElementType, value) } });
                                }
                                if ($scope.getIfRequiredApply($scope.element.type)) {
                                    $scope.properties.push({ key: "Required ", value: $scope.element.required, type: typeInput.options, options: [{ value: "none", display: "None" }, { value: "recommended", display: "Recommended" }, { value: "required", display: "Required" }], handler: function (value) { $mainScope.updateRequiredElement($scope.element.name, $scope.currentElementType, value) } });
                                }
                                if ($scope.getIfLengthApply($scope.element.type)) {
                                    $scope.properties.push({ key: "Text length", value: $scope.element.maxlength, type: typeInput.text, handler: function () { } });
                                }
                                if ($scope.getIfOptionsApply($scope.element.type)) {
                                    var list = Array();
                                    angular.forEach($scope.element.options, function (option) {
                                        var line = "[" + option.value + "] " + option.text;
                                        if (option.value == $scope.element.initialvalue) {
                                            line += " (Default)";
                                        }
                                        list.push(line);
                                    });
                                    $scope.properties.push({ key: "Optionset values", value: list.join("\r\n"), type: typeInput.area, handler: function () { } });
                                }
                                if ($scope.getIfLookupApply($scope.element.type)) {
                                    $scope.properties.push({ key: "Lookup info", value: $scope.element.value, type: typeInput.lookup, handler: function () { } });
                                }
                                if ($scope.getIfWebresourceApply($scope.element.type)) {
                                    $scope.properties.push({ key: "Webresurce URL", value: $scope.element.src, type: typeInput.text, handler: function () { } });
                                    $scope.properties.push({ key: "Webresurce Name", value: $scope.element.nameWR, type: typeInput.text, handler: function () { } });
                                    $scope.properties.push({ key: "Webresurce Id", value: "", type: typeInput.text, handler: function () { } });
                                    //TODO: add ID
                                }
                            } else if ($scope.currentElementType == "section") {
                                $scope.properties.push({ key: "Name", value: $scope.element.name, type: typeInput.text, handler: function () { } });
                                $scope.properties.push({ key: "Label", value: $scope.element.label, type: typeInput.text, handler: function () { } });
                                $scope.properties.push({ key: "Visible ", value: $scope.element.visible, type: typeInput.bool, handler: function (value) { $mainScope.updateVisibilityElement($scope.element.name, $scope.currentElementType, value) } });

                            } else if ($scope.currentElementType == "tab") {
                                $scope.properties.push({ key: "Name", value: $scope.element.name, type: typeInput.text, handler: function () { } });
                                $scope.properties.push({ key: "Label", value: $scope.element.label, type: typeInput.text, handler: function () { } });
                                $scope.properties.push({ key: "State", value: $scope.element.state, type: typeInput.options, options: [{ value: "collapsed", display: "Collapsed" }, { value: "expanded", display: "Expanded" }], handler: function (value) { $mainScope.updateTabState($scope.element.name, value) } });
                                $scope.properties.push({ key: "Visible ", value: $scope.element.visible, type: typeInput.bool, handler: function (value) { $mainScope.updateVisibilityElement($scope.element.name, $scope.currentElementType, value) } });
                            }
                            $scope.hide = function () {
                                $mdDialog.hide();
                            };
                            $scope.cancel = function () {
                                $mdDialog.cancel();
                            };
                            $scope.answer = function (answer) {
                                $mdDialog.hide(answer);
                            };

                        },

                    });
                };
                $scope.showUiFetchXMLMenuDialog = function ($mainScope, crmRepositoryService) {
                    $mdDialog.show({
                        parent: angular.element(document.body),
                        clickOutsideToClose: false,
                        template: ['<md-dialog  aria-label="Fetch XML">',
                            '<form ng-cloak >',
                            '<md-toolbar layout="row" >',
                            '<div class="md-toolbar-tools">',
                            '<h4>Fetch XML</h4>',
                            '<span flex></span>',
                            '<md-button class="md-icon-button" ng-click="cancel()" aria-label="Close">',
                            '<md-icon md-svg-src="img/icons/ic_close_24px.svg"></md-icon>',
                            '</md-button>',
                            '</div>',
                            '</md-toolbar>',
                            '<md-dialog-content style="width:800px; max-width:800px; max-height:810px;" >',
                            '<md-card>',
                            '<input-area rows="10" key="Fetch" value="fetch" ></input-area>',
                            '<div  layout="row" ><span flex></span><md-button class="md-raised" style="width: auto;" ng-disabled="loading" ng-click="execute()">Execute</md-button></div>',
                            '</md-card>',
                            '<md-card>',
                            '<div ng-show="loading" layout="row" layout-sm="column" layout-align="space-around" style="height:60px">',
                            '<md-progress-circular md-mode="indeterminate"></md-progress-circular>',
                            '</div>',
                            '</md-card>',

                            '<md-card ng-show="error">',
                            '<div class="md-padding">',
                            '<div><span>Error:</span></div>',
                            '<div><span style="color: red">{{errorMessage}}</span></div>',
                            '</div>',
                            '</md-card>',


                            '<md-card ng-show="results!=null">',
                            '<div ng-show="results.length==0">No results for this fetch</div>',
                            '<div style="overflow-x: scroll;">',
                            '<table  ng-show="results.length>0">',
                            '<tr>',
                            '<td  ng-style="columColor(-1)"><b>#</b></td>',
                            '<td  ng-repeat="column in columns" ng-style="columColor(-1)" style="padding:3px"><b>{{maskRelationshipIdByName(column)}} </b></td>',
                            '</tr>',
                            '<tr ng-repeat="result in results">',
                            '<td ng-style="columColor(-1)"><b>{{$index+1}}</b></td>',
                            '<td ng-repeat="column in columns" ng-style="columColor($index)">{{getValue(result, column )}}</td>',
                            '</tr>',
                            '</table>',
                            '</div>',
                            '</md-card>',
                            '</md-dialog-content>',
                            '</form>',
                            '</md-dialog>'].join("")
                        ,
                        controller: function ($scope, $mdDialog) {
                            $scope.error = false;
                            $scope.errorMessage = null;

                            $scope.columColor = function (index) {
                                var obj = null;
                                if (index == -1) {
                                    var obj = { "background-color": "rgba(0,0,255,.25)" };

                                } else {
                                    if (index % 2 === 0) {
                                        obj = { "background-color": "white" };
                                    } else {
                                        obj = { "background-color": "rgba(128,128,128,.25)" };
                                    }
                                }
                                return obj;
                            }

                            $scope.getValue = function (item, key) {
                                //console.log(item);
                                //console.log(key);
                                var type = item.types[key];
                                var value = item.values[key];
                                if (type == "EntityReference") {
                                    value = item.values[key].Name;
                                } else if (type == "OptionSetValue" || type == "Money") {
                                    value = item.values[key].Value;
                                } else if (type == "string") {
                                    if (value.length > 100) {
                                        value = value.substr(0, 100) + "...";
                                    }
                                } else if (type == "AliasedValue") {
                                    value = item.values[key].Value;
                                }
                                return value;
                            }


                            $scope.xmlToJson = function (xml) {
                                var obj = {};

                                if (xml.nodeType == 1) {
                                    if (xml.attributes.length > 0) {
                                        obj["@attributes"] = {};
                                        for (var j = 0; j < xml.attributes.length; j++) {
                                            var attribute = xml.attributes.item(j);
                                            obj["@attributes"][attribute.nodeName] = attribute.nodeValue;
                                        }
                                    }
                                } else if (xml.nodeType == 3) { // text
                                    obj = xml.nodeValue;
                                }

                                if (xml.hasChildNodes()) {
                                    for (var i = 0; i < xml.childNodes.length; i++) {
                                        var item = xml.childNodes.item(i);
                                        var nodeName = item.nodeName;
                                        if (typeof (obj[nodeName]) == "undefined") {
                                            obj[nodeName] = xmlToJson(item);
                                        } else {
                                            if (typeof (obj[nodeName].push) == "undefined") {
                                                var old = obj[nodeName];
                                                obj[nodeName] = [];
                                                obj[nodeName].push(old);
                                            }
                                            obj[nodeName].push(xmlToJson(item));
                                        }
                                    }
                                }
                                return obj;
                            };


                            $scope.maskRelationshipIdByName = function (column) {
                                if (typeof $scope.linkEntityAliases == 'undefined' || $scope.linkEntityAliases == null) {
                                    return column;
                                }
                                var ob = column;
                                for (var i = 0; i < $scope.linkEntityAliases.length; i++) {
                                    var pair = $scope.linkEntityAliases[i];
                                    if (ob.indexOf(pair.alias) > -1) {
                                        ob = ob.replace(pair.alias + ".", "");
                                        ob += " (" + pair.name + ")";
                                    }
                                }
                                return ob;
                            }

                            $scope.results = null;
                            $scope.columns = null;
                            $scope.loading = false;
                            $scope.fetch = ['<fetch version="1.0" output-format="xml-platform" mapping="logical" distinct="false">',
                                '  <entity name="account">',
                                '    <attribute name="name" />',
                                '    <attribute name="primarycontactid" />',
                                '    <attribute name="telephone1" />',
                                '    <attribute name="accountid" />',
                                '    <order attribute="name" descending="false" />',
                                '  </entity>',
                                '</fetch>'].join("\r\n");


                            $scope.linkEntityAliases = Array();
                            $scope.execute = function () {

                                $scope.error = false;
                                $scope.loading = true;
                                $scope.results = null;

                                var linked = null;
                                try {
                                    linked = $scope.fetch.match(/<link-entity[\s\S]*?>/g);
                                    if (typeof linked != 'undefined' && linked != null) {
                                        for (var i = 0; i < linked.length; i++) {
                                            var str = linked[i];
                                            var name = str.match(/name\=\"([A-Za-z0-9 _]*)\"/)[1];
                                            var alias = str.match(/alias\=\"([A-Za-z0-9 _]*)\"/)[1];
                                            $scope.linkEntityAliases.push({ name: name, alias: alias });
                                        }
                                    }
                                } catch (e) {

                                }


                                var encoded = $scope.fetch.replace(/\</g, "&lt;").replace(/\>/g, "&gt;");
                                var top = $scope.firstRecords ? $scope.numberOfTopRecords : 0;
                                crmRepositoryService.executeFetch(encoded, top).then(function (response) {
                                    try {
                                        $scope.results = response.Entities;
                                        $scope.loading = false;
                                        $scope.columns = response.Attributes;
                                    } catch (e) {
                                        $scope.error = true;
                                        $scope.loading = false;
                                        $scope.errorMessage = angular.toJson(e);
                                        console.error(e);
                                    }

                                }, function (e) {
                                    $scope.loading = false;
                                    $scope.error = true;
                                    $scope.errorMessage = HUDCRM_SOAP.deserializeFaultString(e.data);
                                    console.error(e);
                                });;
                            }

                            $scope.findValueOfAttributeInString = function (str, key) {
                                var values = str.match(/name\=\"([A-Za-z0-9 _]*)\"/);
                            }

                            $scope.cancel = function () {
                                $mdDialog.cancel();
                            };
                        },
                    });
                }
                $scope.showUiWebresourcesMenuDialog = function ($mainScope, crmRepositoryService) {
                    $mdDialog.show({
                        parent: angular.element(document.body),
                        clickOutsideToClose: true,
                        template: ['<md-dialog  aria-label="Webresources">',
                            '<form ng-cloak >',
                            '<md-toolbar layout="row" >',
                            '<div class="md-toolbar-tools">',
                            '<h4>Webresources</h4>',
                            '<span flex></span>',
                            '<md-button class="md-icon-button" ng-click="cancel()" aria-label="Close">',
                            '<md-icon md-svg-src="img/icons/ic_close_24px.svg"></md-icon>',
                            '</md-button>',
                            '</div>',
                            '</md-toolbar>',
                            '<md-dialog-content style="width:400px; max-width:400px; max-height:810px;" >',
                            '<div ng-show="loadingWebresources()" layout="row" layout-sm="column" layout-align="space-around">',
                            '<md-progress-circular md-mode="indeterminate"></md-progress-circular>',
                            '</div>',
                            '<div ng-if="!loadingWebresources() && webresources.length==0" class="md-padding">',
                            '<span>Found 0 webresources loaded in this page</span>',
                            '</div>',
                            '<div ng-if="!loadingWebresources() && webresources.length>0">',
                            '<div>',
                            '<input-bool ng-if="!loadingWebresources()" key="Show only webresources in solutions" value="showOnlyInSolution"  handler="changedShowOnlyInSolution(value)" ></input-bool>',
                            '</div>',
                            '<md-card ng-if="webresource.id != undefined" ng-repeat="webresource in webresources | filter: checkIfApply" >',
                            '<div>',
                            '<div><label>{{webresource.name}} [{{getType(webresource.webresourcetype)}}]</label></div>',
                            '<div layout="row">',
                            '<span flex></span>',
                            '<md-button class="md-raised" style="width: auto;" ng-disabled="" ng-click="openEditor(webresource)">Edit in HUD</md-button>',
                            '<md-button class="md-raised" style="width: auto;" ng-disabled="webresource.solutionid==undefined" ng-click="navigate(webresource)">Edit in CRM</md-button>',
                            '</div>',
                            '</div>',
                            '</md-card>',
                            '</div>',
                            '</md-dialog-content>',
                            '</form>',
                            '</md-dialog>'].join("")
                        ,
                        controller: function ($scope, $mdDialog) {

                            $scope.changedShowOnlyInSolution = function (newVal) {
                                $scope.showOnlyInSolution = newVal;
                            }
                            $scope.checkIfApply = function (webresource) {
                                if (!$scope.showOnlyInSolution) {
                                    return true;
                                }
                                if (typeof (webresource.solutionid) == 'undefined') {
                                    return false;
                                }
                                return true;
                            }
                            $scope.showOnlyInSolution = true;
                            $scope.navigate = function (webresource) {
                                var url = HUDCRM_TOOL.getUrl() + "/main.aspx?_CreateFromId={" + webresource.solutionid + "}&_CreateFromType=7100&appSolutionId={" + webresource.solutionid + "}&etc=9333&id={" + webresource.id + "}&pagetype=webresourceedit";
                                HUDCRM_TOOL.navigate(url);
                            }

                            $scope.openEditor = function (webresource) {
                                $mdDialog.cancel();
                                $mainScope.openEditorWr(webresource.id, null);
                            }


                            $scope.getType = function (webresourcetype) {
                                var value = "";
                                if (webresourcetype == 1) {
                                    value = "html";
                                } else if (webresourcetype == 2) {
                                    value = "css";
                                } else if (webresourcetype == 3) {
                                    value = "js";
                                }
                                return value;
                            }

                            //todo: when open this menu quickly, and the webresources are not loaded in main scope, when finished loaded it doesn't update in this menu. Need to close and open again
                            $scope.webresources = Array();
                            for (var i = 0; i < $mainScope.webresources.length; i++) {
                                var wr = $mainScope.webresources[i];
                                var o = Object();
                                o["name"] = wr["nameWR"];
                                if ("id" in wr) {
                                    o["id"] = wr["id"];
                                }
                                if ("solutionid" in wr) {
                                    o["solutionid"] = wr["solutionid"];
                                }
                                if ("webresourcetype" in wr) {
                                    o["webresourcetype"] = wr["webresourcetype"];
                                }
                                $scope.webresources.push(o);
                            }

                            $scope.loadingWebresources = function () { return $mainScope.loadingWebresources; }

                            $scope.cancel = function () {
                                $mdDialog.cancel();
                            };
                        },
                    });
                }
                $scope.showWebresourceEditMenuDialog = function ($mainScope, crmRepositoryService, webresourceId, referenced) {
                    $mdDialog.show({
                        parent: angular.element(document.body),
                        clickOutsideToClose: false,
                        template: ['<md-dialog  aria-label="Webresource editor">',
                            '<form ng-cloak >',
                            '<md-toolbar layout="row" >',
                            '<div class="md-toolbar-tools">',
                            '<h4>Webresource editor</h4>',
                            '<span flex></span>',
                            '<md-button class="md-icon-button" ng-click="cancel()" aria-label="Close">',
                            '<md-icon md-svg-src="img/icons/ic_close_24px.svg"></md-icon>',
                            '</md-button>',
                            '</div>',
                            '</md-toolbar>',
                            '<div ng-show="loadingRelated && !loadingWebresource" layout="row">',
                            '<div style="margin-right:20px">Loading referenced Webresources</div><div><md-progress-circular md-diameter="20" md-mode="indeterminate"></md-progress-circular></div>',
                            '</div>',

                            '<div layout="row">',
                            '<md-button ng-show="referenced!=null" class="md-icon-button" ng-click="back()" aria-label="Back">',
                            '<md-icon md-svg-src="img/icons/ic_keyboard_arrow_left_black_24px.svg"></md-icon>',
                            '</md-button>',
                            '<div ng-show="showRelated">',
                            '<input-select style="margin-top: 0px" ng-if="!loadingRelated && !loadingWebresource " value="relatedSelected" handler="onClickRelated(value)" options="optionsRelated" key="Related"></input-select>',
                            '</div>',
                            '</div>',

                            '<md-dialog-content style="width:1100px; max-width:1100px; max-height:400px">',
                            '<div ng-show="loadingWebresource" layout="row" layout-sm="column" layout-align="space-around">',
                            '<md-progress-circular md-mode="indeterminate"></md-progress-circular>',
                            '</div>',
                            '<div ng-show="!loadingWebresource">',
                            '<div style="width:100%" id="sourceCodeMirror"></div>',
                            '</div>',
                            '</md-dialog-content>',
                            '</form>',
                            '<div ng-show="error" layout="row" style="width:100%; padding: 4px">',
                            '<span flex></span>',
                            '<h5><span style="color:#F44336">Error:</span> {{errorMessage}}</h5>',
                            '<md-button class="md-raised" style="width: auto;" ng-click="error=false">OK</md-button>',
                            '</div>',
                            '<div ng-show="saving" layout="row" style="padding-right: 10px; width:100%">',
                            '<span flex></span>',
                            '<h4 style="margin-right: 8px;">{{stateSaving}}</h4><div  style="margin-top: 10px; max-height: 20px"><md-progress-circular md-diameter="20" md-mode="indeterminate"></md-progress-circular></div>',
                            '</div>',
                            '<div ng-show="confirmSave" layout="row" style="width:100%">',
                            '<span flex></span>',
                            '<h4>{{messageConfirm}}</h4>',
                            '<md-button class="md-raised" style="width: auto;" ng-click="doConfirmSave()">Confirm</md-button>',
                            '<md-button class="md-raised" style="width: auto;" ng-click="confirmSave=false">Cancel</md-button>',
                            '</div>',
                            '<div layout="row" ng-show="!confirmSave && !saving && !error && !loadingWebresource">',
                            '<md-button class="md-raised" style="width: auto;" ng-click="beautify()">Beautify</md-button>',
                            '<span flex></span>',
                            '<md-button class="md-raised" style="width: auto;"  ng-click="save(false)">Save</md-button>',
                            '<md-button class="md-raised" style="width: auto;"  ng-click="save(true)">Save + Publish</md-button>',
                            '</div>',
                            '</md-dialog>'].join("")
                        ,
                        controller: function ($scope, $mdDialog) {
                            $scope.back = function () {
                                $mdDialog.cancel();
                                $mainScope.openEditorWr(referenced, null);
                            }

                            $scope.onClickRelated = function (related) {
                                $mdDialog.cancel();
                                $mainScope.openEditorWr(related, webresourceId);
                            }

                            $scope.beautify = function () {
                                HUDCRM_CODEMIRROR.beautifyCodeMirror($scope.type);
                            }

                            $scope.save = function (publish) {
                                $scope.messageConfirm = "The modifications will be saved. Confirm?";
                                if (publish) {
                                    $scope.messageConfirm = "The modifications will be saved and published. Confirm?";
                                }
                                $scope.confirmSave = true;
                                $scope.publish = publish;
                            }

                            $scope.doConfirmSave = function () {
                                $scope.stateSaving = "Saving...";
                                $scope.confirmSave = false;
                                $scope.saving = true;
                                crmRepositoryService.getWebresource(webresourceId).then(function (wr) {
                                    //Download meta info for check if it has been modified since opened
                                    var modifiedOn = $scope.getAttributeValue("modifiedon", wr.Attributes);
                                    if ($scope.modifiedOn != modifiedOn) {
                                        //it has been modified
                                        $scope.saving = false;
                                        $scope.riseError("The data won't be saved. The webresource has been modified in server since you opened it by other CRM User. This scenario cannot be resolved. Close and open again the webresource editor.", null);
                                    } else {
                                        //it hasn't been modified
                                        var contentBase64 = "";
                                        try {
                                            var content = HUDCRM_CODEMIRROR.globalCodeMirror.getValue();
                                            var contentBase64 = Base64.encode(content);
                                        } catch (e) {
                                            $scope.saving = false;
                                            $scope.riseError("Error encoding the data to base64.", null);
                                            return;
                                        }
                                        crmRepositoryService.saveWebresource(webresourceId, contentBase64).then(function () {
                                            //Saved ok
                                            crmRepositoryService.getWebresource(webresourceId).then(function (wr) {
                                                //downloaded new metadata OK
                                                var modifiedOn = $scope.getAttributeValue("modifiedon", wr.Attributes);
                                                $scope.modifiedOn = modifiedOn;
                                                if ($scope.publish) {
                                                    $scope.stateSaving = "Publishing...";
                                                    crmRepositoryService.publishWebresource(webresourceId).then(function () {
                                                        //update metadata again (changed when published)
                                                        crmRepositoryService.getWebresource(webresourceId).then(function (wr) {
                                                            var modifiedOn = $scope.getAttributeValue("modifiedon", wr.Attributes);
                                                            $scope.modifiedOn = modifiedOn;
                                                            $scope.saving = false;
                                                        }, function (error) {
                                                            //error downloading metadata
                                                            $scope.saving = false;
                                                            $scope.riseError("Error downloading new metadata after saved. The Webresource has been saved but not published. More info in console.", error.data);
                                                        });
                                                    }, function (error) {
                                                        //error publishing
                                                        $scope.saving = false;
                                                        $scope.riseError("Error while publishing. More info in console", error.data);
                                                    });
                                                } else {
                                                    $scope.saving = false;
                                                }
                                            }, function (error) {
                                                //error downloading metadata
                                                $scope.saving = false;
                                                $scope.riseError("Error downloading new metadata after saved. The Webresource has been saved but not published. More info in console.", error.data);
                                            });
                                        }, function (error) {
                                            //error saving
                                            $scope.saving = false;
                                            $scope.riseError("Error while saving. More info in console", error.data);
                                        });
                                    }
                                }, function (e) { console.error(e); });
                            }
                            $scope.riseError = function (message, extraData) {
                                $scope.error = true;
                                $scope.errorMessage = message;
                                if (typeof (extraData) != 'undefined' && extraData != null) {
                                    console.error(extraData);
                                }
                            }
                            $scope.referenced = referenced;
                            $scope.relatedSelected = null;
                            $scope.optionsRelated = Array();
                            $scope.loadingRelated = true;
                            $scope.loadingWebresource = true;
                            $scope.showRelated = false;
                            $scope.type = null;
                            $scope.confirmSave = false;
                            $scope.publish = false;
                            $scope.messageConfirm = "";
                            $scope.modifiedOn = null;
                            $scope.error = false;
                            $scope.errorMessage = "";
                            $scope.saving = false;
                            $scope.stateSaving = "";
                            crmRepositoryService.getWebresource(webresourceId).then(function (wr) {
                                var content = Base64.decode($scope.getAttributeValue("content", wr.Attributes));
                                var name = $scope.getAttributeValue("name", wr.Attributes);
                                var type = $scope.getAttributeValue("webresourcetype", wr.Attributes)["Value"]
                                var modifiedOn = $scope.getAttributeValue("modifiedon", wr.Attributes);

                                $scope.type = type;
                                $scope.modifiedOn = modifiedOn;
                                HUDCRM_CODEMIRROR.initialize(content, type, "sourceCodeMirror");
                                $scope.loadingWebresource = false;
                                if (type != HUDCRM_CODEMIRROR.typeWebresource.html) {    //html
                                    $scope.loadingRelated = false;
                                    $scope.showRelated = false;
                                    return;
                                }
                                //load related
                                $scope.showRelated = true;
                                var related = HUDCRM_COMMONFUNCTIONS.getRelatedJSAndCSS(content);
                                if (typeof (related) != 'undefined' && related != null && related.length > 0) {
                                    crmRepositoryService.getWebresourcesId(related).then(function (wrs) {
                                        angular.forEach(wrs["Entities"], function (wr) {
                                            $scope.optionsRelated.push({ display: wr["values"]["name"], value: wr["values"]["webresourceid"] })
                                        });
                                        $scope.loadingRelated = false;
                                    }, function (e) { console.error(e); });
                                } else {
                                    $scope.loadingRelated = false;
                                }

                            }, function (e) { console.error(e); });
                            $scope.getAttributeValue = function (attributeName, attributes) {
                                for (var i = 0; i < attributes.length; i++) {
                                    var attribute = attributes[i];
                                    if (attribute["key"] == attributeName) {
                                        return attribute["value"];
                                    }
                                }
                            }
                            $scope.cancel = function () {
                                HUDCRM_CODEMIRROR.unload();
                                $mdDialog.cancel();
                            };
                        },
                    });
                }
                $scope.showUiMetadataDialog = function ($mainScope, crmRepositoryService) {
                    $mdDialog.show({
                        parent: angular.element(document.body),
                        clickOutsideToClose: true,
                        template: ['<md-dialog  aria-label="Metadata info">',
                            '<form ng-cloak >',
                            '<md-toolbar layout="row" >',
                            '<div class="md-toolbar-tools">',
                            '<md-button ng-if="showingFields" class="md-icon-button" ng-click="goBack()" aria-label="back">',
                            '<md-icon md-svg-src="img/icons/ic_keyboard_arrow_left_white_24px.svg"></md-icon>',
                            '</md-button>',
                            '<h4>Entities and fields metadata info</h4>',
                            '<md-button ng-if="!loadingEntities()" class="md-icon-button" ng-click="download()" aria-label="download">',
                            '<md-icon md-svg-src="img/icons/ic_file_download_white_24px.svg"></md-icon>',
                            '</md-button>',
                            '<span flex></span>',
                            '<md-button class="md-icon-button" ng-click="cancel()" aria-label="Close">',
                            '<md-icon md-svg-src="img/icons/ic_close_24px.svg"></md-icon>',
                            '</md-button>',
                            '</div>',
                            '</md-toolbar>',
                            '<md-dialog-content style="width:1100px; max-width:1100px; max-height:810px;" >',
                            '<div ng-show="loadingEntities() || loadingFields" layout="row" layout-sm="column" layout-align="space-around">',
                            '<md-progress-circular md-mode="indeterminate"></md-progress-circular>',
                            '</div>',
                            '<div ng-if="!loadingEntities() && showingEntities" >',
                            '<div><label>Entities info</label></div>',
                            '<md-input-container  class="md-block" style="width:100%; padding-left:10px; padding-right:10px; margin:0px; margin-top: 10px" > ',
                            '<label >Filter</label>',
                            '<input style="font-size: 16px" ng-model="inputData.filterTextEntities">',
                            '</md-input-container>',
                            '<table  class="table table-hover table-mc-light-blue">',
                            '<thead>',
                            '<tr style="color: black">',
                            '<th><h5>#</h5></th>',
                            '<th><h5>Display name</h5></th>',
                            '<th><h5>Logical name</h5></th>',
                            '<th><h5>Schema name</h5></th>',
                            '<th><h5>Typecode</h5></th>',
                            '<th><h5>Fields</h5></th>',
                            '</tr>',
                            '</thead>',
                            '<tbody>',
                            '<tr ng-repeat="entity in entities()">',
                            '<td>{{$index+1}}</td>',
                            '<td>{{entity.displayName}}</td>',
                            '<td>{{entity.logicalName}}</td>',
                            '<td>{{entity.schemaName}}</td>',
                            '<td>{{entity.typeCode}}</td>',
                            '<td><md-button class="md-raised" style="width: auto;" ng-click="loadFields(entity)">Fields</md-button></td>',
                            '</tr>',
                            '</tbody>',
                            '</table>',
                            '</div>',
                            '<div ng-if="!loadingFields && showingFields">',
                            '<div><label>{{currentEntity.displayName}} ({{currentEntity.logicalName}})</label></div>',

                            '<md-tabs md-dynamic-height md-border-bottom>',
                            '<md-tab label="Fields">',
                            '<md-input-container class="md-block" style="width:100%; padding-left:10px; padding-right:10px; margin:0px; margin-top: 10px" > ',
                            '<label >Filter</label>',
                            '<input style="font-size: 16px" ng-model="inputData.filterTextFields">',
                            '</md-input-container>',
                            '<table  class="table table-hover table-mc-light-blue">',
                            '<thead>',
                            '<tr style="color: black">',
                            '<th><h5>#</h5></th>',
                            '<th><h5>Display name</h5></th>',
                            '<th><h5>Logical name</h5></th>',
                            '<th><h5>Schema name</h5></th>',
                            '<th><h5>Type</h5></th>',
                            '</tr>',
                            '</thead>',
                            '<tbody>',
                            '<tr ng-repeat="field in fields()">',
                            '<td>{{$index+1}}</td>',
                            '<td>{{field.displayName}}</td>',
                            '<td>{{field.logicalName}}</td>',
                            '<td>{{field.schemaName}}</td>',
                            '<td>{{field.type}}</td>',
                            '</tr>',
                            '</tbody>',
                            '</table>',
                            '</md-tab>',
                            '<md-tab label="Relationships 1:N">',

                            '<table  class="table table-hover table-mc-light-blue">',
                            '<thead>',
                            '<tr style="color: black">',
                            '<th><h5>#</h5></th>',
                            '<th><h5>Schema name</h5></th>',
                            '<th><h5>Referenced Entity</h5></th>',
                            '<th><h5>Referenced Attribute</h5></th>',
                            '<th><h5>Referencing Entity</h5></th>',
                            '<th><h5>Referencing Attribute</h5></th>',
                            '<th><h5>Type</h5></th>',
                            '</tr>',
                            '</thead>',
                            '<tbody>',
                            '<tr ng-repeat="relation in currentFields.relations">',
                            '<td>{{$index+1}}</td>',
                            '<td>{{relation.schemaName}}</td>',
                            '<td>{{relation.referencedEntity}}</td>',
                            '<td>{{relation.referencedAttribute}}</td>',
                            '<td>{{relation.referencingEntity}}</td>',
                            '<td>{{relation.referencingAttribute}}</td>',
                            '<td>{{relation.type}}</td>',
                            '</tr>',
                            '</tbody>',
                            '</table>',
                            '</md-tab>',

                            '<md-tab ng-if="currentFields.relationsNN.length>0" label="Relationships N:M">',
                            '<table  class="table table-hover table-mc-light-blue">',
                            '<thead>',
                            '<tr style="color: black">',
                            '<th><h5>#</h5></th>',
                            '<th><h5>Entity 1</h5></th>',
                            '<th><h5>Entity 1 Attribute</h5></th>',
                            '<th><h5>Entity 2</h5></th>',
                            '<th><h5>Entity 2 Attribute</h5></th>',
                            '<th><h5>Intersect Entity</h5></th>',
                            '<th><h5>Type</h5></th>',
                            '</tr>',
                            '</thead>',
                            '<tbody>',
                            '<tr ng-repeat="relation in currentFields.relationsNN">',
                            '<td>{{$index+1}}</td>',
                            '<td>{{relation.entity1Entity}}</td>',
                            '<td>{{relation.entity1Attribute}}</td>',
                            '<td>{{relation.entity2Entity}}</td>',
                            '<td>{{relation.entity2Attribute}}</td>',
                            '<td>{{relation.intersectEntityName}}</td>',
                            '<td>{{relation.type}}</td>',
                            '</tr>',
                            '</tbody>',
                            '</table>',
                            '</md-tab>',

                            '</div>',
                            '</md-dialog-content>',
                            '</form>',
                            '</md-dialog>'].join("")
                        ,
                        controller: function ($scope, $mdDialog) {

                            $scope.loadingEntities = function () { return $mainScope.loadingMetadataEntities; }
                            $scope.currentFields = null;
                            $scope.currentEntity = null;
                            $scope.showingEntities = true;
                            $scope.loadingFields = false;
                            $scope.showingFields = false;
                            $scope.inputData = { filterTextEntities: "", filterTextFields: "" };

                            $scope.download = function () {

                                var version = HUDCRM_CORE.getApplicationVersion();
                                var headerInfo = HUDCRM_COMMONFUNCTIONS.getCRMHeaderInfo(version);
                                var orgName = headerInfo["ORG_UNIQUE_NAME"];
                                var fileName = "";
                                var data = "";
                                if ($scope.showingFields) {
                                    //fields
                                    fileName = orgName + "_" + $scope.currentEntity["logicalName"] + "_FieldsMetadata.csv";
                                    data += "Display name;Logical name;Schema name;Type\r\n";
                                    var fields = $scope.fields();
                                    for (var i = 0; i < fields.length; i++) {
                                        data += fields[i]["displayName"] + ";";
                                        data += fields[i]["logicalName"] + ";";
                                        data += fields[i]["schemaName"] + ";";
                                        data += fields[i]["type"] + ";";
                                        data += "\r\n";
                                    }
                                    HUDCRM_TOOL.downloadPlainText(fileName, data);

                                    //relations
                                    data = "";
                                    var relations1n = $scope.currentFields.relations;
                                    fileName = orgName + "_" + $scope.currentEntity["logicalName"] + "_RelationsOneToManyMetadata.csv";
                                    data += "Schema name;Referenced Entity;Referenced Attribute;Referencing Entity;Referencing Attribute;Type\r\n";

                                    for (var i = 0; i < relations1n.length; i++) {
                                        data += relations1n[i]["schemaName"] + ";";
                                        data += relations1n[i]["referencedEntity"] + ";";
                                        data += relations1n[i]["referencedAttribute"] + ";";
                                        data += relations1n[i]["referencingEntity"] + ";";
                                        data += relations1n[i]["referencingAttribute"] + ";";
                                        data += relations1n[i]["type"] + ";";
                                        data += "\r\n";
                                    }
                                    HUDCRM_TOOL.downloadPlainText(fileName, data);

                                    if ($scope.currentFields.relationsNN.length > 0) {
                                        data = "";
                                        var relationsnn = $scope.currentFields.relationsNN;
                                        fileName = orgName + "_" + $scope.currentEntity["logicalName"] + "_RelationsManyToManyMetadata.csv";
                                        data += "Entity 1;Entity 1 Attribute;Entity 2;Entity 2 Attribute;Intersect Entity;Type\r\n";
                                        for (var i = 0; i < relationsnn.length; i++) {
                                            data += relationsnn[i]["entity1Entity"] + ";";
                                            data += relationsnn[i]["entity1Attribute"] + ";";
                                            data += relationsnn[i]["entity2Entity"] + ";";
                                            data += relationsnn[i]["entity2Attribute"] + ";";
                                            data += relationsnn[i]["intersectEntityName"] + ";";
                                            data += relationsnn[i]["type"] + ";";
                                            data += "\r\n";
                                        }
                                        HUDCRM_TOOL.downloadPlainText(fileName, data);
                                    }
                                } else {
                                    fileName = orgName + "_EntitiesMetadata.csv";
                                    data += "Display name;Logical name;Schema name;Typecode\r\n";
                                    var entities = $scope.entities();

                                    for (var i = 0; i < entities.length; i++) {
                                        data += entities[i]["displayName"] + ";";
                                        data += entities[i]["logicalName"] + ";";
                                        data += entities[i]["schemaName"] + ";";
                                        data += entities[i]["typeCode"] + ";";
                                        data += "\r\n";
                                    }
                                    HUDCRM_TOOL.downloadPlainText(fileName, data);
                                }


                            }

                            $scope.goBack = function () {
                                $scope.showingEntities = true;
                                $scope.showingFields = false;
                            }
                            $scope.loadFields = function (entity) {
                                $scope.loadingFields = true;
                                $scope.showingEntities = false;
                                var entityName = entity["logicalName"];
                                $scope.currentEntity = entity;
                                var cached = $mainScope.getCachedMetadataFields(entityName);
                                if (cached == null) {
                                    crmRepositoryService.retrieveMetadataFieldsEntity(entityName).then(function (fields) {
                                        var fieldsSorted = HUDCRM_TOOL.sortArray(fields["attributes"], "displayName");
                                        fields["attributes"] = fieldsSorted;
                                        $mainScope.addCachedMetadataFields(entityName, fields);
                                        $scope.showFields(fields);
                                    }, function (e) { console.error(e); });
                                } else {
                                    $scope.showFields(cached);
                                }
                            }
                            $scope.showFields = function (fields) {
                                $scope.currentFields = fields;
                                $scope.showingFields = true;
                                $scope.loadingFields = false;

                            }


                            function checkIfContain(entity, property, value) {
                                if (typeof entity[property] != 'undefined' && entity[property] != null) {
                                    if (angular.lowercase(entity[property]).indexOf(value) > -1) {
                                        return true;
                                    }
                                }
                                return false;
                            }


                            $scope.fields = function () {
                                var value = angular.lowercase($scope.inputData.filterTextFields);
                                if (value == null || value == "") {
                                    return $scope.currentFields.attributes;
                                }
                                return $scope.currentFields.attributes.filter(function (field) {
                                    var inDisplay = checkIfContain(field, "displayName", value);
                                    if (inDisplay) return true;
                                    var inLogical = checkIfContain(field, "logicalName", value);
                                    if (inLogical) return true;
                                    var inSchema = checkIfContain(field, "schemaName", value);
                                    if (inSchema) return true;
                                    var inCode = checkIfContain(field, "type", value);
                                    if (inCode) return true;
                                    return false;
                                });
                            };

                            $scope.entities = function () {
                                var value = angular.lowercase($scope.inputData.filterTextEntities);
                                if (value == null || value == "") {
                                    return $mainScope.metadataEntities;
                                }
                                return $mainScope.metadataEntities.filter(function (entity) {
                                    var inDisplay = checkIfContain(entity, "displayName", value);
                                    if (inDisplay) return true;
                                    var inLogical = checkIfContain(entity, "logicalName", value);
                                    if (inLogical) return true;
                                    var inSchema = checkIfContain(entity, "schemaName", value);
                                    if (inSchema) return true;
                                    var inCode = checkIfContain(entity, "typeCode", value);
                                    if (inCode) return true;
                                    return false;
                                });
                            };


                            $scope.cancel = function () {
                                $mdDialog.cancel();
                            };
                        },
                    });
                }
                $scope.showUiEditRecordDialog = function ($mainScope, $timeout, crmRepositoryService, entity, id, history) {
                    $mdDialog.show({
                        parent: angular.element(document.body),
                        //clickOutsideToClose: true,
                        template: ['<md-dialog  aria-label="Edit record">',
                            '<form ng-cloak >',
                            '<md-toolbar layout="row" >',
                            '<div class="md-toolbar-tools">',
                            '<div ng-show="raiseSuccess" layout="row"><md-icon style="color: #4CFF4C; " md-svg-src="img/icons/ic_check_circle_white_24px.svg"></md-icon><h4 style="margin-right: 30px">Updated!</h4></div>',
                            '<md-button ng-if="showGoBack()||showMenuUpdate" class="md-icon-button" ng-click="back()" aria-label="back">',
                            '<md-icon md-svg-src="img/icons/ic_keyboard_arrow_left_white_24px.svg"></md-icon>',
                            '</md-button>',
                            '<md-button ng-if="!showMenuUpdate && showGoForward()" class="md-icon-button" ng-click="forward()" aria-label="forward">',
                            '<md-icon md-svg-src="img/icons/ic_keyboard_arrow_right_white_24px.svg"></md-icon>',
                            '</md-button>',
                            '<md-button ng-click="doShowMenuUpdate()" ng-if="modifications.length>0" class="md-fab md-mini" aria-label="update">{{modifications.length}}</md-button>',
                            '<div layout="row"><h4 style="margin-right: 10px" >Current record: </h4><span ng-if="currentEntity!=null && currentRecord==null"><h4>{{currentEntity}}</h4></span><span ng-if="currentEntity!=null && currentRecord!=null"><h4>{{currentEntity}}, {{currentRecord.Id}}</h4></span></div>',
                            '<span flex></span>',
                            '<md-button class="md-icon-button" ng-click="cancel()" aria-label="Close">',
                            '<md-icon md-svg-src="img/icons/ic_close_24px.svg"></md-icon>',
                            '</md-button>',
                            '</div>',
                            '</md-toolbar>',
                            '<md-dialog-content ng-if="showMenuUpdate" style="width:1000px; max-width:1000px; max-height:400px;" >',
                            '<table  class="table table-hover table-mc-light-blue">',
                            '<thead>',
                            '<tr style="color: black">',
                            '<th><h5>#</h5></th>',
                            '<th><h5>Display name</h5></th>',
                            '<th><h5>Logical name</h5></th>',
                            '<th><h5>Type</h5></th>',
                            '<th><h5>Old Value</h5></th>',
                            '<th><h5>New Value</h5></th>',
                            '<th><h5>Remove</h5></th>',
                            '</tr>',
                            '</thead>',
                            '<tbody>',
                            '<tr ng-repeat="modificacion in modifications">',
                            '<td>{{$index+1}}</td>',
                            '<td>{{modificacion.attribute.displayName}}</td>',
                            '<td>{{modificacion.attribute.logicalName}}</td>',
                            '<td>{{modificacion.attribute.type}}</td>',
                            '<td>{{displayValue(modificacion.attribute)}}</td>',
                            '<td>{{getNewValueDisplay(modificacion.attribute)}}</td>',
                            '<td><md-icon ng-click="removeModification(modificacion.attribute.logicalName)" class="icon-clickable" md-svg-src="img/icons/ic_delete_grey_24px.svg"></md-icon></td>',
                            '</tr>',
                            '</tbody>',
                            '</table>',
                            '</md-dialog-content>',
                            '<md-dialog-content ng-if="!showMenuUpdate" style="width:1000px; max-width:1000px; max-height:400px;" >',
                            '<div ng-show="loadingEntities()" layout="row" layout-sm="column" layout-align="space-around">',
                            '<md-progress-circular md-mode="indeterminate"></md-progress-circular>',
                            '</div>',
                            '<div ng-if="!loadingEntities()" >',
                            '<div layout="row">',
                            '<h4 style="padding-left:8px;padding-right:8px">Search record:</h4>',
                            '<div flex><input-autocomplete-entities selected="startingEntity" get-label="getLabelEntity(item)" filter-fn="filterFnEntities(item,query)" changed="entityChanged(item)" key="Select an entity" items="entities()"></input-autocomplete-entities></div>',
                            '<div flex ng-if="currentEntity!=null">',
                            '<loading-small show="loadingPrimaryField" key="Loading attributes..."></loading-small>',
                            '<input-autocomplete-lookup selected="startingId" ng-if="!loadingPrimaryField" query-promise="queryFunction(query)" get-label="getLabelRecord(item)" changed="recordChanged(item)" key="Search record or set GUID"></input-autocomplete-lookup>',
                            '</div>',
                            '</div>', //row

                            '<div ng-if="id!=null">',
                            '<div ng-show="loadingRecord" layout="row" layout-sm="column" layout-align="space-around">',
                            '<md-progress-circular md-mode="indeterminate"></md-progress-circular>',
                            '</div>',
                            '<div ng-if="currentRecord!=null">',
                            '<md-tabs md-dynamic-height md-border-bottom>',
                            '<md-tab label="Attributes"   md-on-select="clickTab(1)">',

                            '<md-input-container  class="md-block" style="width:100%; padding-left:10px; padding-right:10px; margin:0px; margin-top: 10px" > ',
                            '<label>Filter</label>',
                            '<input style="font-size: 16px" ng-model="inputData.filter">',
                            '</md-input-container>',
                            '<table  class="table table-hover table-mc-light-blue">',
                            '<thead>',
                            '<tr style="color: black">',
                            '<th><h5>Display name</h5></th>',
                            '<th><h5>Logical name</h5></th>',
                            '<th><h5>Type</h5></th>',
                            '<th><h5>Value</h5></th>',
                            '</tr>',
                            '</thead>',
                            '<tbody>',
                            '<tr ng-click="edit(attribute)" style="cursor: pointer" ng-repeat="attribute in attributes()">',
                            '<td>{{attribute.displayName}}</td>',
                            '<td>{{attribute.logicalName}}</td>',
                            '<td>{{attribute.type}}</td>',
                            '<td ng-if="getIfModificated(attribute)">',
                            '<md-icon ng-click="removeModification(attribute.logicalName)" style="margin-right:6px" class="icon-clickable-red" md-svg-src="img/icons/ic_cached_black_24px.svg"></md-icon>',
                            '{{getNewValueDisplay(attribute)}}',
                            '</td>',
                            '<td ng-if="!getIfModificated(attribute)">',
                            '{{displayValue(attribute)}}',
                            '<md-icon ng-if="getIfSearchableLookup(attribute)" ng-click="initializeEditRecord(getEntityForLookup(attribute), getIdForLookup(attribute))" style="margin-left:6px" class="icon-clickable" md-svg-src="img/icons/ic_search_black_24px.svg"></md-icon>',
                            '<md-icon ng-if="getIfSearchableLookup(attribute)" ng-click="navigateInBrowser(getEntityForLookup(attribute), getIdForLookup(attribute))" style="margin-left:6px" class="icon-clickable" md-svg-src="img/icons/ic_launch_black_24px.svg"></md-icon>',

                            '</td>',
                            '</tr>',
                            '</tbody>',
                            '</table>',

                            '</md-tab>',
                            '<md-tab label="Related records"  md-on-select="clickTab(2)">',

                            '<div flex><input-autocomplete-relations selected="startingRelation" filter-fn="filterFnRelation(item,query)" changed="relationChanged(item)" key="Select relation" items="relations()"></input-autocomplete-relations></div>',
                            '<loading-big show="loadingRelatedRecords" key="Loading related records..."></loading-big>',
                            '<loading-big show="loadingRelatedPrimaryField" key="Loading related entity metadata..."></loading-big>',

                            '<div ng-if="relatedRecords!=null">',
                            '<table  class="table table-hover table-mc-light-blue">',
                            '<thead>',
                            '<tr style="color: black">',
                            '<th><h5>Name</h5></th>',
                            '<th><h5>Id</h5></th>',
                            '<th><h5>Created On</h5></th>',
                            '<th><h5>Created By</h5></th>',
                            '</tr>',
                            '</thead>',
                            '<tbody>',
                            '<tr ng-repeat="related in relatedRecords">',
                            '<td>',
                            '{{related.name}}',
                            '<md-icon ng-click="initializeEditRecord(currentRelation.referencingEntity, related.id)" style="margin-left:6px" class="icon-clickable" md-svg-src="img/icons/ic_search_black_24px.svg"></md-icon>',
                            '<md-icon ng-click="navigateInBrowser(currentRelation.referencingEntity, related.id)" style="margin-left:6px" class="icon-clickable" md-svg-src="img/icons/ic_launch_black_24px.svg"></md-icon>',
                            '</td>',
                            '<td>{{related.id}}</td>',
                            '<td>{{related.createdon}}</td>',
                            '<td>{{related.createdby}}</td>',
                            '</tr>',
                            '</tbody>',
                            '</table>',
                            '</div>',



                            '</md-tab>',
                            '</md-tabs>',
                            '</div>',
                            '</div>',

                            '</div>',
                            '</md-dialog-content>',
                            '</form>',

                            '<div layout="row" ng-show="editing && !showMenuUpdate">',
                            '<div style="text-align:right; padding-right:6px;margin-left: 6px"><h4 style=" margin-top: 16px;">Edit attribute:</h4></div>',
                            '<div flex style="maring-top:6px;">',
                            '<div ng-if="!cannotBeModified">',
                            '<input-text ng-if="checkType(currentAttribute, \'string\')" value="currentValue.val"></input-text>',
                            '<input-text ng-if="checkType(currentAttribute, \'entityname\')" value="currentValue.val"></input-text>',
                            '<input-text ng-if="checkType(currentAttribute, \'bigint\')" value="currentValue.val"></input-text>',
                            '<input-select ng-if="checkType(currentAttribute, \'boolean\')"  value="currentValue.val" options="getOptions(currentAttribute)" ></input-select>',
                            '<input-select ng-if="checkType(currentAttribute, \'picklist\')"  value="currentValue.val[\'Value\']" options="getOptions(currentAttribute)" ></input-select>',
                            '<input-decimal ng-if="checkType(currentAttribute, \'decimal\')"  value="currentValue.val" precision="getPrecision(currentAttribute)"></input-decimal>',
                            '<input-float ng-if="checkType(currentAttribute, \'double\')"  value="currentValue.val" precision="getPrecision(currentAttribute)"></input-float>',
                            '<input-integer ng-if="checkType(currentAttribute, \'integer\')"  value="currentValue.val"></input-integer>',
                            '<input-decimal ng-if="checkType(currentAttribute, \'money\')"  value="currentValue.val[\'Value\']" precision="4"></input-decimal>',
                            '<input-area ng-if="checkType(currentAttribute, \'memo\')"  value="currentValue.val"></input-area>',
                            '<input-datetime ng-if="checkType(currentAttribute, \'datetime\')" date-only="getDateonly(currentAttribute)"  value="currentValue.val"></input-datetime>',
                            '<div ng-if="checkType(currentAttribute, \'lookup\') || checkType(currentAttribute, \'owner\')">',
                            '<input-autocomplete-lookup selected="currentLookupValue" ng-if="!loadingMetadataEntityForLookup" query-promise="queryFunctionForEditRecord(query, currentAttribute)" get-label="getLabelRecord(item)" changed="editLookupValueChanged(item)" key="Search record or set GUID"></input-autocomplete-lookup>',
                            '<div ng-show="loadingMetadataEntityForLookup" style="margin-top: 12px" layout="row" layout-sm="column" layout-align="space-around"><md-progress-circular md-mode="indeterminate" md-diameter="26" ></md-progress-circular></div>',
                            '</div>',
                            //TODO
                            //'<div ng-if="checkType(currentAttribute, \'customer\') ">',
                            //include select with two options: account and contact. After that everything is the same than in lookup
                            //'<input-autocomplete-lookup ng-if="!loadingMetadataEntityForLookup" query-promise="queryFunctionForEditRecord(query, currentAttribute)" get-label="getLabelRecord(item)" changed="editLookupValueChanged(item)" key="Search record or set GUID"></input-autocomplete-lookup>',
                            //'<div ng-show="loadingMetadataEntityForLookup" style="margin-top: 12px" layout="row" layout-sm="column" layout-align="space-around"><md-progress-circular md-mode="indeterminate" md-diameter="26" ></md-progress-circular></div>',
                            //'</div>',
                            //
                            '</div>',
                            '<div ng-if="cannotBeModified"><h4 style=" margin-top: 16px;">Selected attribute cannot be modified</h4></div>',
                            '</div>',
                            '<md-button class="md-raised" ng-if="!cannotBeModified" style="width: auto;" ng-click="saveModification()" ng-disabled="buttonSaveDisabled()">Save</md-button>',
                            '<md-button class="md-raised" style="width: auto;" ng-click="cancelEdit()">Cancel</md-button>',
                            '</div>',
                            '<div layout="row"  ng-if="!error && showMenuUpdate && modifications.length>0 && showUpdateButton">',
                            '<span flex></span>',
                            '<h4 style="margin-top: 16px; padding-right: 6px;">{{messageUpdateState}}</h4>',
                            '<div ng-show="updating" style="margin-top: 12px; margin-right:10px" layout="row" layout-sm="column" layout-align="space-around"><md-progress-circular md-mode="indeterminate" md-diameter="26" ></md-progress-circular></div>',
                            '<md-button ng-if="!updating" class="md-raised" style="width: auto;" ng-click="update()">Update</md-button>',
                            '</div>',
                            '<div layout="row"  ng-if="error">',
                            '<span flex></span>',
                            '<h4 style="margin-top: 16px; padding-right: 6px; color:red">Error: {{messageUpdateError}}</h4>',
                            '<md-button class="md-raised" style="width: auto;" ng-click="okError()">Ok</md-button>',
                            '</div>',
                            '<div layout="row"  ng-if="confirmUpdate">',
                            '<span flex></span>',
                            '<h4 style="margin-top: 16px; padding-right: 6px;">All this modifications will be saved in Database. ¿Do you want to continue?</h4>',
                            '<md-button class="md-raised" style="width: auto;" ng-click="cancelConfirmUpdate()">Cancel</md-button>',
                            '<md-button class="md-raised" style="width: auto;" ng-click="doConfirmUpdate()">Continue</md-button>',
                            '</div>',
                            '</md-dialog>'].join("")
                        ,

                        controller: function ($scope, $mdDialog) {

                            $scope.navigateInBrowser = function (entity, id) {
                                HUDCRM_TOOL.navigateRecordWithEntityName(entity, id);
                            }

                            $scope.clickTab = function (tab) {
                                if (tab == 1) { //attributes

                                } else {  //relatedRecods
                                    $scope.editing = false;
                                }
                            }

                            $scope.getEntityForLookup = function (attribute) {
                                if (attribute["type"] == "Owner") {
                                    return "systemuser";
                                }
                                return attribute["relatedEntity"];
                                
                            }
                            $scope.getIdForLookup = function (attribute) {
                                var logicalName = attribute["logicalName"];
                                var value = $scope.getValue(logicalName);
                                return value["Id"];
                            }

                            $scope.getIfSearchableLookup = function (attribute) {
                                var val = $scope.displayValue(attribute);
                                if (val == null || val == "") {
                                    return false;
                                }
                                return $scope.checkType(attribute, "lookup") || $scope.checkType(attribute, "owner");
                            }

                            $scope.getIfModificated = function (attribute) {
                                for (var i = 0; i < $scope.modifications.length; i++) {
                                    if ($scope.modifications[i]["attribute"]["logicalName"] == attribute["logicalName"]) {
                                        return true;
                                    }
                                }
                                return false;
                            }

                            $scope.removeModification = function (logicalName) {
                                for (var i = 0; i < $scope.modifications.length; i++) {
                                    if ($scope.modifications[i]["attribute"]["logicalName"] == logicalName) {
                                        $scope.modifications.splice(i, 1);
                                        break;
                                    }
                                }
                            }

                            $scope.editLookupValueChanged = function (item) {
                                $scope.currentValue.val = item;
                            }

                            $scope.okError = function () {
                                $scope.error = false;
                            }

                            $scope.hideRaiseSuccess = function () {
                                $scope.raiseSuccess = false;
                            }

                            $scope.doConfirmUpdate = function () {
                                $scope.confirmUpdate = false;
                                $scope.showUpdateButton = true;
                                $scope.messageUpdateState = "Updating...";
                                $scope.updating = true;
                                var modifiedAttributes = $scope.getAttributesForUpdate($scope.modifications);
                                var id = $scope.currentRecord["Id"];
                                var entity = $scope.currentEntity;
                                console.log(entity);
                                console.log(id);
                                crmRepositoryService.updateRecord(id, entity, modifiedAttributes).then(function () {
                                    crmRepositoryService.retrieveRecord($scope.id, $scope.currentEntity).then(function (record) {
                                        $scope.currentRecord = record;
                                        $scope.messageUpdateState = "Update values";
                                        $scope.updating = false;
                                        $scope.showMenuUpdate = false;
                                        $scope.showUpdateButton = false;
                                        $scope.raiseSuccess = true;
                                        $timeout($scope.hideRaiseSuccess, 5000);
                                        $scope.modifications = Array();
                                    });
                                }, function (e) {
                                    $scope.updating = false;
                                    $scope.messageUpdateState = "Update values";
                                    var error = HUDCRM_SOAP.deserializeFaultString(e.data);
                                    $scope.error = true;
                                    $scope.messageUpdateError = error;
                                    console.error(error);
                                });
                                console.log(modifiedAttributes);
                            }
                            $scope.update = function () {
                                $scope.confirmUpdate = true;
                                $scope.showUpdateButton = false;

                            }
                            $scope.cancelConfirmUpdate = function () {
                                $scope.confirmUpdate = false;
                                $scope.showUpdateButton = true;

                            }

                            $scope.getAttributesForUpdate = function (modifications) {
                                var attrs = Array();
                                for (var i = 0; i < modifications.length; i++) {
                                    var attribute = modifications[i]["attribute"];
                                    var value = modifications[i]["value"];
                                    var logicalName = attribute["logicalName"];
                                    var type = attribute["type"];
                                    if (type == "Lookup" || type == "Owner") {
                                        var related = type != "Owner" ? attribute["relatedEntity"] : "systemuser";
                                        var id = "";
                                        if (typeof value != 'undefined') {
                                            id = value["id"];
                                        }
                                        attrs.push({ type: type, logicalName: logicalName, val: id, entityRelated: related });
                                    } else if (type == "Picklist") {
                                        var option = "";
                                        if (typeof value != 'undefined') {
                                            option = value["Value"];
                                        }
                                        attrs.push({ type: type, logicalName: logicalName, val: option });
                                    } else if (type == "Boolean") {
                                        attrs.push({ type: type, logicalName: logicalName, val: value });
                                    } else if (type == "Money") {
                                        var ammount = "";
                                        if (typeof value != 'undefined') {
                                            ammount = value["Value"];
                                        }
                                        attrs.push({ type: type, logicalName: logicalName, val: ammount });
                                    } else if (type == "Memo") {
                                        attrs.push({ type: type, logicalName: logicalName, val: value });
                                    } else {
                                        attrs.push({ type: type, logicalName: logicalName, val: value });
                                    }
                                }
                                return attrs;
                            }


                            $scope.getNewValueDisplay = function (attribute) {
                                var modification = $scope.getModification(attribute);
                                

                                if (typeof modification == 'undefined' || modification == null) {
                                    return null;
                                }
                                var type = attribute["type"];
                                if (type == "Lookup" || type == "Owner") {
                                    return modification["value"] + " (" + modification["id"] + ")";
                                } else if (type == "Picklist") {
                                    return $scope.getDisplayValueOfOptionSet(attribute.options, modification["Value"]);
                                } else if (type == "Boolean") {
                                    return $scope.getDisplayValueOfOptionSet(attribute.options, modification);
                                } else if (type == "Money") {
                                    return modification["Value"];
                                } else {
                                    return modification;
                                }
                            }

                            $scope.getDisplayValueOfOptionSet = function (options, value) {
                                for (var i = 0; i < options.length; i++) {
                                    if (options[i]["value"].toString() == value.toString()) {
                                        return options[i]["display"]
                                    }
                                }
                                return null;
                            }

                            $scope.getModification = function (attribute) {
                                for (var i = 0; i < $scope.modifications.length; i++) {
                                    if ($scope.modifications[i]["attribute"]["logicalName"] == attribute["logicalName"]) {
                                        return $scope.modifications[i]["value"];
                                    }
                                }
                                return null;
                            }

                            $scope.back = function () {
                                if ($scope.showMenuUpdate) {
                                    $scope.showMenuUpdate = false;
                                    $scope.showUpdateButton = false;
                                } else {
                                    for (var i = 0; i < history.length; i++) {
                                        if (history[i]["id"] == $scope.id && history[i]["entity"] == $scope.currentEntity) {
                                            $scope.initializeEditRecord(history[i - 1]["entity"], history[i - 1]["id"]);
                                            break;
                                        }
                                    }
                                }
                            }

                            $scope.forward = function () {
                                for (var i = 0; i < history.length; i++) {
                                    if (history[i]["id"] == $scope.id && history[i]["entity"] == $scope.currentEntity) {
                                        $scope.initializeEditRecord(history[i + 1]["entity"], history[i + 1]["id"]);
                                        break;
                                    }
                                }
                            }


                            $scope.queryFunctionForEditRecord = function (query, attribute) {
                                var type = attribute["type"];
                                if ($scope.currentPrimaryFieldEditValue == null || $scope.currentPrimaryFieldEditValue == "") {
                                    return null;
                                }
                                if ((typeof (attribute["relatedEntity"]) == 'undefined' || attribute["relatedEntity"] == null) && type != "Owner") {
                                    return null;
                                }

                                var entity = type != "Owner" ? attribute["relatedEntity"] : "systemuser";
                                var primaryField = $scope.currentPrimaryFieldEditValue;

                                var pattNoBraces = new RegExp(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/);
                                var pattBraces = new RegExp(/^\{?[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}‌​\}?$/);
                                var resNoBraces = pattNoBraces.test(query);
                                var resBraces = pattBraces.test(query);
                                if (resNoBraces || resBraces) {
                                    var promise = crmRepositoryService.retrieveRecordPrimaryFieldValue(query, entity, primaryField);
                                    return promise.then(function (resutls) {
                                        var options = getOptionsForLookupSearchSingleRecord(resutls, "id", "value", primaryField);
                                        return options;
                                    }, function () {
                                        return options = Array();
                                    });
                                } else {
                                    var promise = crmRepositoryService.requestSearchForLookup(query, entity, primaryField);
                                    return promise.then(function (resutls) {
                                        var options = getOptionsForLookupSearch(resutls, "id", "value", primaryField);
                                        return options;
                                    }, function (e) { console.error(e); });
                                }
                            }


                            $scope.doShowMenuUpdate = function () {
                                $scope.showMenuUpdate = true;
                                $scope.showUpdateButton = true;
                                $scope.confirmUpdate = false;
                                $scope.error = false;
                            }

                            $scope.getDateonly = function (attribute) {
                                return attribute["dateonly"];
                            }
                            $scope.getPrecision = function (attribute) {
                                return attribute["precision"];
                            }
                            $scope.getOptions = function (attribute) {
                                return attribute["options"];
                            }

                            $scope.saveModification = function () {
                                $scope.upsertValueInModifications($scope.currentAttribute, $scope.currentValue.val);
                                console.log($scope.modifications);
                                $scope.editing = false;
                            }

                            $scope.buttonSaveDisabled = function () {
                                return false;
                                
                            }

                            $scope.upsertValueInModifications = function (attribute, newValue) {
                                var found = false;
                                var attrName = attribute["logicalName"];
                                for (var i = 0; i < $scope.modifications.length; i++) {
                                    if ($scope.modifications[i]["attribute"]["logicalName"] == attrName) {
                                        $scope.modifications[i]["value"] = newValue;
                                        found = true;
                                    }
                                }
                                if (!found) {
                                    $scope.modifications.push({ attribute: attribute, value: newValue });
                                }
                            }

                            $scope.cancelEdit = function () {
                                $scope.cannotBeModified = false;
                                $scope.editing = false;
                                $scope.currentAttribute = null;
                                $scope.currentValue.val = null;
                            }

                            $scope.edit = function (attribute) {
                                $scope.cannotBeModified = false;
                                $scope.editing = true;
                                $scope.currentAttribute = null;
                                $scope.currentValue.val = null;

                                $scope.currentAttribute = attribute;
                                var val = $scope.value(attribute);
                                
                                var type = attribute["type"];

                                if (type == "Uniqueidentifier" || type == "Virtual") {
                                    $scope.cannotBeModified = true;
                                    return;
                                }

                                if (type == "Lookup" || type == "Owner") {
                                    var moreThanOneRelated = attribute["moreThanOneRelated"];
                                    if (moreThanOneRelated) {
                                        $scope.cannotBeModified = true;
                                        return;
                                    }
                                    console.log(attribute);
                                    $scope.loadingMetadataEntityForLookup = true;

                                    var entityName = type == "Lookup" ? attribute["relatedEntity"] : "systemuser";
                                    console.log("Downloading meta for " + entityName);
                                    var cached = $mainScope.getCachedMetadataFields(entityName);
                                    if (cached == null) {
                                        crmRepositoryService.retrieveMetadataFieldsEntity(entityName).then(function (fields) {
                                            $mainScope.addCachedMetadataFields(entityName, fields);
                                            $scope.currentPrimaryFieldEditValue = fields["PrimaryNameAttribute"];
                                            $scope.loadingMetadataEntityForLookup = false;
                                        }, function (e) { console.error(e); });
                                    } else {
                                        $scope.currentPrimaryFieldEditValue = cached["PrimaryNameAttribute"];
                                        $scope.loadingMetadataEntityForLookup = false;
                                    }
                                }
                                console.log(val);
                                if (val == null) {
                                    $scope.currentLookupValue = null;
                                } else {
                                    $scope.currentLookupValue = { "value": val["Name"], "id": val["Id"] };
                                }

                                $scope.currentValue.val = val;
                            }


                            $scope.checkType = function (attr, type) {
                                return attr != null && angular.lowercase(attr["type"]) == angular.lowercase(type);
                            }

                            $scope.attributes = function () {
                                var value = angular.lowercase($scope.inputData.filter);
                                if (value == null || value == "") {
                                    return $scope.entityMetadata["attributes"];
                                }
                                return $scope.entityMetadata["attributes"].filter(function (attribute) {

                                    var inDisplay = checkIfMatch(attribute, "displayName", value);
                                    if (inDisplay) return true;
                                    var inLogical = checkIfMatch(attribute, "logicalName", value);
                                    if (inLogical) return true;
                                    var inType = checkIfMatch(attribute, "type", value);
                                    if (inType) return true;
                                    var formatted = angular.lowercase($scope.displayValue(attribute));
                                    if (formatted != null && typeof (formatted) != 'object') {
                                        if (formatted.indexOf(value) >= 0) {
                                            return true;
                                        }
                                    }
                                    return false;
                                });
                            }
                            function checkIfMatch(attr, property, value) {
                                if (typeof attr[property] != 'undefined' && attr[property] != null) {
                                    if (angular.lowercase(attr[property]).indexOf(value) > -1) {
                                        return true;
                                    }
                                }
                            }

                            $scope.displayValue = function (attribute) {
                                var logicalName = attribute["logicalName"];
                                var type = attribute["type"];
                                var value = $scope.getFormattedValue(logicalName);
                                if (type == "Lookup" || type == "Owner" || type == "Customer") {
                                    if (typeof value == 'object' && value != null) {
                                        return value["Name"] + " (" + value["Id"] + ")";
                                    }
                                }
                                return value;
                            }

                            $scope.value = function (attribute) {
                                var logicalName = attribute["logicalName"];
                                var value = $scope.getValue(logicalName);
                                return value;
                            }

                            $scope.getValue = function (logicalName) {
                                for (var i = 0; i < $scope.currentRecord["Attributes"].length; i++) {
                                    var attribute = $scope.currentRecord["Attributes"][i];
                                    if (attribute["key"] == logicalName) {
                                        return attribute["value"];
                                    }
                                }
                                return null;
                            }

                            $scope.getFormattedValue = function (logicalName) {
                                for (var i = 0; i < $scope.currentRecord["FormattedValues"].length; i++) {
                                    var attribute = $scope.currentRecord["FormattedValues"][i];
                                    if (attribute["key"] == logicalName) {
                                        return attribute["value"];
                                    }
                                }
                                return null;
                            }

                            $scope.recordChanged = function (record) {

                                $scope.editing = false;
                                $scope.modifications = Array();
                                $scope.id = null;
                                $scope.loadingRecord = true;
                                if (typeof (record) == 'undefined') {
                                    $scope.currentRecord = null;
                                    return;
                                }

                                $scope.id = record["id"];
                                crmRepositoryService.retrieveRecord($scope.id, $scope.currentEntity).then(function (record) {
                                    $scope.currentRecord = record;
                                    $scope.loadingRecord = false;
                                }, function (e) { console.log(e); });
                            }


                            $scope.queryFunction = function (query) {
                                if ($scope.currentEntityPrimaryField == null || $scope.currentEntityPrimaryField == "") {
                                    return null;
                                }
                                var pattNoBraces = new RegExp(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/);
                                var pattBraces = new RegExp(/^\{?[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}‌​\}?$/);
                                var resNoBraces = pattNoBraces.test(query);
                                var resBraces = pattBraces.test(query);
                                if (resNoBraces || resBraces) {
                                    var promise = crmRepositoryService.retrieveRecordPrimaryFieldValue(query, $scope.currentEntity, $scope.currentEntityPrimaryField);
                                    return promise.then(function (resutls) {
                                        var options = getOptionsForLookupSearchSingleRecord(resutls, "id", "value", $scope.currentEntityPrimaryField);
                                        return options;
                                    }, function () {
                                        return options = Array();
                                    }, function (e) { console.error(e); });

                                } else {
                                    var promise = crmRepositoryService.requestSearchForLookup(query, $scope.currentEntity, $scope.currentEntityPrimaryField);
                                    return promise.then(function (resutls) {
                                        var options = getOptionsForLookupSearch(resutls, "id", "value", $scope.currentEntityPrimaryField);
                                        return options;
                                    }, function (e) { console.error(e); });
                                }
                            }


                            function getOptionsForLookupSearchSingleRecord(deserializedObj, keyAttribute, displayAttribute, primaryField) {
                                var o = Object();
                                o[keyAttribute] = deserializedObj.Id;
                                for (var i = 0; i < deserializedObj.Attributes.length; i++) {
                                    var result = deserializedObj.Attributes[i];
                                    if (result["key"] == primaryField) {
                                        o[displayAttribute] = result["value"];
                                    }
                                }
                                return [o];
                            }

                            function getOptionsForLookupSearch(deserializedObj, keyAttribute, displayAttribute, primaryField) {
                                var options = Array();
                                for (var i = 0; i < deserializedObj.Entities.length; i++) {
                                    var result = deserializedObj.Entities[i];
                                    var obj = Object();
                                    obj[keyAttribute] = result.id;
                                    obj[displayAttribute] = result.values[primaryField];
                                    options.push(obj);
                                }
                                return options;
                            }

                            $scope.getLabelRecord = function (record) {
                                if (typeof record["value"] == 'undefined' || record["value"] == null || record["value"] == "") {
                                    return record["id"];
                                }
                                return record["value"];
                            }

                            $scope.getLabelEntity = function (entity) {
                                if (typeof (entity["displayName"]) != 'undefined') {
                                    return entity["displayName"];
                                }
                                return entity["logicalName"];
                            }

                            $scope.relationChanged = function (item) {
                                $scope.relatedRecords = null;
                                if (typeof (item) == 'undefined') {
                                    $scope.loadingRelatedPrimaryField = false;
                                    $scope.loadingRelatedRecords = false;
                                    $scope.currentRelation = null;
                                    return;
                                }
                                $scope.currentRelation = item;
                                $scope.loadingRelatedPrimaryField = true;
                                var entityName = item["referencingEntity"];
                                var cached = $mainScope.getCachedMetadataFields(entityName);
                                if (cached == null) {
                                    crmRepositoryService.retrieveMetadataFieldsEntity(entityName).then(function (fields) {
                                        $mainScope.addCachedMetadataFields(entityName, fields);
                                        $scope.loadedRelatedPrimaryField(item, fields);

                                    }, function (e) { console.error(e); });
                                } else {
                                    $scope.loadedRelatedPrimaryField(item, cached);
                                }
                            }
                            $scope.loadedRelatedPrimaryField = function (relations, meta) {
                                $scope.loadingRelatedPrimaryField = false;
                                $scope.loadingRelatedRecords = true;

                                var id = $scope.currentRecord["Id"];
                                var relatedEntity = relations["referencingEntity"];
                                var relatedAttribute = relations["referencingAttribute"];
                                var primaryNameAttr = meta["PrimaryNameAttribute"];
                                var primaryIdAttr = meta["PrimaryIdAttribute"];

                                crmRepositoryService.getRelatedRecords(id, relatedEntity, relatedAttribute, primaryNameAttr).then(function (records) {
                                    var related = Array();
                                    for (var i = 0; i < records["Entities"].length; i++) {
                                        var vals = records["Entities"][i]["formattedValues"];
                                        related.push({ name: vals[primaryNameAttr], id: vals[primaryIdAttr], createdby: vals["createdby"], createdon: vals["createdon"] });
                                    }
                                    $scope.relatedRecords = related;
                                    $scope.loadingRelatedRecords = false;
                                    $scope.loadingRelatedPrimaryField = false;
                                }, function (e) { console.error(e); });
                            }
                            $scope.entityChanged = function (item) {
                                $scope.startingId = null;
                                $scope.editing = false;
                                $scope.id = null;
                                if (typeof item == 'undefined') {
                                    $scope.currentEntity = null;
                                    return;
                                }
                                $scope.currentEntity = item["logicalName"];
                                $scope.loadingPrimaryField = true;
                                var entityName = $scope.currentEntity;
                                var cached = $mainScope.getCachedMetadataFields(entityName);
                                if (cached == null) {
                                    crmRepositoryService.retrieveMetadataFieldsEntity(entityName).then(function (fields) {
                                        $mainScope.addCachedMetadataFields(entityName, fields);
                                        $scope.primaryFieldLoaded(fields);

                                    }, function (e) { console.error(e); });
                                } else {
                                    $scope.primaryFieldLoaded(cached);
                                }
                            }
                            $scope.primaryFieldLoaded = function (entity) {
                                $scope.relatedRecords = null;
                                $scope.currentEntityPrimaryField = entity["PrimaryNameAttribute"];
                                $scope.entityMetadata = entity;
                                $scope.relations1n = entity["relations"].filter(function (relation) { return relation["type"] == "1:N" });
                                $scope.loadingPrimaryField = false;
                            }

                            $scope.filterFnRelation = function (relation, query) {
                                var text = relation["referencedAttribute"] + relation["referencedEntity"] + relation["referencingAttribute"] + relation["referencingEntity"] + relation["schemaName"];
                                return (angular.lowercase(text).indexOf(query) >= 0);
                            }

                            $scope.filterFnEntities = function (entity, query) {
                                var text = entity["logicalName"];
                                if (typeof (entity["displayName"]) != 'undefined') {
                                    text += entity["displayName"];
                                }
                                return (angular.lowercase(text).indexOf(query) >= 0);
                            }

                            $scope.loadingEntities = function () { return $mainScope.loadingMetadataEntities; }
                            $scope.entities = function () { return $mainScope.metadataEntities; }
                            $scope.relations = function () { return $scope.relations1n; }

                            $scope.cancel = function () {
                                $mdDialog.cancel();
                            };



                            $scope.initializeEditRecord = function (entity, id) {

                                console.log("Initializing for " + entity + " - " + id);

                                $scope.startingRelation = null;
                                $scope.startingEntity = null;
                                $scope.startingId = null;
                                $scope.inputData = { filter: "" };
                                $scope.loadingPrimaryField = false;
                                $scope.currentEntity = null;
                                $scope.currentEntityPrimaryField = null;
                                $scope.id = null;
                                $scope.loadingRecord = false;
                                $scope.currentRecord = null;
                                $scope.entityMetadata = null;
                                $scope.relations1n = null;
                                $scope.editing = false;
                                $scope.currentAttribute = null;
                                $scope.currentValue = { val: null };
                                $scope.currentLookupValue = null;
                                $scope.showMenuUpdate = false;
                                $scope.updating = false;
                                $scope.error = false;
                                $scope.messageUpdateError = "";
                                $scope.loadingMetadataEntityForLookup = false;
                                $scope.cannotBeModified = false;
                                $scope.messageUpdateState = "Update values";
                                $scope.currentPrimaryFieldEditValue = null;
                                $scope.showUpdateButton = false;
                                $scope.confirmUpdate = false;
                                $scope.loadingRelatedRecords = false;
                                $scope.loadingRelatedPrimaryField = false;
                                $scope.relatedRecords = null;
                                $scope.currentRelation = null;
                                $scope.modifications = Array();
                                $scope.raiseSuccess = false;

                                //Process of loading a record
                                //replica of "entityChanged":
                                $scope.startingId = null;
                                $scope.editing = false;
                                $scope.id = null;
                                $scope.currentEntity = entity;
                                $scope.loadingPrimaryField = true;

                                if (entity == null || id == null) {
                                    return;
                                }


                                var entityName = $scope.currentEntity;
                                //set visible the entity in the entitySelectPicklist
                                var objEntity = $scope.getEntityObject(entityName);
                                $scope.startingEntity = objEntity == null ? { "logicalName": entityName } : objEntity;
                                var cached = $mainScope.getCachedMetadataFields(entityName);
                                if (cached == null) {
                                    crmRepositoryService.retrieveMetadataFieldsEntity(entityName).then(function (fields) {
                                        $mainScope.addCachedMetadataFields(entityName, fields);
                                        $scope.primaryFieldLoaded(fields);


                                        //replica of "recordChanged":
                                        $scope.recordChangedOnInitialize(id);

                                    }, function (e) { console.log(e); })
                                } else {
                                    $scope.primaryFieldLoaded(cached);
                                    //replica of "recordChanged":
                                    $scope.recordChangedOnInitialize(id);
                                }
                            }

                            $scope.getEntityObject = function (logicalname) {
                                var entities = $scope.entities();
                                if (entities == null) {
                                    return null;
                                }
                                for (var i = 0; i < entities.length; i++) {
                                    if (entities[i]["logicalName"] == logicalname) {
                                        return entities[i];
                                    }
                                }
                                return null;
                            }

                            $scope.recordChangedOnInitialize = function (id) {
                                //set visible the Id in the record select pick list

                                $scope.editing = false;
                                $scope.modifications = Array();
                                $scope.id = null;
                                $scope.loadingRecord = true;
                                $scope.id = id;
                                crmRepositoryService.retrieveRecord($scope.id, $scope.currentEntity).then(function (record) {
                                    $scope.currentRecord = record;
                                    $scope.startingId = { "id": id };
                                    $scope.addToHistory($scope.currentEntity, id);
                                    $scope.loadingRecord = false;
                                }, function (e) { console.log(e); });
                            }
                            $scope.addToHistory = function (entity, id) {
                                var found = false;
                                for (var i = 0; i < history.length; i++) {
                                    if (history[i]["entity"] == entity && history[i]["id"] == id) {
                                        found = true;
                                        break;
                                    }
                                }
                                if (!found) {
                                    history.push({ entity: entity, id: id });
                                }
                            }
                            $scope.showGoBack = function () {
                                if (history.length > 1) {
                                    if (history[0]["id"] == $scope.id && history[0]["entity"] == $scope.currentEntity) {
                                        return false;
                                    } else {
                                        return true;
                                    }
                                }
                                return false;
                            }
                            $scope.showGoForward = function () {
                                if (history.length > 1) {
                                    if (history[history.length - 1]["id"] == $scope.id && history[history.length - 1]["entity"] == $scope.currentEntity) {
                                        return false;
                                    } else {
                                        return true;
                                    }
                                }
                                return false;
                            }
                            $scope.initializeEditRecord(entity, id);

                        },
                    });
                }
                $scope.showUiCountRecordsDialog = function ($mainScope, crmRepositoryService) {
                    $mdDialog.show({
                        parent: angular.element(document.body),
                        clickOutsideToClose: false,
                        template: ['<md-dialog  aria-label="Records count">',
                            '<form ng-cloak >',
                            '<md-toolbar layout="row" >',
                            '<div class="md-toolbar-tools">',
                            '<h4>Records count</h4>',
                            '<span flex></span>',
                            '<md-button class="md-icon-button" ng-click="cancel()" aria-label="Close">',
                            '<md-icon md-svg-src="img/icons/ic_close_24px.svg"></md-icon>',
                            '</md-button>',
                            '</div>',
                            '</md-toolbar>',
                            '<md-dialog-content style="width:1100px; max-width:1100px; max-height:810px;" >',
                            '<div ng-show="loadingEntities()" layout="row" layout-sm="column" layout-align="space-around">',
                            '<md-progress-circular md-mode="indeterminate"></md-progress-circular>',
                            '</div>',

                            '<div ng-if="!loadingEntities()">',
                            '<md-tabs md-dynamic-height md-border-bottom>',
                            '<md-tab label="Entity">',

                            '<div layout="row">',
                            '<div flex>',
                            '<input-autocomplete-entities selected="starterEntity" get-label="getLabelEntity(item)" filter-fn="filterFnEntities(item,query)" changed="entityChanged(item)" key="Select an entity" items="entities()"></input-autocomplete-entities>',
                            '</div>',
                            '<div flex ng-if="currentEntity!=null">',
                            '<div ng-show="loadingViews" layout="row" layout-sm="column" layout-align="space-around">',
                            '<md-progress-circular md-mode="indeterminate" md-diameter="26" ></md-progress-circular>',
                            '</div>',
                            '<input-autocomplete-entities selected="starterView" ng-if="!loadingViews" get-label="getLabelView(item)" filter-fn="filterFnViews(item,query)" items="views.Entities"  changed="viewChanged(item)" key="Search view of the entity"></input-autocomplete-entities>',
                            '</div>',
                            '<div ng-if="currentView!=null">',
                            '<md-button class="md-icon-button" ng-click="startView()" aria-label="start" ng-disabled="counting" >',
                            '<md-icon md-svg-src="img/icons/ic_done_black_24px.svg"></md-icon>',
                            '</md-button>',
                            '</div>',
                            '</div>', //row

                            '</md-tab>',
                            '<md-tab label="Fetch">',

                            '<input-area rows="10" key="Fetch" value="fetchCoded.val" ></input-area>',
                            '<div  layout="row" ><span flex></span><md-button class="md-raised" style="width: auto;" ng-disabled="loading" ng-click="startFetch()" ng-disabled="counting">',
                            '<md-icon md-svg-src="img/icons/ic_done_black_24px.svg"></md-icon>',
                            '</md-button></div>',

                            '</md-tab>',
                            '</md-tabs>',

                            '<md-card ng-show="error">',
                            '<div class="md-padding">',
                            '<div><span>Error:</span></div>',
                            '<div><span style="color: red">{{errorMessage}}</span></div>',
                            '</div>',
                            '</md-card>',

                            '<div ng-if="counting">',
                            '<div layout="row" layout-align="center center">',
                            '<h3 style="margin-right:20px">{{countNumber}}...</h3>',
                            '<md-progress-circular ng-if="counting" md-mode="indeterminate"></md-progress-circular>',
                            '</div>',
                            '</div>',
                            '<div ng-if="finished && !error">',
                            '<div layout="row" layout-align="center center">',
                            '<h3 style="margin-right:20px">{{countNumber}}</h3>',
                            '<div><md-icon style="color:#77dd77" md-svg-src="img/icons/ic_done_black_64px.svg"></md-icon></div>',
                            '</div>',
                            '</div>',

                            '</div>',

                            '</md-dialog-content>',
                            '</form>',
                            '</md-dialog>'].join("")
                        ,
                        controller: function ($scope, $mdDialog) {

                            $scope.error = false;
                            $scope.errorMessage = null;


                            $scope.loadingViews = false;
                            $scope.views = null;
                            $scope.loadingEntities = function () { return $mainScope.loadingMetadataEntities };
                            $scope.currentEntity = null;
                            $scope.starterEntity = null;

                            $scope.counting = false;
                            $scope.currentView = null;
                            $scope.starterView = null;

                            $scope.countNumber = 0;
                            $scope.finished = false;

                            $scope.entities = function () { return $mainScope.metadataEntities; }

                            $scope.countAll = false;
                            $scope.fetch = null;
                            $scope.fetchCoded = {
                                val: ['<fetch version="1.0" output-format="xml-platform" mapping="logical" distinct="false">',
                                    '  <entity name="account">',
                                    '    <attribute name="name" />',
                                    '    <attribute name="primarycontactid" />',
                                    '    <attribute name="telephone1" />',
                                    '    <attribute name="accountid" />',
                                    '    <order attribute="name" descending="false" />',
                                    '  </entity>',
                                    '</fetch>'].join("\r\n")
                            };

                            $scope.startFetch = function () {
                                $scope.countNumber = 0;
                                $scope.counting = true;
                                $scope.finished = false;
                                $scope.fetch = $scope.fetchCoded.val.replace(/\</g, "&lt;").replace(/\>/g, "&gt;");
                                console.log($scope.fetchCoded.val);
                                $scope.countRecordsOfView(1, null);
                            }

                            $scope.startView = function () {
                                $scope.countNumber = 0;
                                $scope.counting = true;
                                $scope.finished = false;
                                if ($scope.countAll) {
                                    $scope.countAllRecords(1, null);
                                } else {
                                    $scope.countRecordsOfView(1, null);
                                }
                            }

                            $scope.viewChanged = function (item) {
                                $scope.counting = false;
                                $scope.countNumber = 0;
                                $scope.finished = false;
                                if (typeof item == 'undefined') {
                                    $scope.currentView = null;
                                    return;
                                }
                                $scope.currentView = item;
                                if (item["id"] == HUDCRM_TOOL.GUID_EMPTY) {
                                    $scope.countAll = true;
                                } else {
                                    var fetch = item["values"]["fetchxml"];
                                    $scope.fetch = fetch;
                                    $scope.countAll = false;
                                }
                            }

                            $scope.countRecordsOfView = function (page, cookie) {
                                if (!$scope.counting) {
                                    return;
                                }
                                crmRepositoryService.getRecordsCountingFetch($scope.fetch, page, cookie).then(function (response) {
                                    try {
                                        $scope.error = false;
                                        $scope.countNumber += response["Entities"].length;
                                        if (response["MoreRecords"] == "true") {
                                            var _page = page + 1;
                                            var cookie = response["PagingCookie"];
                                            $scope.countRecordsOfView(_page, cookie);
                                        } else {
                                            $scope.counting = false;
                                            $scope.finished = true;
                                        }
                                    } catch (e) {
                                        $scope.counting = false;
                                        $scope.finished = true;
                                        $scope.error = true;
                                        $scope.errorMessage = angular.toJson(e);
                                        console.error(e);
                                    }

                                }, function (e) {
                                    $scope.counting = false;
                                    $scope.finished = true;
                                    $scope.error = true;
                                    $scope.errorMessage = HUDCRM_SOAP.deserializeFaultString(e.data);
                                    console.error(e);
                                });
                            }

                            $scope.countAllRecords = function (page, cookie) {
                                if (!$scope.counting) {
                                    return;
                                }
                                crmRepositoryService.getRecordsCountingAll($scope.currentEntity, page, cookie).then(function (response) {
                                    $scope.countNumber += response["Entities"].length;
                                    try {
                                        $scope.error = false;
                                        if (response["MoreRecords"] == "true") {
                                            var _page = page + 1;
                                            var cookie = response["PagingCookie"];
                                            $scope.countAllRecords(_page, cookie);
                                        } else {
                                            $scope.counting = false;
                                            $scope.finished = true;
                                        }
                                    } catch (e) {
                                        $scope.counting = false;
                                        $scope.finished = true;
                                        $scope.error = true;
                                        $scope.errorMessage = angular.toJson(e);
                                        console.error(e);
                                    }

                                }, function (e) {
                                    $scope.counting = false;
                                    $scope.finished = true;
                                    $scope.error = true;
                                    $scope.errorMessage = HUDCRM_SOAP.deserializeFaultString(e.data);
                                    console.error(e);
                                });
                            }


                            $scope.entityChanged = function (item) {
                                $scope.currentView = null;
                                $scope.finished = false;
                                $scope.counting = false;
                                $scope.views = null;
                                if (typeof item == 'undefined') {
                                    $scope.currentEntity = null;
                                    return;
                                }
                                $scope.currentEntity = item["logicalName"];
                                $scope.loadingViews = true;
                                crmRepositoryService.getSavedQueries($scope.currentEntity).then(function (views) {
                                    $scope.loadingViews = false;
                                    views["Entities"].unshift({ id: HUDCRM_TOOL.GUID_EMPTY, values: { name: "All the records" } });
                                    $scope.views = views;
                                }, function (e) { console.log(e); });
                            }

                            $scope.getLabelView = function (view) {
                                if (typeof (view["values"]["name"]) != 'undefined') {
                                    return view["values"]["name"];
                                }
                                return view["id"];
                            }

                            $scope.getLabelEntity = function (entity) {
                                if (typeof (entity["displayName"]) != 'undefined') {
                                    return entity["displayName"];
                                }
                                return entity["logicalName"];
                            }

                            $scope.filterFnEntities = function (entity, query) {
                                var text = entity["logicalName"];
                                if (typeof (entity["displayName"]) != 'undefined') {
                                    text += entity["displayName"];
                                }
                                return (angular.lowercase(text).indexOf(query) >= 0);
                            }
                            $scope.filterFnViews = function (view, query) {
                                if (query == "" || query == null) {
                                    return true;
                                }
                                var text = $scope.getLabelView(view);
                                return (angular.lowercase(text).indexOf(query) >= 0);
                            }

                            $scope.cancel = function () {
                                $scope.counting = false;
                                $mdDialog.cancel();
                            };
                        },
                    });
                }
                $scope.showUiQueryConstructorDialog = function ($mainScope, crmRepositoryService) {
                    $mdDialog.show({
                        parent: angular.element(document.body),
                        clickOutsideToClose: false,
                        template: ['<md-dialog  aria-label="Query constructor">',
                            '<form ng-cloak >',
                            '<md-toolbar layout="row" >',
                            '<div class="md-toolbar-tools">',
                            '<md-button class="md-icon-button" ng-if="metadataEntity!=null" ng-click="showCode()" aria-label="Code">',
                            '<md-icon md-svg-src="img/icons/ic_code_white_24px.svg"></md-icon>',
                            '</md-button>',
                            '<h4>Query constructor</h4>',
                            '<md-button ng-if="showCodeBool" class="md-icon-button" ng-click="execute()" aria-label="execute">',
                            '<md-icon md-svg-src="img/icons/ic_play_arrow_white_24px.svg"></md-icon>',
                            '</md-button>',
                            '<md-button ng-if="showCodeBool" class="md-icon-button" ng-click="download()" aria-label="download">',
                            '<md-icon md-svg-src="img/icons/ic_file_download_white_24px.svg"></md-icon>',
                            '</md-button>',
                            '<span flex></span>',
                            '<md-button class="md-icon-button" ng-click="cancel()" aria-label="Close">',
                            '<md-icon md-svg-src="img/icons/ic_close_24px.svg"></md-icon>',
                            '</md-button>',
                            '</div>',
                            '</md-toolbar>',

                            '<md-dialog-content ng-show="showCodeBool" style="width:1100px;  max-width:1100px; max-height:810px;" >',
                            '<md-input-container style="width:100%; padding-left:10px; padding-right:10px; margin-bottom:0px;" >',
                            //'<textarea rows="14" ng-model="code" max-rows="14" md-select-on-focus style="font-size: 16px;"></textarea>',
                            '<div layout="row">',
                            '<input-bool key="Integrated callbacks" value="integratedCallback"  handler="" ></input-bool>',
                            '<input-bool key="Include execution sentence" value="executionSentence"  handler="" ></input-bool>',
                            '<span flex></span>',

                            '</div>',
                            '<div style="width:100%;" id="sourceCodeMirrorQuery"></div>',

                            '</md-input-container>',
                            '</md-dialog-content>',


                            '<md-dialog-content ng-show="showConfirmExecute" style="width:1100px; max-width:1100px; max-height:810px; padding: 6px" >',
                            '<div layout="row" style="width:100%">',
                            '<span flex></span>',
                            '<h4>The javascript will be executed and any create/delete/update or whatever else command in the script will be also executed and applied to the database under your CRM user and your responsibility. For see console.log results open debugger (F12). ¿Confirm?</h4>',
                            '<md-button class="md-raised" style="width: auto;" ng-click="doConfirmExecute()">Confirm</md-button>',
                            '<md-button class="md-raised" style="width: auto;" ng-click="showConfirmExecute=false">Cancel</md-button>',
                            '</div>',
                            '</md-dialog-content>',


                            '<md-dialog-content ng-show="showError" style="width:1100px; max-width:1100px; max-height:810px; padding: 6px" >',
                            '<div layout="row" style="width:100%">',
                            '<span flex></span>',
                            '<h4>Error: {{errorMessage}}</h4>',
                            '<md-button class="md-raised" style="width: auto;" ng-click="showError=false">Ok</md-button>',
                            '</div>',
                            '</md-dialog-content>',


                            '<md-dialog-content ng-show="!showCodeBool" style="width:1100px; max-width:1100px; max-height:810px;" >',

                            '<loading-big show="loadingEntities()" key="Loading entities..."></loading-big>',
                            '<div ng-if="!loadingEntities()">',

                            '<md-tabs md-dynamic-height md-border-bottom>',
                            '<md-tab label="SDK.Rest">',
                            //SDK.REST
                            '<md-tabs md-dynamic-height md-border-bottom>',
                            '<md-tab label="Create" md-on-select="updateCurrentMethod(sdkrestMethods.create)">',
                            //Create
                            '<query-constructor-input-entity selected="currentEntity" items="entities()" entity-changed="entityChanged(item)"></query-constructor-input-entity>',
                            '<loading-big show="loadingFields" key="Loading attributes..."></loading-big>',
                            '<div ng-if="!loadingFields && currentEntity!=null">',
                            '<query-constructor-input-attributes selected="selectedAttributes.val" attributes="attributes" remove-attribute="removeAttribute(attribute)"></query-constructor-input-attributes>',
                            '<query-constructor-show-code on-click="showCode()"></query-constructor-show-code>',
                            '</div>',

                            '<md-tab label="Retrieve" md-on-select="updateCurrentMethod(sdkrestMethods.retrieve)">',
                            //Retrieve
                            '<query-constructor-input-entity selected="currentEntity"  items="entities()" entity-changed="entityChanged(item)"></query-constructor-input-entity>',
                            '<loading-big show="loadingFields" key="Loading attributes and relationships..."></loading-big>',
                            '<div ng-if="!loadingFields && currentEntity!=null">',
                            '<query-constructor-input-attributes selected="selectedAttributes.val" attributes="attributes" remove-attribute="removeAttribute(attribute)"></query-constructor-input-attributes>',
                            '<query-constructor-expand-relations selected="selectedRelations.val" relations="relations" remove-relation="removeRelation(relation)"></query-constructor-expand-relations>',
                            '<query-constructor-show-code on-click="showCode()"></query-constructor-show-code>',
                            '</div>',

                            '</md-tab>',
                            '<md-tab label="Update"  md-on-select="updateCurrentMethod(sdkrestMethods.update)">',
                            //Update
                            '<query-constructor-input-entity selected="currentEntity"  items="entities()" entity-changed="entityChanged(item)"></query-constructor-input-entity>',
                            '<loading-big show="loadingFields" key="Loading attributes..."></loading-big>',
                            '<div ng-if="!loadingFields && currentEntity!=null">',
                            '<query-constructor-input-attributes selected="selectedAttributes.val" attributes="attributes" remove-attribute="removeAttribute(attribute)"></query-constructor-input-attributes>',
                            '<query-constructor-show-code on-click="showCode()"></query-constructor-show-code>',
                            '</div>',

                            '</md-tab>',
                            '<md-tab label="Delete"  md-on-select="updateCurrentMethod(sdkrestMethods.delete)">',
                            '<query-constructor-input-entity selected="currentEntity"  items="entities()" entity-changed="entityChanged(item)"></query-constructor-input-entity>',
                            '<div ng-if="currentEntity!=null">',
                            '<loading-big show="loadingFields" key="Loading attributes..."></loading-big>',
                            '<div ng-if="!loadingFields && currentEntity!=null">',
                            '<query-constructor-show-code on-click="showCode()"></query-constructor-show-code>',
                            '</div>',
                            '</div>',

                            '</md-tab>',
                            '<md-tab label="RetrieveMultiple"  md-on-select="updateCurrentMethod(sdkrestMethods.retrieveMultiple)">',
                            '<query-constructor-input-entity selected="currentEntity"  items="entities()" entity-changed="entityChanged(item)"></query-constructor-input-entity>',
                            '<loading-big show="loadingFields" key="Loading attributes..."></loading-big>',
                            '<div ng-if="!loadingFields && currentEntity!=null">',
                            '<query-constructor-input-attributes selected="selectedAttributes.val" attributes="attributes" remove-attribute="removeAttribute(attribute)"></query-constructor-input-attributes>',
                            '<query-constructor-order-by selected="selectedOrderBys.val" type="orderByType.val" attributes="attributes"  remove-attribute="removeOrderBy(attribute)"></query-constructor-order-by>',
                            '<query-constructor-skip-top skip="skip.val" top="top.val"></query-constructor-skip-top>',
                            '<query-constructor-input-filters selected="selectedFilters.val" attributes="attributesForFilter" remove-attribute="removeAttributeForFilter(attribute)"></query-constructor-input-filters>',
                            '<query-constructor-show-code on-click="showCode()"></query-constructor-show-code>',
                            '</div>',

                            '</md-tab>',
                            //END SDK.Rest
                            '</md-tabs>',

                            '</md-tab>',
                            '</md-tabs>',
                            '</div>',

                            '</md-dialog-content>',

                            '</form>',
                            '</md-dialog>'].join("")
                        ,
                        controller: function ($scope, $mdDialog) {

                            $scope.showCodeBool = false;
                            $scope.executionSentence = true;
                            $scope.libraries = { sdkrest: 1 };
                            $scope.sdkrestMethods = { create: 1, retrieve: 2, update: 3, delete: 4, retrieveMultiple: 5 };
                            $scope.currentLibrary = $scope.libraries.sdkrest;
                            $scope.currentMethod = $scope.sdkrestMethods.create;

                            $scope.selectedAttributes = { val: null };
                            $scope.selectedRelations = { val: null };
                            $scope.selectedOrderBys = { val: null };
                            $scope.selectedFilters = { val: null };
                            $scope.attributes = null;
                            $scope.attributesForFilter = null;
                            $scope.relations = null;

                            $scope.orderByType = { val: null };

                            $scope.top = { val: null };
                            $scope.skip = { val: null };

                            $scope.loadingEntities = function () { return $mainScope.loadingMetadataEntities };
                            $scope.starterEntity = null;
                            $scope.currentEntity = null;
                            $scope.loadingFields = false;

                            $scope.integratedCallback = true;

                            $scope.metadataEntity = null;

                            var defaulValueString = "Some words";
                            var defaulValueGuid = "00000000-0000-0000-0000-000000000000";
                            var defaulValueDatetime = "2016-05-12T18:20:00Z";
                            var defaulValueInt = "10";
                            var defaulValuePickList = "1000001";
                            var defaulValueDecimal = "1323.25";
                            var defaulValueBoolean = "false";
                            var defaulValueDouble = "1323.25";
                            var defaulValueMoney = "75.50";
                            var defaulValueState = "1";
                            var defaulValueEntity = "contact";
                            var defaulValueOwner = "systemuser";

                            $scope.code = null;
                            $scope.errorMessage = "";
                            $scope.showConfirmExecute = false;
                            $scope.showError = false;

                            $scope.download = function () {
                                var lines = HUDCRM_CODEMIRROR.globalCodeMirror.lineCount();
                                var code = "";
                                for (var i = 0; i < lines; i++) {
                                    code += HUDCRM_CODEMIRROR.globalCodeMirror.getLine(i);
                                    if (i < lines - 1) {
                                        code += "\r\n";
                                    }
                                }
                                HUDCRM_TOOL.downloadPlainText("HUDCRM_Query_Example_JS.txt", code);
                            }

                            $scope.execute = function () {
                                $scope.showConfirmExecute = true;
                                $scope.executionSentence = true;
                            }
                            $scope.doConfirmExecute = function () {
                                $scope.showConfirmExecute = false;
                                $scope.executionSentence = true;
                                try {
                                    console.log("Starting execution code...");
                                    var code = HUDCRM_CODEMIRROR.globalCodeMirror.getValue();
                                    eval(code);
                                } catch (e) {
                                    $scope.showError = true;
                                    $scope.errorMessage = angular.toJson(e);
                                }
                            }
                            $scope.$watch('integratedCallback', function (newVal, oldVal) {
                                if (newVal != oldVal) {
                                    $scope.updateCode();
                                }
                            });
                            $scope.$watch('executionSentence', function (newVal, oldVal) {
                                if (newVal != oldVal) {
                                    $scope.updateCode();
                                }
                            });
                            $scope.$watch('showCodeBool', function (newVal, oldVal) {
                                if (newVal != oldVal) {
                                    $scope.updateCode();
                                }
                            });

                            $scope.updateCode = function () {
                                var code = $scope.getCode();
                                if (HUDCRM_CODEMIRROR.globalCodeMirror == null) {
                                    HUDCRM_CODEMIRROR.initialize(code, 1, "sourceCodeMirrorQuery");
                                } else {
                                    HUDCRM_CODEMIRROR.globalCodeMirror.setValue(code);
                                }
                                setTimeout(HUDCRM_CODEMIRROR.globalCodeMirror.refresh, 500);
                            }

                            $scope.showCode = function () {
                                $scope.showCodeBool = !$scope.showCodeBool;
                                $scope.updateCode();

                            }


                            $scope.getCode = function () {
                                var attributes = $scope.selectedAttributes.val;
                                var relations = $scope.selectedRelations.val;
                                var orderBys = $scope.selectedOrderBys.val;
                                var typeOrderBy = $scope.orderByType.val;
                                var filters = $scope.selectedFilters.val;
                                var skip = $scope.skip.val;
                                var top = $scope.top.val;

                                var code = "";
                                var integratedCallbacks = $scope.integratedCallback;
                                var executionSentence = $scope.executionSentence;
                                if ($scope.currentMethod == $scope.sdkrestMethods.create) {
                                    code += getCreateFunction($scope.currentEntity, attributes, integratedCallbacks, executionSentence, $scope.currentMethod, $scope.metadataEntity);
                                }
                                else if ($scope.currentMethod == $scope.sdkrestMethods.update) {
                                    code += getUpdateFunction($scope.currentEntity, attributes, integratedCallbacks, executionSentence, $scope.currentMethod, $scope.metadataEntity);
                                }
                                else if ($scope.currentMethod == $scope.sdkrestMethods.retrieve) {
                                    code += getRerieveFunction($scope.currentEntity, attributes, integratedCallbacks, executionSentence, $scope.currentMethod, $scope.metadataEntity, relations);
                                }
                                else if ($scope.currentMethod == $scope.sdkrestMethods.delete) {
                                    code += getDeleteFunction($scope.currentEntity, attributes, integratedCallbacks, executionSentence, $scope.currentMethod, $scope.metadataEntity, relations);
                                }
                                else if ($scope.currentMethod == $scope.sdkrestMethods.retrieveMultiple) {
                                    code += getRerieveMultipleFunction($scope.currentEntity, attributes, integratedCallbacks, executionSentence, $scope.currentMethod, $scope.metadataEntity, orderBys, typeOrderBy, filters, skip, top);
                                }
                                if (!integratedCallbacks) {
                                    code += getSuccessCallBackCode($scope.currentMethod, $scope.currentEntity, $scope.metadataEntity, attributes, relations);
                                    code += getErrorCallBackCode($scope.currentMethod, $scope.currentEntity);
                                    if ($scope.currentMethod == $scope.sdkrestMethods.retrieveMultiple) {
                                        code += getCompleteCallBackCode($scope.currentMethod, $scope.currentEntity, attributes);
                                    }
                                }
                                return code;
                            }

                            function getSuccessCallBackCode(method, entity, metadataEntity, attributes, relations) {
                                var code = "";
                                if (method == $scope.sdkrestMethods.create) {
                                    code = "function CreateSuccessCallback (response) {\n";
                                    code += getSuccessCallBackContainCode(method, entity["logicalName"], 1, metadataEntity);
                                    code += "}\n\n";
                                }
                                else if (method == $scope.sdkrestMethods.update) {
                                    code = "function UpdateSuccessCallback () {\n";
                                    code += getSuccessCallBackContainCode(method, entity["logicalName"], 1, metadataEntity);
                                    code += "}\n\n";
                                }
                                else if (method == $scope.sdkrestMethods.retrieve) {
                                    code = "function RetrieveSuccessCallback (response) {\n";
                                    code += getSuccessCallBackContainCode(method, entity["logicalName"], 1, metadataEntity, attributes, relations);
                                    code += "}\n\n";
                                }
                                else if (method == $scope.sdkrestMethods.delete) {
                                    code = "function DeleteSuccessCallback (response) {\n";
                                    code += getSuccessCallBackContainCode(method, entity["logicalName"], 1, metadataEntity);
                                    code += "}\n\n";
                                }
                                else if (method == $scope.sdkrestMethods.retrieveMultiple) {
                                    code = "function RetrieveMultipleSuccessCallback (response) {\n";
                                    code += getSuccessCallBackContainCode(method, entity["logicalName"], 1, metadataEntity);
                                    code += "}\n\n";
                                }
                                return code;
                            }
                            function getCompleteCallBackCode(__method, __entity, __attributes) {
                                var code = "";
                                if (__method == $scope.sdkrestMethods.retrieveMultiple) {
                                    code = "function RetrieveMultipleCompleteCallback () {\n";
                                    code += getCompleteCallBackContainCode(__method, __entity, 1, __attributes);
                                    code += "}\n\n";
                                }
                                return code;
                            }


                            function getErrorCallBackCode(method, entity) {
                                var code = "";

                                if (method == $scope.sdkrestMethods.create) {
                                    code = "function CreateErrorCallback (error) {\n";
                                    code += getErrorCallBackContainCode(method, entity, 1);
                                    code += "}\n\n";
                                }
                                else if (method == $scope.sdkrestMethods.update) {
                                    code = "function UpdateErrorCallback (error) {\n";
                                    code += getErrorCallBackContainCode(method, entity, 1);
                                    code += "}\n\n";
                                }
                                else if (method == $scope.sdkrestMethods.retrieve) {
                                    code = "function RetrieveErrorCallback (error) {\n";
                                    code += getErrorCallBackContainCode(method, entity, 1);
                                    code += "}\n\n";
                                }
                                else if (method == $scope.sdkrestMethods.delete) {
                                    code = "function DeleteErrorCallback (error) {\n";
                                    code += getErrorCallBackContainCode(method, entity, 1);
                                    code += "}\n\n";
                                }
                                else if (method == $scope.sdkrestMethods.retrieveMultiple) {
                                    code = "function RetrieveMultipleErrorCallback (error) {\n";
                                    code += getErrorCallBackContainCode(method, entity, 1);
                                    code += "}\n\n";
                                }
                                return code;
                            }

                            function getCodeType(attribute, nameObject) {
                                var code = "";
                                if (attribute["type"] == "Uniqueidentifier") {
                                    code += getCodeString(nameObject, attribute["schemaName"], defaulValueGuid, 1);
                                } else if (attribute["type"] == "DateTime") {

                                } else if (attribute["type"] == "Lookup") {
                                    code += getCodeLookup(nameObject, attribute["schemaName"], attribute["relatedEntity"], defaulValueGuid, 1);
                                } else if (attribute["type"] == "Owner") {
                                    code += getCodeLookup(nameObject, attribute["schemaName"], "systemuser", defaulValueGuid, 1);
                                } else if (attribute["type"] == "State") {
                                    code += getCodeInt(nameObject, attribute["schemaName"], defaulValueState, 1);
                                } else if (attribute["type"] == "Status") {
                                    code += getCodeInt(nameObject, attribute["schemaName"], defaulValueState, 1);
                                } else if (attribute["type"] == "Integer") {
                                    code += getCodeInt(nameObject, attribute["schemaName"], defaulValueInt, 1);
                                } else if (attribute["type"] == "Memo") {
                                    code += getCodeString(nameObject, attribute["schemaName"], defaulValueString, 1);
                                } else if (attribute["type"] == "String") {
                                    code += getCodeString(nameObject, attribute["schemaName"], defaulValueString, 1);
                                } else if (attribute["type"] == "Picklist") {
                                    code += getCodeOptionSet(nameObject, attribute["schemaName"], defaulValuePickList, 1);
                                } else if (attribute["type"] == "Decimal") {
                                    code += getCodeString(nameObject, attribute["schemaName"], defaulValueDecimal, 1);
                                } else if (attribute["type"] == "Boolean") {
                                    code += getCodeBool(nameObject, attribute["schemaName"], defaulValueBoolean, 1);
                                } else if (attribute["type"] == "Double") {
                                    code += getCodeString(nameObject, attribute["schemaName"], defaulValueDouble, 1);
                                } else if (attribute["type"] == "Money") {
                                    code += getCodeMoney(nameObject, attribute["schemaName"], defaulValueMoney, 1);
                                }
                                return code;
                            }
                            function getCodeOptionSet(__nameObject, __nameAttriute, __value, __tab) {
                                var t__ = getTabs(__tab);
                                var code = "";
                                code += t__ + __nameObject + "." + __nameAttriute + " = {\n";
                                code += t__ + "\tValue: " + __value + "\n";
                                code += t__ + "};\n";
                                return code;
                            }
                            function getCodeMoney(__nameObject, __nameAttriute, __value, __tab) {
                                var t__ = getTabs(__tab);
                                var code = "";
                                code += t__ + __nameObject + "." + __nameAttriute + " = {\n";
                                code += t__ + "\tValue: \"" + __value + "\"\n";
                                code += t__ + "};\n";
                                return code;
                            }
                            function getCodeBool(__nameObject, __nameAttriute, __value, __tab) {
                                var t__ = getTabs(__tab);
                                var code = "";
                                code += t__ + __nameObject + "." + __nameAttriute + " = " + __value + ";\n";
                                return code;
                            }
                            function getCodeInt(__nameObject, __nameAttriute, __value, __tab) {
                                var t__ = getTabs(__tab);
                                var code = "";
                                code += t__ + __nameObject + "." + __nameAttriute + " = " + __value + ";\n";
                                return code;
                            }
                            function getCodeString(__nameObject, __nameAttriute, __value, __tab) {
                                var t__ = getTabs(__tab);
                                var code = "";
                                code += t__ + __nameObject + "." + __nameAttriute + " = \"" + __value + "\";\n";
                                return code;
                            }
                            function getCodeLookup(__nameObject, __nameAttriute, __entityRelated, __id, __tab) {
                                var t__ = getTabs(__tab);
                                var code = "";
                                code += t__ + __nameObject + "." + __nameAttriute + " = {\n";
                                code += t__ + "\tId: \"" + __id + "\",\n";
                                code += t__ + "\tLogicalName: \"" + __entityRelated + "\"\n";
                                code += t__ + "};\n";
                                return code;
                            }
                            function getTabs(__tab) {
                                var tab__ = "";
                                for (var i = 0; i < __tab; i++) {
                                    tab__ += "\t";
                                }
                                return tab__;
                            }


                            function getOptions(attributes__, orderbys__, typeOrderBy__, filters__, skip__, top__, metadataEntity) {//, __relations) {

                                var select = "";
                                if (attributes__.length == 0) {
                                    var PrimaryId = $scope.getPrimaryIdAttribute()["schemaName"];
                                    select = "$select=" + PrimaryId;
                                } else {
                                    select = "$select=";
                                    for (var i = 0; i < attributes__.length; i++) {
                                        if (i == attributes__.length - 1) {
                                            select += attributes__[i]["schemaName"] + "";
                                        } else {
                                            select += attributes__[i]["schemaName"] + ", ";
                                        }
                                    }
                                }
                                var skip = "";
                                if (skip__ != null) {
                                    if (skip__ != "" && skip__ != 0) {
                                        skip = "$skip=" + skip__;
                                    }
                                }

                                var top = "";
                                if (top__ != null) {
                                    if (top__ != "" && top__ != 0) {
                                        top = "$top=" + top__;
                                    }
                                }

                                var orderby = "";
                                if (orderbys__.length > 0) {
                                    orderby = "$orderby=";
                                    for (var i = 0; i < orderbys__.length; i++) {
                                        if (i == orderbys__.length - 1) {
                                            orderby += orderbys__[i]["schemaName"] + "";
                                        } else {
                                            orderby += orderbys__[i]["schemaName"] + ", ";
                                        }
                                    }
                                    orderby += " " + typeOrderBy__;
                                }

                                var filter = "";
                                if (filters__.length == 0) {
                                    filter = "";
                                } else {
                                    filter = "$filter=";
                                    for (var i = 0; i < filters__.length; i++) {
                                        var val = getDefaultValue(filters__[i]["type"]);
                                        filter += getFilter(i, filters__[i]["andor"], filters__[i]["schemaNameFormatted"], filters__[i]["type"], filters__[i]["operator"], val);
                                    }
                                }


                                var options = select;
                                if (skip != "") {
                                    options += "&" + skip;
                                }
                                if (top != "") {
                                    options += "&" + top;
                                }
                                if (orderby != "") {
                                    options += "&" + orderby;
                                }
                                if (filter != "") {
                                    options += "&" + filter;
                                }
                                return options;
                            }

                            function getFilter(pos, andor__, attribute__, type__, operator__, value__) {
                                var filter = "";
                                if (pos > 0) {
                                    if (andor__ != "") {
                                        filter += " " + andor__;
                                    }
                                }


                                var preSpace = " ";
                                if (filter == "") {
                                    preSpace = "";
                                }
                                filter += preSpace + attribute__;
                                filter += " " + operator__;

                                if (type__ == "") {

                                } else if (type__ == "String") {
                                    filter += " '" + value__ + "'";
                                } else if (type__ == "Uniqueidentifier") {
                                    filter += " guid'" + value__ + "'";
                                } else if (type__ == "DateTime") {
                                    filter += " datetime'" + value__ + "'";
                                } else if (type__ == "Integer") {
                                    filter += " " + value__ + "";
                                } else if (type__ == "Decimal") {
                                    filter += " " + value__ + "";
                                } else if (type__ == "Boolean") {
                                    filter += " " + value__ + "";
                                } else if (type__ == "Double") {
                                    filter += " " + value__ + "";
                                } else if (type__ == "Money") {
                                    filter += " " + value__ + "";
                                } else if (type__ == "Picklist") {
                                    filter += " " + value__ + "";
                                } else if (type__ == "EntityName") {
                                    filter += " '" + value__ + "'";
                                } else if (type__ == "State") {
                                    filter += " " + value__ + "";
                                } else if (type__ == "Status") {
                                    filter += " " + value__ + "";
                                } else if (type__ == "Memo") {
                                    filter += " '" + value__ + "'";
                                }
                                return filter;
                            }

                            function getDefaultValue(type) {
                                var val = "";
                                if (type == "Uniqueidentifier") {
                                    val = defaulValueGuid;
                                } else if (type == "DateTime") {
                                    val = defaulValueDatetime;
                                } else if (type == "Lookup") {
                                    val = defaulValueGuid;
                                } else if (type == "Owner") {
                                    val = defaulValueGuid;
                                } else if (type == "State") {
                                    val = defaulValueState;
                                } else if (type == "Status") {
                                    val = defaulValueState;
                                } else if (type == "Integer") {
                                    val = defaulValueInt;
                                } else if (type == "Memo") {
                                    val = defaulValueString;
                                } else if (type == "String") {
                                    val = defaulValueString;
                                } else if (type == "Picklist") {
                                    val = defaulValuePickList;
                                } else if (type == "Decimal") {
                                    val = defaulValueDecimal;
                                } else if (type == "Boolean") {
                                    val = defaulValueBoolean;
                                } else if (type == "Double") {
                                    val = defaulValueDouble;
                                } else if (type == "Money") {
                                    val = defaulValueMoney;
                                } else if (type == "EntityName") {
                                    val = defaulValueEntity;
                                }

                                return val;
                            }


                            function getCompleteCallBackContainCode(__method, __entity, __tab, __attributes) {
                                var code = "";
                                var t__ = getTabs(__tab);
                                if (__method == $scope.sdkrestMethods.retrieveMultiple) {
                                    code += t__ + "console.log(\"Retrieved \" + retrievedRecordsArray.length + \" records successfully! \");\n";
                                    code += t__ + "for (var i = 0; i < retrievedRecordsArray.length; i++) {\n"
                                    if (__attributes.length == 0) {
                                        var localAttribute__ = Object();
                                        var PrimaryId = $scope.getPrimaryIdAttribute()["schemaName"];
                                        localAttribute__["schemaName"] = PrimaryId;
                                        localAttribute__.type = "Uniqueidentifier";
                                        code += getDecomposedAttributeResponse(localAttribute__, t__ + "\t", "retrievedRecordsArray[i]");
                                    } else {
                                        for (var i = 0; i < __attributes.length; i++) {
                                            code += getDecomposedAttributeResponse(__attributes[i], t__ + "\t", "retrievedRecordsArray[i]");
                                        }
                                    }
                                    code += t__ + "}\n"
                                }
                                return code;
                            }


                            function getComments() {
                                var code = "//------------------------------------------------------------------------------\n";
                                code += "//(auto-generated)\n";
                                code += "//\tThis code has been auto generated by Dynamics CRM HUD Extension\n";
                                code += "//\tDate: " + new Date().toString() + "\n";
                                code += "//\tChanges to code may cause incorrect behavior\n";
                                code += "//------------------------------------------------------------------------------\n\n";
                                return code;
                            }


                            function getRerieveMultipleFunction(entity, attributes, integratedCallback, executionSentence, method, metadataEntity, orderBys, typeOrderBy, filters, skip, top) {

                                var code = getComments();;

                                code += "var retrievedRecordsArray = Array();\n\n"
                                if (executionSentence) {
                                    code += "//Execution sentence:\n";
                                    code += "RetrieveMultipleRecords()\n\n";
                                }
                                code += "function RetrieveMultipleRecords () {\n";
                                code += "\tretrievedRecordsArray = Array();";
                                code += "\t\n";
                                code += "\tvar EntityName = \"" + entity["schemaName"] + "\";\n";
                                var options = getOptions(attributes, orderBys, typeOrderBy, filters, skip, top, metadataEntity);
                                code += "\tvar Options = \"" + options + "\";\n";
                                code += "\t\n";
                                code += "\tSDK.REST.retrieveMultipleRecords(\n";
                                code += "\t\tEntityName,\n";
                                code += "\t\tOptions,\n";
                                if (integratedCallback) {
                                    code += "\t\tfunction (response) {\n";
                                    code += "" + getSuccessCallBackContainCode(method, entity["logicalName"], 3, metadataEntity);
                                    code += "\t\t},\n";
                                    code += "\t\tfunction (error) {\n";
                                    code += "" + getErrorCallBackContainCode(method, entity["logicalName"], 3, metadataEntity);
                                    code += "\t\t},\n";
                                    code += "\t\tfunction () {\n";
                                    code += "" + getCompleteCallBackContainCode(method, entity["logicalName"], 3, attributes);
                                    code += "\t\t});\n";
                                } else {
                                    code += "\t\t\RetrieveMultipleSuccessCallback" + ",\n";
                                    code += "\t\t\RetrieveMultipleErrorCallback" + ",\n";
                                    code += "\t\t\RetrieveMultipleCompleteCallback" + "\n";
                                    code += "\t);\n";
                                }

                                code += "}\n\n";
                                return code;
                            }

                            function getDeleteFunction(entity, attributes, integratedCallback, executionSentence, method, metadataEntity) {


                                var code = getComments();;
                                if (executionSentence) {
                                    code += "//Execution sentence:\n";
                                    code += "DeleteRecord()\n\n";
                                }
                                code += "function DeleteRecord () {\n";
                                code += "\t\n";
                                code += "\tvar Entity = \"" + entity["schemaName"] + "\";\n";
                                code += "\tvar Id = \"" + defaulValueGuid + "\";\n";
                                code += "\t\n";
                                code += "\tSDK.REST.deleteRecord(\n";
                                code += "\t\tId,\n";
                                code += "\t\t\Entity,\n";
                                if (integratedCallback) {
                                    code += "\t\tfunction () {\n";
                                    code += "" + getSuccessCallBackContainCode(method, entity["logicalName"], 3, metadataEntity);
                                    code += "\t\t},\n";
                                    code += "\t\tfunction (error) {\n";
                                    code += "" + getErrorCallBackContainCode(method, entity["logicalName"], 3, metadataEntity);
                                    code += "\t\t});\n";

                                } else {
                                    code += "\t\t\DeleteSuccessCallback" + ",\n";
                                    code += "\t\t\DeleteErrorCallback" + "\n";
                                    code += "\t);\n";
                                }

                                code += "}\n\n";
                                return code;
                            }
                            function getRerieveFunction(entity, attributes, integratedCallback, executionSentence, method, metadataEntity, relations) {

                                var nameObject = "newRecordObj";
                                var code = getComments();;
                                if (executionSentence) {
                                    code += "//Execution sentence:\n";
                                    code += "RetrieveRecord()\n\n";
                                }
                                code += "function RetrieveRecord () {\n";
                                code += "\tvar Id = \"" + defaulValueGuid + "\";\n";
                                code += "\tvar EntityName = \"" + entity["schemaName"] + "\";\n";
                                var select = getSelect(attributes);
                                if (select == null) {
                                    code += "\tvar Select = null;\n";
                                } else {
                                    code += "\tvar Select = \"" + select + "\";\n";
                                }
                                console.log(relations);
                                var expand = getExpand(relations);
                                if (expand == null) {
                                    code += "\tvar Expand = null;\n";
                                } else {
                                    code += "\tvar Expand = \"" + expand + "\";\n";
                                }
                                code += "\t\n";
                                code += "\tSDK.REST.retrieveRecord(\n";
                                code += "\t\tId,\n";
                                code += "\t\tEntityName,\n";
                                code += "\t\tSelect,\n";
                                code += "\t\t\Expand,\n";


                                if (integratedCallback) {
                                    code += "\t\tfunction (response) {\n";
                                    code += "" + getSuccessCallBackContainCode(method, entity["logicalName"], 3, metadataEntity, attributes, relations);
                                    code += "\t\t},\n";
                                    code += "\t\tfunction (error) {\n";
                                    code += "" + getErrorCallBackContainCode(method, entity["logicalName"], 3, metadataEntity);
                                    code += "\t\t});\n";

                                } else {
                                    code += "\t\t\RetrieveSuccessCallback" + ",\n";
                                    code += "\t\t\RetrieveErrorCallback" + "\n";
                                    code += "\t);\n";
                                }
                                code += "}\n\n";
                                return code;

                            }
                            function getUpdateFunction(entity, attributes, integratedCallback, executionSentence, method, metadataEntity) {
                                var nameObject = "newRecordObj";
                                var code = getComments();;
                                if (executionSentence) {
                                    code += "//Execution sentence:\n";
                                    code += "UpdateRecord()\n\n";
                                }
                                code += "function UpdateRecord () {\n";
                                code += "\tvar " + nameObject + " = Object();\n";
                                for (var i = 0; i < attributes.length; i++) {
                                    code += getCodeType(attributes[i], nameObject);
                                }
                                code += "\t\n";
                                code += "\tvar Entity = \"" + entity["schemaName"] + "\";\n";
                                code += "\tvar Id = \"" + defaulValueGuid + "\";\n";
                                code += "\t\n";
                                code += "\tSDK.REST.updateRecord(\n";
                                code += "\t\tId,\n";
                                code += "\t\t" + nameObject + ",\n";
                                code += "\t\t\Entity,\n";

                                if (integratedCallback) {
                                    code += "\t\tfunction (response) {\n";
                                    code += "" + getSuccessCallBackContainCode(method, entity["logicalName"], 3, metadataEntity);
                                    code += "\t\t},\n";
                                    code += "\t\tfunction (error) {\n";
                                    code += "" + getErrorCallBackContainCode(method, entity["logicalName"], 3, metadataEntity);
                                    code += "\t\t});\n";

                                } else {
                                    code += "\t\t\UpdateSuccessCallback" + ",\n";
                                    code += "\t\t\UpdateErrorCallback" + "\n";
                                    code += "\t);\n";
                                }
                                code += "}\n\n";
                                return code;
                            }


                            function getCreateFunction(entity, attributes, integratedCallback, executionSentence, method, metadataEntity) {
                                var nameObject = "newRecordObj";
                                var code = getComments();;
                                if (executionSentence) {
                                    code += "//Execution sentence:\n";
                                    code += "CreateRecord()\n\n";
                                }
                                code += "function CreateRecord () {\n";
                                code += "\tvar " + nameObject + " = Object();\n";
                                for (var i = 0; i < attributes.length; i++) {
                                    code += getCodeType(attributes[i], nameObject);
                                }
                                code += "\t\n";
                                code += "\tvar Entity = \"" + entity["schemaName"] + "\";\n";
                                code += "\t\n";
                                code += "\tSDK.REST.createRecord(\n";
                                code += "\t\t" + nameObject + ",\n";
                                code += "\t\t\Entity,\n";
                                if (integratedCallback) {
                                    code += "\t\tfunction (response) {\n";
                                    code += "" + getSuccessCallBackContainCode(method, entity["logicalName"], 3, metadataEntity);
                                    code += "\t\t},\n";
                                    code += "\t\tfunction (error) {\n";
                                    code += "" + getErrorCallBackContainCode(method, entity["logicalName"], 3, metadataEntity);
                                    code += "\t\t});\n";

                                } else {
                                    code += "\t\t\CreateSuccessCallback" + ",\n";
                                    code += "\t\t\CreateErrorCallback" + "\n";
                                    code += "\t);\n";
                                }

                                code += "}\n\n";
                                return code;
                            }

                            function getErrorCallBackContainCode(__method, __entity, __tab) {
                                var code = "";
                                var t__ = getTabs(__tab);
                                code += t__ + "console.log(\"Error:\");\n";
                                code += t__ + "console.error(error);\n";

                                return code;
                            }


                            function getExpand(__relations) {
                                var expand = null;
                                if (__relations != null) {
                                    if (__relations.length > 0) {
                                        //expand = "$expand ";
                                        expand = "";
                                        for (var i = 0; i < __relations.length; i++) {
                                            if (i == __relations.length - 1) {
                                                expand += __relations[i]["schemaName"] + "";
                                            } else {
                                                expand += __relations[i]["schemaName"] + ", ";
                                            }
                                        }
                                    }
                                }
                                return expand;
                            }

                            function getSelect(__attributes) {//, __relations) {
                                var select = null;
                                if (__attributes.length > 0) {
                                    select = "";
                                    for (var i = 0; i < __attributes.length; i++) {
                                        if (i == __attributes.length - 1) {
                                            select += __attributes[i]["schemaName"] + "";
                                        } else {
                                            select += __attributes[i]["schemaName"] + ", ";
                                        }
                                    }

                                }


                                return select;
                            }

                            function getSuccessCallBackContainCode(__method, __entity, __tab, __metadataEntity, attributes, relations) {
                                var code = "";

                                var t__ = getTabs(__tab);

                                var attrPrimaryIdField = $scope.getPrimaryIdAttribute()["schemaName"];
                                if (__method == $scope.sdkrestMethods.create) {
                                    code += t__ + "var Id = response." + attrPrimaryIdField + ";\n";
                                    code += t__ + "console.log(\"Created record in entity " + __entity + " with Guid \" + Id + \"! \");\n";
                                }
                                else if (__method == $scope.sdkrestMethods.update) {
                                    code += t__ + "console.log(\"Updated record in entity " + __entity + "! \");\n";
                                }
                                else if (__method == $scope.sdkrestMethods.retrieve) {
                                    for (var i = 0; i < attributes.length; i++) {
                                        code += getDecomposedAttributeResponse(attributes[i], t__, "response");
                                    }
                                    for (var i = 0; i < relations.length; i++) {
                                        code += getDecomposedRelationResponse(relations[i], t__);
                                    }
                                }
                                else if (__method == $scope.sdkrestMethods.delete) {
                                    code += t__ + "console.log(\"Deleted record in entity " + __entity + "! \");\n";
                                }
                                else if (__method == $scope.sdkrestMethods.retrieveMultiple) {
                                    code += t__ + "for (var i = 0; i < response.length; i++) {\n"
                                    code += t__ + "\tretrievedRecordsArray.push(response[i]);\n"
                                    code += t__ + "}\n"
                                }
                                return code;
                            }

                            function getDecomposedAttributeResponse(attribute, __t, __namObject) {
                                var type__ = attribute["type"];
                                var code = "";
                                if (type__ == "Uniqueidentifier") {
                                    code += __t + "var " + attribute["schemaName"] + " = " + __namObject + "." + attribute["schemaName"] + ";\n";
                                } else if (type__ == "DateTime") {
                                    code += __t + "var " + attribute["schemaName"] + " = " + __namObject + "." + attribute["schemaName"] + ";\n";
                                } else if (type__ == "Lookup") {
                                    code += __t + "var " + attribute["schemaName"] + "_Id = " + __namObject + "." + attribute["schemaName"] + ".Id;\n";
                                    code += __t + "var " + attribute["schemaName"] + "_LogicalName = " + __namObject + "." + attribute["schemaName"] + ".LogicalName;\n";
                                    code += __t + "var " + attribute["schemaName"] + "_Name = " + __namObject + "." + attribute["schemaName"] + ".Name;\n";
                                } else if (type__ == "Owner") {
                                    code += __t + "var " + attribute["schemaName"] + "_Id = " + __namObject + "." + attribute["schemaName"] + ".Id;\n";
                                    code += __t + "var " + attribute["schemaName"] + "_LogicalName = " + __namObject + "." + attribute["schemaName"] + ".LogicalName;\n";
                                    code += __t + "var " + attribute["schemaName"] + "_Name = " + __namObject + "." + attribute["schemaName"] + ".Name;\n";
                                } else if (type__ == "State") {
                                    code += __t + "var " + attribute["schemaName"] + " = " + __namObject + "." + attribute["schemaName"] + ";\n";
                                } else if (type__ == "Status") {
                                    code += __t + "var " + attribute["schemaName"] + " = " + __namObject + "." + attribute["schemaName"] + ";\n";
                                } else if (type__ == "Integer") {
                                    code += __t + "var " + attribute["schemaName"] + " = " + __namObject + "." + attribute["schemaName"] + ";\n";
                                } else if (type__ == "Memo") {
                                    code += __t + "var " + attribute["schemaName"] + " = " + __namObject + "." + attribute["schemaName"] + ";\n";
                                } else if (type__ == "String") {
                                    code += __t + "var " + attribute["schemaName"] + " = " + __namObject + "." + attribute["schemaName"] + ";\n";
                                } else if (type__ == "Picklist") {
                                    code += __t + "var " + attribute["schemaName"] + "_Value = " + __namObject + "." + attribute["schemaName"] + ".Value;\n";
                                } else if (type__ == "Decimal") {
                                    code += __t + "var " + attribute["schemaName"] + " = " + __namObject + "." + attribute["schemaName"] + ";\n";
                                } else if (type__ == "Boolean") {
                                    code += __t + "var " + attribute["schemaName"] + " = " + __namObject + "." + attribute["schemaName"] + ";\n";
                                } else if (type__ == "Double") {
                                    code += __t + "var " + attribute["schemaName"] + " = " + __namObject + "." + attribute["schemaName"] + ";\n";
                                } else if (type__ == "Money") {
                                    code += __t + "var " + attribute["schemaName"] + "_Value = " + __namObject + "." + attribute["schemaName"] + ".Value;\n";
                                }
                                return code;
                            }

                            function getDecomposedRelationResponse(__relation, __t) {
                                console.log(__relation);
                                var code = "";
                                var entity = "";
                                if (__relation["type"] == "N:1") {
                                    entity = __relation["referencedEntity"];
                                    code += __t + "//Expanded object " + __relation["schemaName"] + " of type " + __relation["type"] + "\n";
                                    code += __t + "var " + __relation["schemaName"] + "Obj" + " = response." + __relation["schemaName"] + ";\n";
                                    code += __t + "//Attributes of the linked entity (" + entity + "):  \n";
                                    code += __t + "//\tvar Attr1 = " + __relation["schemaName"] + "Obj" + ".Attr1; \n";
                                    code += __t + "//\tvar Attr2 = " + __relation["schemaName"] + "Obj" + ".Attr2;\n";
                                } else {
                                    entity = __relation["referencingEntity"];

                                    code += __t + "//Expanded object " + __relation["schemaName"] + " of type " + __relation["type"] + "\n";
                                    code += __t + "var " + __relation["schemaName"] + "Array" + " = response." + __relation["schemaName"] + ".results;\n";
                                    code += __t + "for (var i = 0; i < " + __relation["schemaName"] + "Array" + ".length; i++) {\n";
                                    code += __t + "\t//Attributes of the linked entity (" + entity + "):  \n";
                                    code += __t + "\t//\tvar Attr1 = " + __relation["schemaName"] + "Array[i]" + ".Attr1; \n";
                                    code += __t + "\t//\tvar Attr2 = " + __relation["schemaName"] + "Array[i]" + ".Attr2;\n";
                                    code += __t + "}\n";
                                }
                                return code;
                            }

                            $scope.removeAttribute = function (attr) {
                                console.log(attr);
                                for (var i = 0; i < $scope.selectedAttributes.val.length; i++) {
                                    var attrSel = $scope.selectedAttributes.val[i];
                                    if (attrSel["logicalName"] == attr["logicalName"]) {
                                        $scope.selectedAttributes.val.splice(i, 1);
                                        break;
                                    }
                                }
                            }



                            $scope.removeAttributeForFilter = function (attr) {
                                for (var i = 0; i < $scope.selectedFilters.val.length; i++) {
                                    var attrSel = $scope.selectedFilters.val[i];
                                    if (attrSel["logicalName"] == attr["logicalName"]) {
                                        $scope.selectedFilters.val.splice(i, 1);
                                        break;
                                    }
                                }
                            }

                            $scope.removeOrderBy = function (attr) {
                                for (var i = 0; i < $scope.selectedOrderBys.val.length; i++) {
                                    var attrSel = $scope.selectedOrderBys.val[i];
                                    if (attrSel["logicalName"] == attr["logicalName"]) {
                                        $scope.selectedOrderBys.val.splice(i, 1);
                                        break;
                                    }
                                }
                            }

                            $scope.removeRelation = function (rel) {
                                for (var i = 0; i < $scope.selectedRelations.val.length; i++) {
                                    var relSel = $scope.selectedRelations.val[i];
                                    if (relSel["logicalName"] == rel["SchemaName"]) {
                                        $scope.selectedRelations.val.splice(i, 1);
                                        break;
                                    }
                                }
                            }




                            $scope.entityChanged = function (item) {

                                $scope.selectedAttributes.val = null;
                                $scope.selectedRelations.val = null;
                                $scope.selectedOrderBys.val = null;
                                $scope.selectedFilters.val = null;
                                $scope.currentEntity = null;
                                if (typeof item == 'undefined') {
                                    $scope.currentEntity = null;
                                    return;
                                }
                                $scope.currentEntity = item;
                                $scope.loadingFields = true;
                                var entityName = $scope.currentEntity["logicalName"];
                                var cached = $mainScope.getCachedMetadataFields(entityName);
                                if (cached == null) {
                                    crmRepositoryService.retrieveMetadataFieldsEntity(entityName).then(function (fields) {
                                        var fieldsSorted = HUDCRM_TOOL.sortArray(fields["attributes"], "displayName");
                                        fields["attributes"] = fieldsSorted;
                                        $mainScope.addCachedMetadataFields(entityName, fields);
                                        $scope.loadedFields(fields);
                                    }, function (e) { console.error(e); });
                                } else {
                                    $scope.loadedFields(cached);
                                }
                            }

                            $scope.loadedFields = function (fields) {
                                $scope.metadataEntity = fields;
                                $scope.selectedAttributes.val = Array();
                                $scope.selectedRelations.val = Array();
                                $scope.selectedOrderBys.val = Array();
                                $scope.selectedFilters.val = Array();
                                $scope.loadingFields = false;
                                $scope.attributes = fields.attributes.filter(function (attr) {
                                    if (typeof attr["displayName"] == 'undefined' || attr["displayName"] == null || attr["displayName"] == "") {
                                        return false;
                                    }
                                    return true;
                                });
                                $scope.attributesForFilter = getAttributesForFilter($scope.attributes);
                                $scope.relations = fields.relations;
                                var attrPrimaryIdField = getAttribute(fields["PrimaryIdAttribute"], fields["attributes"]);
                                var attrPrimaryNameField = getAttribute(fields["PrimaryNameAttribute"], fields["attributes"]);
                                if (attrPrimaryIdField != null) $scope.selectedAttributes.val.push(attrPrimaryIdField);
                                if (attrPrimaryNameField != null) $scope.selectedAttributes.val.push(attrPrimaryNameField);
                                //TODO: from all the attributes, add to "SeletedAttributes" the primaryField
                            }

                            function getAttributesForFilter(attributes) {
                                var attForFilter = Array();
                                for (var i = 0; i < attributes.length; i++) {
                                    var attr = attributes[i];
                                    if (attr["type"] == "Lookup" || attr["type"] == "Owner") {
                                        var attrId = getNewAttributeObjectForFilter(attr, "Uniqueidentifier", attr["schemaName"] + "/Id", attr["displayName"] + "/Id");
                                        var attrName = getNewAttributeObjectForFilter(attr, "String", attr["schemaName"] + "/Name", attr["displayName"] + "/Name");
                                        var attrLogicalName = getNewAttributeObjectForFilter(attr, "EntityName", attr["schemaName"] + "/LogicalName", attr["displayName"] + "/LogicalName");
                                        attForFilter.push(attrId);
                                        attForFilter.push(attrName);
                                        attForFilter.push(attrLogicalName);
                                    } else if (attr["type"] == "Picklist") {
                                        var attrValue = getNewAttributeObjectForFilter(attr, "Picklist", attr["schemaName"] + "/Value", attr["displayName"] + "/Value");
                                        attForFilter.push(attrValue);
                                    } else if (attr["type"] == "Money") {
                                        var attrValue = getNewAttributeObjectForFilter(attr, "Decimal", attr["schemaName"] + "/Value", attr["displayName"] + "/Value");
                                        attForFilter.push(attrValue);
                                    } else {
                                        var attrNew = getNewAttributeObjectForFilter(attr, attr["type"], attr["schemaName"], attr["displayName"]);
                                        attForFilter.push(attrNew);
                                    }
                                }
                                return attForFilter;
                            }

                            function getNewAttributeObjectForFilter(basedAttr, type, schemaNameFormatted, displayNameFormatted) {
                                var newAttr = Object();
                                newAttr["andor"] = "and";
                                newAttr["operator"] = "eq";
                                newAttr["displayName"] = basedAttr["displayName"];
                                newAttr["logicalName"] = basedAttr["logicalName"];
                                newAttr["schemaName"] = basedAttr["schemaName"];
                                newAttr["type"] = type;
                                newAttr["schemaNameFormatted"] = schemaNameFormatted;
                                newAttr["displayNameFormatted"] = displayNameFormatted;
                                return newAttr;
                            }

                            function getAttribute(logicalName, attributes) {
                                for (var i = 0; i < attributes.length; i++) {
                                    var attr = attributes[i];
                                    if (attr["logicalName"] == logicalName) {
                                        return attr;
                                    }
                                }
                                return null;
                            }
                            $scope.getPrimaryIdAttribute = function () {
                                var logicalName = $scope.metadataEntity["PrimaryIdAttribute"];
                                var attributes = $scope.metadataEntity["attributes"];
                                for (var i = 0; i < attributes.length; i++) {
                                    var attr = attributes[i];
                                    if (attr["logicalName"] == logicalName) {
                                        return attr;
                                    }
                                }
                                return null;
                            }


                            $scope.entities = function () { return $mainScope.metadataEntities; }
                            $scope.updateCurrentMethod = function (method) {
                                $scope.currentMethod = method;
                            }
                            $scope.cancel = function () {
                                HUDCRM_CODEMIRROR.unload();
                                $mdDialog.cancel();
                            };
                        },
                    });
                }
                $scope.updatePropertyOfElementInTree = function (elementName, propertyName, tree, value) {
                    var found = false;
                    if (tree == null) {
                        return null;
                    }
                    try {
                        var obj = tree.tabs;
                        angular.forEach(tree.tabs, function (tab) {
                            if (!found) {
                                if (tab.name == elementName) {
                                    tab[propertyName] = value;
                                    found = true;
                                }
                                angular.forEach(tab.sections, function (section) {
                                    if (!found) {
                                        if (section.name == elementName) {
                                            section[propertyName] = value;
                                            found = true;
                                        }
                                        angular.forEach(section.controls, function (control) {
                                            if (!found) {
                                                if (control.name == elementName) {
                                                    control[propertyName] = value;
                                                    found = true;
                                                }
                                            }
                                        });
                                    }
                                });
                            }
                        });
                    } catch (e) {
                        console.error(e);
                    }
                }
                $scope.getChildrenElementUI = function (elementName, tree) {
                    var found = false;
                    var value = null;
                    if (tree == null) {
                        return null;
                    }
                    try {
                        var obj = tree.tabs;
                        angular.forEach(tree.tabs, function (tab) {
                            if (!found) {
                                if (tab.name == elementName) {
                                    value = tab.sections;
                                    found = true;
                                }
                                angular.forEach(tab.sections, function (section) {
                                    if (!found) {
                                        if (section.name == elementName) {
                                            value = section.controls;
                                            found = true;
                                        }
                                    }
                                });
                            }
                        });
                        return value;
                    } catch (e) {
                        console.error(e);
                    }
                    return null;
                }
                $scope.getParentElementUI = function (elementName, tree) {
                    var found = false;
                    var value = null;
                    if (tree == null) {
                        return null;
                    }
                    try {
                        var obj = tree.tabs;
                        angular.forEach(tree.tabs, function (tab) {
                            if (!found) {
                                angular.forEach(tab.sections, function (section) {
                                    if (!found) {
                                        if (section.name == elementName) {
                                            value = tab;
                                            found = true;
                                        }
                                        angular.forEach(section.controls, function (control) {
                                            if (!found) {
                                                if (control.name == elementName) {
                                                    value = section;
                                                    found = true;
                                                }
                                            }
                                        });
                                    }
                                });
                            }
                        });
                        return value;
                    } catch (e) {
                        console.error(e);
                    }
                    return null;
                }
                $scope.getElementUI = function (elementName, tree) {
                    var found = false;
                    var value = null;
                    if (tree == null) {
                        return null;
                    }
                    try {
                        var obj = tree.tabs;
                        angular.forEach(tree.tabs, function (tab) {
                            if (!found) {
                                if (tab.name == elementName) {
                                    value = tab;
                                    found = true;
                                }
                                angular.forEach(tab.sections, function (section) {
                                    if (!found) {
                                        if (section.name == elementName) {
                                            value = section;
                                            found = true;
                                        }
                                        angular.forEach(section.controls, function (control) {
                                            if (!found) {
                                                if (control.name == elementName) {
                                                    value = control;
                                                    found = true;
                                                }
                                            }
                                        });
                                    }
                                });
                            }
                            if (!found) {
                                angular.forEach(tree.controls, function (control) {
                                    if (!found) {
                                        if (control.name == elementName) {
                                            value = control;
                                            found = true;
                                        }
                                    }
                                });
                            }
                        });
                        return value;
                    } catch (e) {
                        console.error(e);
                    }
                    return null;
                }
            }
        ]);

    app.service('crmRepositoryService', ['$window', '$http', '$q', '$rootScope',
        function ($window, $http, $q, $rootScope) {
            var url = HUDCRM_SOAP._getURLServiceSoap();;

            this.getUSDItems = function (entity, fieldName, fieldId, configurationId, intersectionEntity) {
                var data = HUDCRM_SOAP.SCHEMAS.RetrieveMultiple_USDItemsOfConfiguration(entity, fieldName, fieldId, configurationId, intersectionEntity);
                var promiseFilter = $http.post(url, data, configRetrieveMultiple);
                return promiseFilter.then(function (response) {
                    var data = HUDCRM_SOAP.deserializeRetrieveMultipleResponse(response.data, false);
                    return data;
                });
            }



            this.getUSDConfigurations = function (entity, field, config) {
                var data = null;
                if (config == null) {
                    data = HUDCRM_SOAP.SCHEMAS.RetrieveMultiple_USDConfigurations(entity, field);
                } else {

                }
                var promiseFilter = $http.post(url, data, configRetrieveMultiple);
                return promiseFilter.then(function (response) {
                    var data = HUDCRM_SOAP.deserializeRetrieveMultipleResponse(response.data, false);
                    return data;
                });
            }

            this.getUSDHostedControlTopOne = function () {
                var data = HUDCRM_SOAP.SCHEMAS.RetrieveMultiple_CheckHostedControls();
                var promiseFilter = $http.post(url, data, configRetrieveMultiple);
                return promiseFilter.then(function (response) {
                    var data = HUDCRM_SOAP.deserializeRetrieveMultipleResponse(response.data, false);
                    return data;
                });
            }


            this.getRelatedRecords = function (mainRecordId, relatedEntity, relatedAttribute, primaryNameAttribute) {
                var data = HUDCRM_SOAP.SCHEMAS.RetrieveMultiple_RelatedRecords(mainRecordId, relatedEntity, relatedAttribute, primaryNameAttribute);
                var promiseFilter = $http.post(url, data, configRetrieveMultiple);
                return promiseFilter.then(function (response) {
                    var data = HUDCRM_SOAP.deserializeRetrieveMultipleResponse(response.data, true);
                    return data;
                });
            }


            this.getRecordsCountingFetch = function (fetch, pageNumber, pageCookie) {
                var data = HUDCRM_SOAP.SCHEMAS.RetrieveMultiple_Fetch(fetch, pageNumber, pageCookie);
                var promiseFilter = $http.post(url, data, configRetrieveMultiple);
                return promiseFilter.then(function (response) {
                    var data = HUDCRM_SOAP.deserializeRetrieveMultipleResponseCountRecords(response.data);
                    return data;
                });
            }

            this.getRecordsCountingAll = function (entity, pageNumber, pageCookie) {
                var data = HUDCRM_SOAP.SCHEMAS.RetrieveMultiple_CountRecords(entity, pageNumber, pageCookie);
                var promiseFilter = $http.post(url, data, configRetrieveMultiple);
                return promiseFilter.then(function (response) {
                    var data = HUDCRM_SOAP.deserializeRetrieveMultipleResponseCountRecords(response.data);
                    return data;
                }, function (e) { console.error(e); });
            }

            this.getSavedQueries = function (entity) {
                var data = HUDCRM_SOAP.SCHEMAS.RetrieveMultiple_SavedQueries(entity);
                var promiseFilter = $http.post(url, data, configRetrieveMultiple);
                return promiseFilter.then(function (response) {
                    var data = HUDCRM_SOAP.deserializeRetrieveMultipleResponse(response.data, false);
                    return data;
                });
            }


            this.updateRecord = function (id, entity, attributes) {
                var data = HUDCRM_SOAP.SCHEMAS.Update_Record(entity, id, attributes);
                //console.log($(data)[0]);
                var promiseFilter = $http.post(url, data, configUpdate);
                return promiseFilter.then(function (response) {
                });
            }

            this.retrieveRecord = function (id, entity) {
                var data = HUDCRM_SOAP.SCHEMAS.Retrieve_Record(id, entity);
                var promiseFilter = $http.post(url, data, configRetrieve);
                return promiseFilter.then(function (response) {
                    var data = HUDCRM_SOAP.deserializeRetrieveResponse(response.data, true);
                    return data;
                });
            }



            this.retrieveRecordPrimaryFieldValue = function (id, entity, primaryField) {
                var data = HUDCRM_SOAP.SCHEMAS.Retrieve_RecordPrimaryFieldValue(id, entity, primaryField);
                var promiseFilter = $http.post(url, data, configRetrieve);
                return promiseFilter.then(function (response) {
                    var data = HUDCRM_SOAP.deserializeRetrieveResponse(response.data, false);
                    return data;
                });
            }


            this.requestSearchForLookup = function (string, entityName, primaryField) {
                var data = HUDCRM_SOAP.SCHEMAS.RetrieveMultiple_SearchForLookup(entityName, primaryField, 5, string);
                var promiseFilter = $http.post(url, data, configRetrieveMultiple);
                return promiseFilter.then(function (response) {
                    var desr = HUDCRM_SOAP.deserializeRetrieveMultipleResponse(response.data, false);
                    return desr;
                });
            }

            this.retrieveMetadataFieldsEntity = function (entity) {
                var data = HUDCRM_SOAP.SCHEMAS.Execute_RetrieveMetadataFields(entity);
                var promiseFilter = $http.post(url, data, configExecute);
                return promiseFilter.then(function (response) {
                    var data = HUDCRM_SOAP.deserializeRetrieveFieldsMetadata(response.data);
                    return data;
                });
            }

            this.retrieveMetadataEntities = function () {
                var data = HUDCRM_SOAP.SCHEMAS.Execute_RetrieveMetadataEntities();
                var promiseFilter = $http.post(url, data, configExecute);
                return promiseFilter.then(function (response) {
                    var data = HUDCRM_SOAP.deserializeRetrieveAllEntities(response.data);
                    return data;
                });
            }

            this.publishWebresource = function (id) {
                var data = HUDCRM_SOAP.SCHEMAS.Execute_PublishWebresource(id);
                var promiseFilter = $http.post(url, data, configExecute);
                return promiseFilter;
            }
            this.saveWebresource = function (id, content) {
                var data = HUDCRM_SOAP.SCHEMAS.Update_Webresource(id, content);
                var promiseFilter = $http.post(url, data, configUpdate);
                return promiseFilter;
            }
            this.getWebresource = function (id) {
                var data = HUDCRM_SOAP.SCHEMAS.Retrieve_Webresource(id);
                var promiseFilter = $http.post(url, data, configRetrieve);
                return promiseFilter.then(function (response) {
                    var data = HUDCRM_SOAP.deserializeRetrieveResponse(response.data, false);
                    return data;
                });
            }

            this.getWebresourcesChildsOfUiWr = function (wrs) {
                //TODO: when loaded all UI web resources and found the Id, search the content of this Wr, decode64 and check <scritp src...> for check the name. Then check all this childs for show in Webresource button in main toolbar.
                var wrInUiIds = Array();  //ids of Wr in 
                for (var i = 0; i < wrs.length; i++) {
                    if (wrs[i].inUi) {
                        wrInUiIds.push(wrs[i].id);
                    }
                }

            }

            this.getWebresourcesId = function (names) {

                var data = HUDCRM_SOAP.SCHEMAS.RetrieveMultiple_Webresources(names);
                var promiseFilter = $http.post(url, data, configRetrieveMultiple);
                return promiseFilter.then(function (response) {
                    var data = HUDCRM_SOAP.deserializeRetrieveMultipleResponse(response.data, false);
                    return data;
                });
            }

            this.getSolutionsComponents = function (solutions) {
                //TODO: terminar
                var data = HUDCRM_SOAP.SCHEMAS.RetrieveMultiple_SolutionComponents(solutions);
                var promiseFilter = $http.post(url, data, configRetrieveMultiple);
                return promiseFilter.then(function (response) {
                    var data = HUDCRM_SOAP.deserializeRetrieveMultipleResponse(response.data, false);
                    return data;
                });
            }

            this.getSolutions = function () {
                var data = HUDCRM_SOAP.SCHEMAS.RetrieveMultiple_Solutions();
                var promiseFilter = $http.post(url, data, configRetrieveMultiple);
                return promiseFilter.then(function (response) {
                    var data = HUDCRM_SOAP.deserializeRetrieveMultipleResponse(response.data, false);
                    return data;
                });
            }

            this.executeFetch = function (fetchEncoded, top) {
                var data = HUDCRM_SOAP.SCHEMAS.RetrieveMultiple_Fetch(fetchEncoded, top);
                var promiseFilter = $http.post(url, data, configRetrieveMultiple);
                return promiseFilter.then(function (response) {
                    var data = HUDCRM_SOAP.deserializeRetrieveMultipleResponse(response.data, true);
                    return data;
                });
            }
            getConfig = function (action) {
                var config = {
                    headers: {
                        'Accept': 'application/xml, text/xml, */*',
                        'Content-Type': 'text/xml; charset=utf-8',
                        'SOAPAction': 'http://schemas.microsoft.com/xrm/2011/Contracts/Services/IOrganizationService/' + action
                    }
                }
                return config;
            }

            var configRetrieveMultiple = getConfig("RetrieveMultiple");
            var configRetrieve = getConfig("Retrieve");
            var configExecute = getConfig("Execute");
            var configUpdate = getConfig("Update");


        }]);

    app.directive('hud', ['$window', function ($window) {
        return {
            restrict: "E",
            replace: true,
            template: ['<div ng-style="styleControl">',
                '<button-bar-fav buttons="topMenu"></button-bar-fav>',
                '</div>'].join(""),
            link: function ($scope, element, attrs) {

                $scope.styleControl = {
                    'width': '100%',
                    'z-index': '1000',
                };
            },
            controller: function ($scope) {

            }
        }
    }]);
    app.directive('buttonBarFav', ['$window', function ($window) {
        return {
            restrict: "E",
            replace: true,
            scope: {
                buttons: '='
            },
            template: [
                '<div>',
                '<md-icon ng-show="!isOpen" class="icon-clickable" ng-click="clickShow()"  md-svg-src="img/icons/ic_visibility_black_18px.svg"></md-icon>',
                '<md-toolbar class="md-primary" style="max-height: 50px; min-height: 50px;" ng-show="isOpen">',
                '<div class="md-toolbar-tools" layout="row">',
                '<div flex ng-style="inline">',
                '<md-icon  class="icon-clickable-white" ng-click="clickHide()" style="margin-right: 30px"  md-svg-src="img/icons/ic_visibility_black_18px.svg"></md-icon>',
                //Info
                '<md-menu>',
                '<md-button style="width:auto" aria-label="menu" class="md-icon-button" ng-click="$mdMenu.open()">Info</md-button>',
                '<md-menu-content width="4" ng-mouseleave="$mdMenu.close()">',
                '<md-menu-item><md-button ng-click="emit(\'clickToolbar_Info_CRM\');">CRM</md-button></md-menu-item>',
                '<md-menu-item ><md-button ng-click="emit(\'clickToolbar_Info_Entity\');" ng-disabled="notInForm">Entity</md-button></md-menu-item>',
                '<md-menu-item><md-button ng-click="emit(\'clickToolbar_Info_UI\');" ng-disabled="notInForm">Form UI tree</md-button></md-menu-item>',
                '<md-menu-item><md-button ng-click="emit(\'clickToolbar_Info_Metadata\');">Metadata</md-button></md-menu-item>',
                '</md-menu>',
                //Shortcuts
                '<md-menu>',
                '<md-button style="width:auto"  aria-label="menu" class="md-icon-button" ng-click="$mdMenu.open()">Shortcuts</md-button>',
                '<md-menu-content width="4" ng-mouseleave="$mdMenu.close()">',
                '<md-menu-item><md-button ng-click="emit(\'clickToolbar_Shortcut_SetAllVisible\');" ng-disabled="notInForm">Set all controls visible</md-button></md-menu-item>',
                '<md-menu-item><md-button ng-click="emit(\'clickToolbar_Shortcut_SetAllEnabled\');" ng-disabled="notInForm">Set all controls enabled</md-button></md-menu-item>',
                '<md-menu-item><md-button ng-click="emit(\'clickToolbar_Shortcut_SetAllNoMandatory\');" ng-disabled="notInForm">Set all controls no mandatory</md-button></md-menu-item>',
                '<md-menu-item><md-button ng-click="emit(\'clickToolbar_Shortcut_SetAllBothThree\');" ng-disabled="notInForm">Set all controls visible/enabled/no mandatory</md-button></md-menu-item>',
                '<md-menu-divider></md-menu-divider>',
                '<md-menu-item><md-button ng-click="emit(\'clickToolbar_Shortcut_Solutions\');">Solutions</md-button></md-menu-item>',
                '<md-menu-item><md-button ng-click="emit(\'clickToolbar_Shortcut_Webresources\');">Webresources</md-button></md-menu-item>',
                '</md-menu>',
                //Tools
                '<md-menu>',
                '<md-button style="width:auto"  aria-label="menu" class="md-icon-button" ng-click="$mdMenu.open()">Tools</md-button>',
                '<md-menu-content width="4" ng-mouseleave="$mdMenu.close()">',
                '<md-menu-item><md-button ng-click="emit(\'clickToolbar_Tools_EditRecord\');">Edit record</md-button></md-menu-item>',
                '<md-menu-item><md-button ng-click="emit(\'clickToolbar_Tools_QueryConstructor\');">Query constructor</md-button></md-menu-item>',
                '<md-menu-item><md-button ng-click="emit(\'clickToolbar_Tools_CountRecord\');">Count records</md-button></md-menu-item>',
                '<md-menu-item><md-button ng-click="emit(\'clickToolbar_Tools_FetchXML\');">Fetch XML</md-button></md-menu-item>',
                '<md-menu-item><md-button ng-click="emit(\'clickToolbar_Tools_USDQuickAccess\');"  ng-disabled="isUSD">USD Quick access</md-button></md-menu-item>',

                '</md-menu>',
                //'<md-button style="color: white; margin-right: -5px; width: auto" ng-repeat="button in buttons" class="md-primary md-hue-1" ng-click="button.callback()" ng-disabled="!button.enabled()">{{button.title}}</md-button>',
                '</div > ',
                '<div ng-if="!notInForm"  layout="row">',
                '<input type="text" key="Logical name" ng-value="entityInfo.name" style="width: 200px; font-size: 20px; color: white; background: transparent; border: 0px; text-align: center;"></input>',
                '<input type="text" key="Id" ng-value="entityInfo.id" style="width: 420px; font-size: 20px; color: white; background: transparent; border: 0px; text-align: center;"></input>',
                
                '</div>',//INFO: WEB ETC
                '</div>',
                '</md-toolbar>',
                '</div>'].join(""),
            link: function ($scope, element, attrs) {
                $root = angular.element(document.querySelector('#hud-crm-div')).scope();
                $scope.isUSD = $root.isUSD;
                $scope.notInForm = $root.apply0131Changes && !$root.isForm;
                $scope.emit = function (name) {
                    $scope.$root.$broadcast(name, null);
                }
                $scope.entityInfo = HUDCRM_CORE.getEntityProperties();


                $scope.isOpen = true;
                $scope.clickHide = function () {
                    $scope.isOpen = false;
                    $scope.$root.$broadcast('generalVisibilityChanged', { visible: false });
                }
                $scope.clickShow = function () {
                    $scope.isOpen = true;
                    $scope.$root.$broadcast('generalVisibilityChanged', { visible: true });
                }

            },
            controller: function ($scope) {

            }
        }
    }]);
    app.directive('buttonBar', ['$window', function ($window) {
        return {
            restrict: "E",
            replace: true,
            scope: {
                buttons: '='
            },
            template: ['<div ng-style="inline">',
                '<div ng-style="inline">',
                '    <md-button style="margin-right: -5px; width: {{button.width}}px" ng-repeat="button in buttons" class="md-raised md-primary" ng-click="button.callback()" ng-disabled="!button.enabled()">{{button.title}}</md-button>',
                '</div > ',
                '</div>'].join(""),
            link: function ($scope, element, attrs) {
                $scope.inline = {
                    'display': 'inline-block',
                }
                $scope.style = {
                    'width': '',
                    'z-index': '2147483644',
                };
            },
            controller: function ($scope) {

            }
        }
    }]);
    app.directive('buttonElement', ['$window', function ($window) {
        return {
            restrict: "E",
            replace: true,
            scope: {
                title: '=',
                click: '&',
                disabled: '&',
            },
            template: ['<div ng-style="inline">',
                '<div class="btn btn-primary btn-sm" ng-click="click()" ng-disabled="disabled()">{{title}}</div>',
                '</div>'].join(""),
            link: function ($scope, element, attrs) {
                $scope.inline = {
                    'display': 'inline-block',
                }
                $scope.style = {
                    'border-radius': '50%',
                    'z-index': '2147483644',
                };
            },
            controller: function ($scope) {

            }
        }
    }]);
    app.directive('tile', ['$window', function ($window) {
        return {
            restrict: "E",
            replace: true,
            scope: {
                color: '=',
                click: '&'
            },
            template: ['<div ng-style="style" ng-click="click()">',
                '<span ng-class="color">*</span>',
                '</div>'].join(""),
            link: function ($scope, element, attrs) {
                $scope.style = {
                    'display': 'inline-block',
                    'cursor': 'pointer',
                    'border-radius': '50%',
                    'z-index': '2147483644',
                };
            },
            controller: function ($scope) {

            }
        }
    }]);
    app.directive('inputBool', ['$window', function ($window) {
        return {
            restrict: "E",
            replace: true,
            scope: {
                value: '=',
                handler: '&',
                options: '=',
            },
            template: ['<md-input-container style="width:100%;">',
                '<md-switch md-invert style="margin: 0px" aria-label="{{name}}" ng-model="value" ng-change="handler({value: value})">',
                '<div style= "margin:20px">{{name}}</span></div></md-switch>',
                '</md-input-container>'].join(""),
            link: function ($scope, element, attrs) {
                $scope.name = attrs.key;
            },
            controller: function ($scope) {

            }
        }
    }]);
    app.directive('inputSelect', ['$window', function ($window) {
        return {
            restrict: "E",
            replace: true,
            scope: {
                value: '=',
                handler: '&',
                options: '=',
            },
            template: ['<md-input-container style="width:100%; padding-left:10px; padding-right:10px; " >',
                '<label>{{name}}</label>',
                '<md-select ng-model="value" ng-change="handler({value: value})" aria-label="{{name}}" >',
                '<md-option ng-repeat="option in options" value="{{option.value}}">{{option.display}}</md-option>',
                '</md-select>',
                '</md-input-container>'].join(""),
            link: function ($scope, element, attrs) {
                $scope.name = attrs.key;
            },
            controller: function ($scope) {

            }
        }
    }]);
    app.directive('inputArea', ['$window', function ($window) {
        return {
            restrict: "E",
            replace: true,
            scope: {
                value: '=',
            },
            template: ['<md-input-container style="width:100%; padding-left:10px; padding-right:10px; margin-bottom:0px;" >',
                '<label>{{name}}</label>',
                '<textarea ng-model="value" rows="{{rows()}}" max-rows="10" md-select-on-focus style="font-size: 16px;" ></textarea>',
                '</md-input-container>'].join(""),
            link: function ($scope, element, attrs) {
                $scope.name = attrs.key;
                $scope.rows = function () { return 10; };
            }
        }
    }]);
    app.directive('inputList', ['$window', function ($window) {
        return {
            restrict: "E",
            replace: true,
            scope: {
                value: '=',
            },
            template: ['<md-input-container style="width:100%; max-height:80px; padding-left:10px; padding-right:10px;" >',
                '<label>{{name}}</label>',
                '<md-list class="md-dense" flex>',
                '<md-list-item ng-repeat="option in value">{{option}}</md-list-item>',
                '</md-list>',
                '</md-input-container>'].join(""),
            link: function ($scope, element, attrs) {
                $scope.name = attrs.key;
            },
            controller: function ($scope) {

            }
        }
    }]);
    app.directive('inputText', ['$window', function ($window) {
        return {
            restrict: "E",
            replace: true,
            scope: {
                value: '=',
            },
            template: ['',
                '<md-input-container  class="md-block" style="width:100%; padding-left:10px; padding-right:10px; margin:0px; margin-top: 10px" > ',
                '<label ng-if="name!=null">{{name}}</label>',
                '<input aria-label="text" style="font-size: 16px" ng-model="value">',
                '</md-input-container>',
                ''].join(""),
            link: function ($scope, element, attrs) {

                $scope.name = attrs.key;
            },
            controller: function ($scope) {

            }
        }
    }]);
    app.directive('inputInteger', ['$window', function ($window) {
        return {
            restrict: "E",
            replace: true,
            scope: {
                value: '=',
            },
            template: ['',
                '<md-input-container  class="md-block" style="width:100%; padding-left:10px; padding-right:10px; margin:0px; margin-top: 10px" > ',
                '<label ng-if="name!=null">{{name}}</label>',
                '<input style="font-size: 16px" ng-model="value" ng-model-options="{updateOn: \'blur\'}">',
                '</md-input-container>',
                ''].join(""),
            link: function ($scope, element, attrs) {
                $scope.$watch('value', function (newVal, oldVal) {
                    if (newVal != oldVal) {
                        var integer = parseInt(newVal);
                        if (isNaN(integer)) {
                            $scope.value = null;
                            return;
                        }
                        $scope.value = integer;
                    }
                });
                $scope.name = attrs.key;
            },
            controller: function ($scope) {

            }
        }
    }]);
    app.directive('inputFloat', ['$window', function ($window) {
        return {
            restrict: "E",
            replace: true,
            scope: {
                value: '=',
                precision: '=',
            },
            template: ['',
                '<md-input-container  class="md-block" style="width:100%; padding-left:10px; padding-right:10px; margin:0px; margin-top: 10px" > ',
                '<label ng-if="name!=null">{{name}}</label>',
                '<input style="font-size: 16px"   ng-model="value" ng-model-options="{updateOn: \'blur\'}">',
                '</md-input-container>',
                ''].join(""),
            link: function ($scope, element, attrs) {
                console.log($scope.precision);

                $scope.$watch('value', function (newVal, oldVal) {
                    if (newVal != oldVal) {
                        var decimal = parseFloat(newVal);
                        $scope.value = decimal;
                    }
                });

                $scope.name = attrs.key;
            },
            controller: function ($scope) {

            }
        }
    }]);
    app.directive('inputDecimal', ['$window', function ($window) {
        return {
            restrict: "E",
            replace: true,
            scope: {
                value: '=',
                precision: '=',
            },
            template: ['',
                '<md-input-container  class="md-block" style="width:100%; padding-left:10px; padding-right:10px; margin:0px; margin-top: 10px" > ',
                '<label ng-if="name!=null">{{name}}</label>',
                '<input style="font-size: 16px"   ng-model="value" ng-model-options="{updateOn: \'blur\'}">',
                '</md-input-container>',
                ''].join(""),
            link: function ($scope, element, attrs) {
                console.log($scope.precision);

                $scope.$watch('value', function (newVal, oldVal) {
                    if (newVal != oldVal) {
                        var decimal = parseFloat(newVal);
                        if (isNaN(decimal)) {
                            $scope.value = null;
                            return;
                        }
                        var splitArray = (decimal + "").split(".");
                        var precision = 0;
                        if (splitArray.length == 1) {
                            precision = 1;
                        } else {
                            precision = splitArray[1].length;
                        }
                        $scope.value = decimal.toFixed(Math.min($scope.precision, precision));
                    }
                });

                $scope.name = attrs.key;
            },
            controller: function ($scope) {

            }
        }
    }]);
    app.directive('inputLookup', ['$window', function ($window) {
        return {
            restrict: "E",
            replace: true,
            scope: {
                value: '=',
                openEditRecord: '&',
            },
            template: ['<div>',
                '<input-text key="Lookup Id" value="id"></input-text>',
                '<input-text key="Lookup Entity" value="typename"></input-text>',
                '<div layout="row" layout-align="end center">',
                '<md-button class="md-raised" ng-click="openEditRecord({entity:typename, id: id})" style="width: auto" >Edit record in HUD</md-button>',
                '<md-button class="md-raised" ng-click="navigate()" style="width: auto" >Open in browser</md-button>',
                '</div>',
                '</div>'].join(""),
            link: function ($scope, element, attrs) {
                $scope.navigate = function () {
                    HUDCRM_TOOL.navigateRecordWithEntityName($scope.typename, $scope.id);
                }

                $scope.name = attrs.key;
                var id = "";
                var typename = "";
                if (typeof $scope.value != 'undefined' && $scope.value != null) {
                    if (typeof $scope.value.id != 'undefined' && $scope.value.id != null) {
                        id = $scope.value.id;
                    }
                    if (typeof $scope.value.typename != 'undefined' && $scope.value.typename != null) {
                        typename = $scope.value.typename;
                    }
                }
                $scope.id = id;
                $scope.typename = typename;
            },
            controller: function ($scope) {

            }
        }
    }]);
    app.directive('inputDatetime', ['$window', function ($window) {
        return {
            restrict: "E",
            replace: true,
            scope: {
                value: '=',
                dateOnly: '=',
            },
            template: ['<div layout="row">',
                '<md-datetime ng-if="!dateOnly && format" flex ng-model="time.val" ng-change="handleChange()" no-reset></md-datetime>',
                '<md-datepicker ng-if="dateOnly && format" flex  ng-model="time.val" ng-change="handleChange()"></md-datepicker>',
                '<input-text  ng-if="!format" value="time.string"  ng-model-options="{updateOn: \'blur\'}"></input-text>',
                '<md-button class="md-raised" style="width: auto;" ng-click="format = !format">Change format</md-button>',
                '</div>'].join(""),
            link: function ($scope, element, attrs) {

                $scope.name = attrs.key;
                $scope.time = { val: null, string: null };
                $scope.$watch("value", function (newVal, oldValue) {
                    $scope.format = true;
                    $scope.time.val = new Date($scope.value);
                    $scope.time.string = $scope.value;
                });

                $scope.$watch("time.string", function (newVal, oldValue) {
                    $scope.value = newVal;

                });

                $scope.format = true;
                $scope.handleChange = function () {
                    var stringDate = $scope.time.val;
                    if ($scope.dateOnly) {
                        stringDate = formatDate($scope.time.val, $scope.dateOnly);
                    }
                    $scope.value = stringDate;
                    $scope.time.string = stringDate;
                }

                function formatDate(date, dateOnly) {
                    var hour = date.getHours();
                    if (hour < 10) {
                        hour = "0" + hour;
                    }
                    var minut = date.getMinutes();
                    if (minut < 10) {
                        minut = "0" + minut;
                    }
                    var second = date.getSeconds();
                    if (second < 10) {
                        second = "0" + second;
                    }
                    var day = date.getDate();
                    if (day < 10) {
                        day = "0" + day;
                    }
                    var monthIndex = date.getMonth() + 1;
                    if (monthIndex < 10) {
                        monthIndex = "0" + monthIndex;
                    }
                    var year = date.getFullYear();
                    var strDate = year + "-" + monthIndex + "-" + day + "T" + hour + ":" + minut + ":" + second + "Z";
                    if (dateOnly) {
                        strDate = year + "-" + monthIndex + "-" + day + "T00:00:00";
                    }
                    return strDate;
                }
            },
            controller: function ($scope) {

            }
        }
    }]);
    app.directive('inputAutocompleteRelations', ['$window', function ($window) {
        return {
            restrict: "E",
            replace: true,
            scope: {
                items: '=',
                selected: '=',
                filterFn: '&',
                changed: '&',
            },
            template: ['<div>',
                '<md-autocomplete ',
                'md-search-text="searchText" ',
                'md-selected-item="selected"',
                'md-selected-item-change="selectedItemChange(item)" ',
                'md-items="item in filterEntities(searchText)" ',
                'md-item-text="getLabel(item)" ',
                'md-min-length="0" ',
                'placeholder="{{name}}"> ',
                '<md-item-template>',
                '<div layout="row">',
                '<div flex>{{item.schemaName}}</div>',
                '<div flex><div>{{item.referencedEntity}}[{{item.referencedAttribute}}]->{{item.referencingEntity}}[{{item.referencingAttribute}}]</div></div>',
                '</div>',
                //'<div>{{getLabel({item:item})}}</div>',
                '</md-item-template>',
                '<md-not-found>',
                'No relations matching "{{ searchText }}" were found.',
                '</md-not-found>',
                '</md-autocomplete>',
                '</div>'].join(""),
            link: function ($scope, element, attrs) {

                $scope.getLabel = function (item) {
                    return item["schemaName"];
                }
                $scope.filterEntities = function (query) {
                    var results = query ? $scope.items.filter(createFilterFor(query)) : $scope.items;
                    return results;
                }
                function createFilterFor(query) {
                    var lowercaseQuery = angular.lowercase(query);
                    return function filter(entity) {
                        return $scope.filterFn({ item: entity, query: lowercaseQuery });
                    }
                }
                $scope.name = attrs.key;
                angular.element(element).bind('keydown', null, (e) => {
                    if (e.which == 8) {
                        var oldValue = $scope.searchText;
                        var lenOldValue = oldValue.length;
                        if (lenOldValue > 0) {
                            var newVale = oldValue.substr(0, lenOldValue - 1);
                            $scope.$apply(function () { $scope.searchText = newVale; });
                        }
                        e.preventDefault();
                    } else if (e.which == 32) {
                        $scope.$apply(function () { $scope.searchText += " "; });
                        e.preventDefault();
                    }
                });
                $scope.searchText = "";
                $scope.selectedItemChange = function (item) {
                    $scope.changed({ item: item });
                }
            },
            controller: function ($scope) {

            }
        }
    }]);
    app.directive('inputAutocompleteEntities', ['$window', function ($window) {
        return {
            restrict: "E",
            replace: true,
            scope: {
                items: '=',
                selected: '=',
                getLabel: '&',
                filterFn: '&',
                changed: '&',

            },
            template: ['<div>',
                '<md-autocomplete ',
                'md-search-text="searchText" ',
                'md-selected-item="selected"',
                'md-selected-item-change="selectedItemChange(item)" ',
                'md-items="item in filterEntities(searchText)" ',
                'md-item-text="getLabel({item:item})" ',
                'md-min-length="0" ',
                'placeholder="{{name}}"> ',
                '<md-item-template>',
                '<div>{{getLabel({item:item})}}</div>',
                '</md-item-template>',
                '<md-not-found>',
                'No entities matching "{{ searchText }}" were found.',
                '</md-not-found>',
                '</md-autocomplete>',
                '</div>'].join(""),
            link: function ($scope, element, attrs) {


                $scope.filterEntities = function (query) {
                    var results = query ? $scope.items.filter(createFilterFor(query)) : $scope.items;
                    return results;
                }
                function createFilterFor(query) {
                    var lowercaseQuery = angular.lowercase(query);
                    return function filter(entity) {
                        return $scope.filterFn({ item: entity, query: lowercaseQuery });
                    }
                }
                $scope.name = attrs.key;
                angular.element(element).bind('keydown', null, (e) => {
                    if (e.which == 8) {
                        var oldValue = $scope.searchText;
                        var lenOldValue = oldValue.length;
                        if (lenOldValue > 0) {
                            var newVale = oldValue.substr(0, lenOldValue - 1);
                            $scope.$apply(function () { $scope.searchText = newVale; });
                        }
                        e.preventDefault();
                    } else if (e.which == 32) {
                        $scope.$apply(function () { $scope.searchText += " "; });
                        e.preventDefault();
                    }
                });
                $scope.searchText = "";
                $scope.selectedItemChange = function (item) {
                    $scope.changed({ item: item });
                }
            },
            controller: function ($scope) {

            }
        }
    }]);
    app.directive('inputAutocompleteLookup', ['$window', function ($window) {
        return {
            restrict: "E",
            replace: true,
            scope: {
                selected: '=',
                getLabel: '&',
                changed: '&',
                queryPromise: '&',
            },
            template: ['<div>',
                '<md-autocomplete ',
                'md-search-text="searchText" ',
                'md-selected-item="selected"',
                'md-selected-item-change="selectedItemChange(item)" ',
                'md-items="item in filterEntities(searchText)" ',
                'md-item-text="getLabel({item:item})" ',
                'md-min-length="0" ',
                'placeholder="{{name}}"> ',
                '<md-item-template>',
                '<div>{{getLabel({item:item})}}</div>',
                '</md-item-template>',
                '<md-not-found>',
                'No records matching "{{ searchText }}" were found.',
                '</md-not-found>',
                '</md-autocomplete>',
                '</div>'].join(""),
            link: function ($scope, element, attrs) {

                $scope.filterEntities = function (query) {
                    return $scope.queryPromise({ query: query });
                }
                function createFilterFor(query) {
                    var lowercaseQuery = angular.lowercase(query);
                    return function filter(entity) {
                        return $scope.filterFn({ item: entity, query: lowercaseQuery });
                    }
                }
                $scope.name = attrs.key;
                angular.element(element).bind('keydown', null, (e) => {
                    if (e.which == 8) {
                        var oldValue = $scope.searchText;
                        var lenOldValue = oldValue.length;
                        if (lenOldValue > 0) {
                            var newVale = oldValue.substr(0, lenOldValue - 1);
                            $scope.$apply(function () { $scope.searchText = newVale; });
                        }
                        e.preventDefault();
                    } else if (e.which == 32) {
                        $scope.$apply(function () { $scope.searchText += " "; });
                        e.preventDefault();
                    }
                });
                $scope.searchText = "";
                $scope.selectedItemChange = function (item) {
                    $scope.changed({ item: item });
                }
            },
            controller: function ($scope) {

            }
        }
    }]);
    app.directive('inputSelectMultiple', ['$window', function ($window) {
        return {
            restrict: "E",
            replace: true,
            scope: {
                selected: '=',
                items: '=',
                getLabel: '&',
                filterFn: '&',
            },
            template: ['<div>',
                ' <label>{{name}}</label>',
                '<md-select ng-model="selected" md-on-close="clear()" data-md-container-class="selectdemoSelectHeader" aria-label="select" multiple>',
                '<md-select-header class="demo-select-header">',
                '<input ng-model="searchTerm" type="search" placeholder="Search for attributes" class="demo-header-searchbox md-text">',
                '</md-select-header>',
                '<md-optgroup label="{{name}}">',
                '<md-option ng-value="item" ng-repeat="item in filterAttributes(searchTerm) ">{{getLabel({item: item})}}</md-option>',
                '</md-optgroup>',
                '</md-select>',
                '</div>'].join(""),
            link: function ($scope, element, attrs) {
                $scope.name = attrs.key;
                $scope.searchTerm = "";
                $scope.filterAttributes = function (query) {
                    var results = query ? $scope.items.filter(createFilterFor(query)) : $scope.items;
                    return results;
                }
                function createFilterFor(query) {
                    var lowercaseQuery = angular.lowercase(query);
                    return function filter(entity) {
                        return $scope.filterFn({ item: entity, query: lowercaseQuery });
                    }
                }
                $scope.value = "";
                $scope.clear = function () {
                    $scope.value = "";
                };
                element.find('input').on('keydown', function (ev) {
                    ev.stopPropagation();
                });
            },
            controller: function ($scope) {

            }
        }
    }]);
    app.directive('loadingBig', ['$window', function ($window) {
        return {
            restrict: "E",
            replace: true,
            scope: {
                show: '=',
            },
            template: ['<div ng-show="show">',
                '<div layout="row" layout-align="center center">',
                '<h4 style="margin-right: 20px">{{name()}}</h4>',
                '<md-progress-circular md-mode="indeterminate"></md-progress-circular>',
                '</div>',
                '</div>'].join(""),
            link: function ($scope, element, attrs) {
                $scope.name = function () {
                    return attrs.key
                };
            },
            controller: function ($scope) {

            }
        }
    }]);
    app.directive('loadingSmall', ['$window', function ($window) {
        return {
            restrict: "E",
            replace: true,
            scope: {
                show: '=',
            },
            template: ['<div ng-show="show">',
                '<div layout="row" layout-align="center center">',
                '<h5 style="margin-right: 20px">{{name()}}</h5>',
                '<md-progress-circular  md-diameter="32"  md-mode="indeterminate"></md-progress-circular>',
                '</div>',
                '</div>'].join(""),
            link: function ($scope, element, attrs) {
                $scope.name = function () {
                    return attrs.key
                };
            },
            controller: function ($scope) {

            }
        }
    }]);
    app.directive('queryConstructorInputEntity', ['$window', function ($window) {
        return {
            restrict: "E",
            replace: true,
            scope: {
                entityChanged: '&',
                items: '&',
                selected: '='
            },
            template: ['<md-card  class="md-padding">',
                '<h3>Select entity</h3>',
                '<input-autocomplete-entities selected="selected" get-label="getLabelEntity(item)" filter-fn="filterFnEntities(item,query)" changed="entityChanged({item:item})" key="Select an entity" items="items()"></input-autocomplete-entities>',
                '</md-card>',].join(""),
            link: function ($scope, element, attrs) {
                $scope.starterEntity = null;
                $scope.getLabelEntity = function (entity) {
                    if (typeof (entity["displayName"]) != 'undefined') {
                        return entity["displayName"];
                    }
                    return entity["logicalName"];
                }
                $scope.filterFnEntities = function (entity, query) {
                    var text = entity["logicalName"];
                    if (typeof (entity["displayName"]) != 'undefined') {
                        text += entity["displayName"];
                    }
                    return (angular.lowercase(text).indexOf(query) >= 0);
                }
            },
            controller: function ($scope) {

            }
        }
    }]);
    app.directive('queryConstructorInputAttributes', ['$window', function ($window) {
        return {
            restrict: "E",
            replace: true,
            scope: {
                selected: '=',
                attributes: '=',
                removeAttribute: '&',
            },
            template: ['<md-card  class="md-padding">',
                '<h3>Select attributes</h3>',
                '<input-select-multiple key="Select attributes" selected="selected" get-label="getLabelAttribute(item)" filter-fn="filterFnAttributes(item,query)"  key="Attributes" items="attributes"></input-select-multiple>',
                '<table  class="table table-hover table-mc-light-blue">',
                '<thead>',
                '<tr style="color: black">',
                '<th><h5>Display name</h5></th><th><h5>Schema name</h5></th><th><h5>Type</h5></th><th><h5>Remove</h5></th>',
                '</tr>',
                '</thead>',
                '<tbody>',
                '<tr ng-repeat="attribute in selected">',
                '<td>{{attribute.displayName}}</td><td>{{attribute.schemaName}}</td><td>{{attribute.type}}</td><td><md-button class="md-icon-button" ng-click="removeAttribute({attribute:attribute})" aria-label="Close"><md-icon  class="icon-clickable"  md-svg-src="img/icons/ic_delete_grey_24px.svg"></md-icon></md-button></td>',
                '</tr>',
                '</tbody>',
                '</table>',
                '</md-card>', ,].join(""),
            link: function ($scope, element, attrs) {
                $scope.getLabelAttribute = function (attr) {
                    return attr["displayName"];
                }
                $scope.filterFnAttributes = function (attr, query) {
                    var text = attr["logicalName"];
                    if (typeof (attr["displayName"]) != 'undefined') {
                        text += attr["displayName"];
                    }
                    return (angular.lowercase(text).indexOf(query) >= 0);
                }

            },
            controller: function ($scope) {

            }
        }
    }]);
    app.directive('queryConstructorExpandRelations', ['$window', function ($window) {
        return {
            restrict: "E",
            replace: true,
            scope: {
                selected: '=',
                relations: '=',
                removeRelation: '&',
            },
            template: ['<md-card  class="md-padding">',
                '<h3>Select relations to expand (max 6 relations)</h3>',
                '<input-select-multiple key="Select relations" selected="selected" get-label="getLabelRelation(item)" filter-fn="filterFnRelations(item,query)"  key="Relations" items="relations"></input-select-multiple>',
                '<table  class="table table-hover table-mc-light-blue">',
                '<thead>',
                '<tr style="color: black">',
                '<th><h5>Relation name</h5></th><th><h5>Related entity</h5></th><th><h5>Type</h5></th><th><h5>Remove</h5></th>',
                '</tr>',
                '</thead>',
                '<tbody>',
                '<tr ng-repeat="relation in selected">',
                '<td>{{relation.schemaName}}</td><td>{{getRelatedEntity(relation)}}</td><td>{{relation.type}}</td><td><md-button class="md-icon-button" ng-click="removeRelation({relation:relation})" aria-label="Close"><md-icon  class="icon-clickable"  md-svg-src="img/icons/ic_delete_grey_24px.svg"></md-icon></md-button></td>',
                '</tr>',
                '</tbody>',
                '</table>',
                '</md-card>', ,].join(""),
            link: function ($scope, element, attrs) {

                $scope.getRelatedEntity = function (rel) {
                    if (rel["type"] == "1:N") {
                        return rel["referencingEntity"];
                    }
                    return rel["referencedEntity"];
                }

                $scope.getLabelRelation = function (rel) {
                    var name = "[" + rel["type"] + "] ";
                    if (rel["type"] == "1:N") {
                        name += "[" + rel["referencingEntity"] + "] " + rel["referencingAttribute"];
                    } else {
                        name += "[" + rel["referencedEntity"] + "] " + rel["referencedAttribute"];
                    }
                    return name;
                }
                $scope.filterFnRelations = function (rel, query) {
                    var text = rel["referencedAttribute"] + rel["referencedEntity"] + rel["referencingAttribute"] + rel["referencingEntity"] + rel["type"];
                    return (angular.lowercase(text).indexOf(query) >= 0);
                }

            },
            controller: function ($scope) {

            }
        }
    }]);
    app.directive('queryConstructorOrderBy', ['$window', function ($window) {
        return {
            restrict: "E",
            replace: true,
            scope: {
                selected: '=',
                attributes: '=',
                removeAttribute: '&',
                type: '=',
            },
            template: ['<md-card  class="md-padding">',
                '<h3>Order by (max 2 attributes)</h3>',
                '<input-select-multiple key="Select attributes" selected="selected" get-label="getLabelAttribute(item)" filter-fn="filterFnAttributes(item,query)"  key="Attributes" items="attributes"></input-select-multiple>',
                '<table  class="table table-hover table-mc-light-blue">',
                '<thead>',
                '<tr style="color: black">',
                '<th><h5>Attribute</h5></th><th><h5>Remove</h5></th>',
                '</tr>',
                '</thead>',
                '<tbody>',
                '<tr ng-repeat="attribute in selected">',
                '<td>{{attribute.displayName}}</td><td><md-button class="md-icon-button" ng-click="removeAttribute({attribute:attribute})" aria-label="Close"><md-icon  class="icon-clickable"  md-svg-src="img/icons/ic_delete_grey_24px.svg"></md-icon></md-button></td>',
                '</tr>',
                '</tbody>',
                '</table>',
                '<div ng-show="selected.length>0" layout="row">',
                '<h4>Type Asc/desc</h4>',
                '<input-select value="typeValue" key="Type asc/desc" options="values" handler="onChangeType(value)"></input-select>',
                '</div>',
                '</md-card>', ,].join(""),
            link: function ($scope, element, attrs) {

                $scope.values = [{ value: "asc", display: "Asc" }, { value: "desc", display: "Desc" }];
                //TODO: doesn't autoselect first option
                $scope.typeValue = $scope.values[0];
                $scope.onChangeType = function (type) {
                    console.log(type);
                    $scope.type = type;
                }
                $scope.getLabelAttribute = function (attr) {
                    return attr["displayName"];
                }
                $scope.filterFnAttributes = function (attr, query) {
                    var text = attr["logicalName"];
                    if (typeof (attr["displayName"]) != 'undefined') {
                        text += attr["displayName"];
                    }
                    return (angular.lowercase(text).indexOf(query) >= 0);
                }

            },
            controller: function ($scope) {

            }
        }
    }]);
    app.directive('queryConstructorSkipTop', ['$window', function ($window) {
        return {
            restrict: "E",
            replace: true,
            scope: {
                skip: '=',
                top: '=',
            },
            template: ['<md-card  class="md-padding">',
                '<h3>Skip/Top</h3>',
                '<input-integer value="skip" key="Skip records from the top"></input-integer>',
                '<input-integer value="top" key="Top records after skip"></input-integer>',
                '</md-card>', ,].join(""),
            link: function ($scope, element, attrs) {

            },
            controller: function ($scope) {

            }
        }
    }]);
    app.directive('queryConstructorInputFilters', ['$window', function ($window) {
        return {
            restrict: "E",
            replace: true,
            scope: {
                selected: '=',
                attributes: '=',
                removeAttribute: '&',
            },
            template: ['<md-card  class="md-padding">',
                '<h3>Add filters to the query</h3>',
                '<input-select-multiple key="Select attributes" selected="selected" get-label="getLabelAttribute(item)" filter-fn="filterFnAttributes(item,query)"  key="Attributes" items="attributes"></input-select-multiple>',
                '<table  class="table table-hover table-mc-light-blue">',
                '<thead>',
                '<tr style="color: black">',
                '<th><h5>And/Or</h5></th><th><h5>Attribute</h5></th><th><h5>Operator</h5></th><th><h5>Remove</h5></th>',
                '</tr>',
                '</thead>',
                '<tbody>',
                '<tr ng-repeat="attribute in selected">',
                '<td>',
                '<div ng-if="$index>0">',
                '<input-select value="attribute.andor" key="And/Or" options="valuesAndOr" ></input-select>',
                '</div>',
                '</td><td ><div layout="row" style="height:70px"  layout-align="start center">{{attribute.schemaNameFormatted}}</div></td><td>',
                '<input-select value="attribute.operator" key="Operator" options="valuesOperator" ></input-select>',
                '</td><td><md-button class="md-icon-button" ng-click="removeAttribute({attribute:attribute})" aria-label="Close"><md-icon  class="icon-clickable"  md-svg-src="img/icons/ic_delete_grey_24px.svg"></md-icon></md-button></td>',
                '</tr>',
                '</tbody>',
                '</table>',
                '</md-card>', ,].join(""),
            link: function ($scope, element, attrs) {
                $scope.valuesAndOr = [{ value: "and", display: "And" }, { value: "or", display: "Or" }];
                $scope.valuesOperator = [{ value: "eq", display: "Equal" }, { value: "ne", display: "Not Equal" }, { value: "gt", display: "Greater than" }, { value: "ge", display: "Greater than or equal" }, { value: "lt", display: "Less than" }, { value: "le", display: "Less than or equal" }];

                $scope.getLabelAttribute = function (attr) {
                    return attr["schemaNameFormatted"];
                }
                $scope.filterFnAttributes = function (attr, query) {
                    var text = attr["logicalName"];
                    if (typeof (attr["displayName"]) != 'undefined') {
                        text += attr["displayName"];
                    }
                    return (angular.lowercase(text).indexOf(query) >= 0);
                }

            },
            controller: function ($scope) {

            }
        }
    }]);
    app.directive('queryConstructorShowCode', ['$window', function ($window) {
        return {
            restrict: "E",
            replace: true,
            scope: {
                onClick: '&',
            },
            template: ['<md-card  class="md-padding">',
                '<h3>Javascript code</h3>',
                '<div layout="row"  layout-align="center center">',
                '<h4 style="margin-right: 20px">Check the code </h4>',
                '<md-button class="md-icon-button" ng-click="onClick()" aria-label="Code">',
                '<md-icon  class="icon-clickable"  md-svg-src="img/icons/ic_code_grey_24px.svg">',
                '</md-icon>',
                '</md-button>',
                '</div>',
                '</md-card>',
                '</div>',
                '</md-tab>'].join(""),
            link: function ($scope, element, attrs) {

            },
            controller: function ($scope) {

            }
        }
    }]);

    function InitializePostBootstraped() {
        try {
            var target = HUDCRM_CORE.getTargetDivForMainMenu();

            HUDCRM_UI.preppendDiv(target, '<div id="' + HUDCRM_UI.idDivHud + '" ng-controller="hudController"><hud></hud></div>');
            angular.bootstrap(document.getElementById('hud-crm-div'), ['hudApp']);
            HUDCRM_INTER.controller = angular.element($("#hud-crm-div")).scope();
            HUDCRM_UI.scanUi();
            if (HUDCRM_CORE.isForm) {
                HUDCRM_UI.setUi();
            }


        } catch (e) {
            console.error(e);
        }
    }
    function appendMainAppDiv() {

    }

    InitializePostBootstraped();
}

var HUDCRM_TOOL = {

    GUID_EMPTY: "00000000-0000-0000-0000-000000000000",
    downloadPlainText: function (filename, text) {
        var element = document.createElement('a');
        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
        element.setAttribute('download', filename);
        element.style.display = 'none';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    },
    compare2Objects: function (x, y) {
        var p;
        if (isNaN(x) && isNaN(y) && typeof x === 'number' && typeof y === 'number') {
            return true;
        }
        if (x === y) {
            return true;
        }

        if ((typeof x === 'function' && typeof y === 'function') ||
            (x instanceof Date && y instanceof Date) ||
            (x instanceof RegExp && y instanceof RegExp) ||
            (x instanceof String && y instanceof String) ||
            (x instanceof Number && y instanceof Number)) {
            return x.toString() === y.toString();
        }

        if (!(x instanceof Object && y instanceof Object)) {
            return false;
        }

        if (x.isPrototypeOf(y) || y.isPrototypeOf(x)) {
            return false;
        }

        if (x.constructor !== y.constructor) {
            return false;
        }

        if (x.prototype !== y.prototype) {
            return false;
        }

        if (leftChain.indexOf(x) > -1 || rightChain.indexOf(y) > -1) {
            return false;
        }

        for (p in y) {
            if (y.hasOwnProperty(p) !== x.hasOwnProperty(p)) {
                return false;
            }
            else if (typeof y[p] !== typeof x[p]) {
                return false;
            }
        }

        for (p in x) {
            if (y.hasOwnProperty(p) !== x.hasOwnProperty(p)) {
                return false;
            }
            else if (typeof y[p] !== typeof x[p]) {
                return false;
            }

            switch (typeof (x[p])) {
                case 'object':
                case 'function':

                    leftChain.push(x);
                    rightChain.push(y);

                    if (!compare2Objects(x[p], y[p])) {
                        return false;
                    }

                    leftChain.pop();
                    rightChain.pop();
                    break;

                default:
                    if (x[p] !== y[p]) {
                        return false;
                    }
                    break;
            }
        }

        return true;
    },
    navigate: function (url) {
        window.open(url);
    },
    navigateRecordWithEntityName: function (entity, id) {
        var url = HUDCRM_TOOL.getUrl();
        url += "/main.aspx?etn=";
        url += entity;
        url += "&pagetype=entityrecord";
        url += "&extraqs=id%3d";
        url += id;
        HUDCRM_TOOL.navigate(url);
    },
    getUrl: function () {
        return HUDCRM_SOAP._getUrl();
    },
    sortArray: function (array, property) {
        var output = array.sort(function (a, b) {
            var nameA__ = (a[property] + "").toLowerCase();
            var nameB__ = (b[property] + "").toLowerCase();
            if (nameA__ < nameB__)
                return -1;
            if (nameA__ > nameB__)
                return 1;
            return 0;
        });
        return output;
    }
}
var HUDCRM_INTER = {
    controller: null,

    apply: function (callback) {
        HUDCRM_INTER.controller.$apply(function () {
            callback();
        })
    }
}
var HUDCRM_UI = {
    idDivHud: "hud-crm-div",
    tree: Array(),
    controlsInTabs: Array(),  //array with only controls in UI
    attributes: Array(),
    webResources: Array(),
    typesUiTiles: { tab: 'tab', section: 'section', control: 'control' },
    colors: { green: 'success', yellow: 'warning', red: 'danger' },
    controlType: { memo: 'memo', webresource: 'webresource', subgrid: 'subgrid', iframe: 'iframe' },

    isVisible: function () {
        return !HUDCRM_INTER.controller.hidden;
    },
    scanUi: function () {
        try {
            var version = HUDCRM_CORE.getApplicationVersion();
            HUDCRM_UI.attributes = HUDCRM_CORE.isForm ? HUDCRM_XRM.getAttributes(version) : null;
            HUDCRM_UI.tree = HUDCRM_CORE.isForm ? HUDCRM_XRM.getTree(version) : null;
            HUDCRM_UI.controlsInTabs = HUDCRM_CORE.isForm ? HUDCRM_XRM.controlsInTabs : null;
            HUDCRM_UI.webResources = HUDCRM_XRM.webResources;
            HUDCRM_INTER.apply(function () { HUDCRM_INTER.controller.setUiScanedObject({ tree: HUDCRM_UI.tree, attributes: HUDCRM_UI.attributes, controlsInTabs: HUDCRM_UI.controlsInTabs, webresources: HUDCRM_UI.webResources }); });

        } catch (e) {
            console.error(e);
        }
        
    },
    setUi: function () {
        var tree = HUDCRM_UI.tree;
        for (var i = 0; i < tree.tabs.length; i++) {
            var tab = tree.tabs[i];
            HUDCRM_UI.setTabUi(tab);
        }
        for (var i = 0; i < tree.controls.length; i++) {
            var control = tree.controls[i];
            HUDCRM_UI.setControlUi(control, true);
        }
        $(window).resize(function () {
            HUDCRM_UI.updatePositionUi(false);
        });
        HUDCRM_UI.updatePositionUi(true);
        HUDCRM_UI.updateVisibilityUi(true);
    },
    setTabUi: function (tab) {
        try {
            var type = HUDCRM_UI.typesUiTiles.tab;
            var target = HUDCRM_CORE.getTargetDivForTiles();
            var id = HUDCRM_UI.getIdForUi(tab.name, type);
            var name = tab.name;
            var position = HUDCRM_UI.getPositionTab(tab);
            if (position != null) {
                var idTile = "tile_" + id;
                var div = HUDCRM_UI.getTile(idTile, position, HUDCRM_UI.colors.green);
                $(target).append(div);
                $("#" + idTile).click(function () { HUDCRM_UI.clickTileHandler(name, type) });
            }
            if (typeof tab.sections != 'undefined' && tab.sections != null) {
                for (var i = 0; i < tab.sections.length; i++) {
                    var section = tab.sections[i];
                    HUDCRM_UI.setSectionUi(section);
                }
            }
        } catch (e) {
            console.error(e);
        }

    },
    setSectionUi: function (section) {
        try {
            var type = HUDCRM_UI.typesUiTiles.section;
            var target = HUDCRM_CORE.getTargetDivForTiles();
            var id = HUDCRM_UI.getIdForUi(section.name, type);
            var name = section.name;
            var position = HUDCRM_UI.getPositionSection(section);
            if (position != null) {
                var idTile = "tile_" + id;
                var div = HUDCRM_UI.getTile(idTile, position, HUDCRM_UI.colors.yellow);
                $(target).append(div);
                $("#" + idTile).click(function () { HUDCRM_UI.clickTileHandler(name, type) });
            }
            if (typeof section.controls != 'undefined' && section.controls != null) {
                for (var i = 0; i < section.controls.length; i++) {
                    var control = section.controls[i];
                    HUDCRM_UI.setControlUi(control, false);
                }
            }
        } catch (e) {
            console.error(e);
        }

    },
    setControlUi: function (control, isheader) {
        try {
            var type = HUDCRM_UI.typesUiTiles.control;
            var target = HUDCRM_CORE.getTargetDivForTiles(isheader);
            var id = HUDCRM_UI.getIdForUi(control.name, type);
            var name = control.name;
            var position = HUDCRM_UI.getPositionControl(control);
            if (position != null) {
                var idTile = "tile_" + id;
                var div = HUDCRM_UI.getTile(idTile, position, HUDCRM_UI.colors.red);
                $(target).append(div);
                $("#" + idTile).click(function () { HUDCRM_UI.clickTileHandler(name, type) });
            }
        } catch (e) {
            console.error(e);
        }
    },
    updateVisibilityUi: function (repeat) {
        try {
            var visible = HUDCRM_UI.isVisible();
            var tree = HUDCRM_UI.tree;
            for (var i = 0; i < tree.tabs.length; i++) {
                var tab = tree.tabs[i];
                HUDCRM_UI.updateVisibilityTabUi(tab, visible);
            }
            for (var i = 0; i < tree.controls.length; i++) {
                var control = tree.controls[i];
                HUDCRM_UI.updateVisibilityControlUi(control, visible);
            }
        } catch (e) {
            console.error(e);
        }
        if (repeat) {
            setTimeout(HUDCRM_UI.updateVisibilityUi, 500, true);
        }
    },
    hideTile: function (id) {
        $('#' + id).css('visibility', 'hidden');
    },
    showTile: function (id) {
        $('#' + id).css('visibility', 'visible');
    },
    updateVisibilityTabUi: function (tab, visible) {
        //TODO
        var type = HUDCRM_UI.typesUiTiles.tab;
        var id = HUDCRM_UI.getIdForUi(tab.name, type);
        var idTile = "tile_" + id;

        if (!visible) {
            HUDCRM_UI.hideTile(idTile);
        } else {
            if (tab.visibleHud) {
                HUDCRM_UI.showTile(idTile);
            } else {
                HUDCRM_UI.hideTile(idTile);
            }
        }
        if (typeof tab.sections != 'undefined' && tab.sections != null) {
            for (var i = 0; i < tab.sections.length; i++) {
                var section = tab.sections[i];
                HUDCRM_UI.updateVisibilitySectionUi(section, visible);
            }
        }
    },
    updateVisibilitySectionUi: function (section, visible) {
        var type = HUDCRM_UI.typesUiTiles.section;
        var id = HUDCRM_UI.getIdForUi(section.name, type);
        var idTile = "tile_" + id;
        if (!visible) {
            HUDCRM_UI.hideTile(idTile);
        } else {
            if (section.visibleHud) {
                HUDCRM_UI.showTile(idTile);
            } else {
                HUDCRM_UI.hideTile(idTile);
            }
        }
        if (typeof section.controls != 'undefined' && section.controls != null) {
            for (var i = 0; i < section.controls.length; i++) {
                var control = section.controls[i];
                HUDCRM_UI.updateVisibilityControlUi(control, visible);
            }
        }

    },
    updateVisibilityControlUi: function (control, visible) {
        var type = HUDCRM_UI.typesUiTiles.control;
        var id = HUDCRM_UI.getIdForUi(control.name, type);
        var idTile = "tile_" + id;
        if (!visible) {
            HUDCRM_UI.hideTile(idTile);
        } else {
            if (control.visibleHud) {
                HUDCRM_UI.showTile(idTile);
            } else {
                HUDCRM_UI.hideTile(idTile);
            }
        }

    },
    updatePositionUi: function (repeat) {
        try {
            var tree = HUDCRM_UI.tree;
            for (var i = 0; i < tree.tabs.length; i++) {
                var tab = tree.tabs[i];
                HUDCRM_UI.updatePositionTabUi(tab);
            }
            for (var i = 0; i < tree.controls.length; i++) {
                var control = tree.controls[i];
                HUDCRM_UI.updatePositionControlUi(control, true);
            }
        } catch (e) {
            console.error(e);
        }
        if (repeat) {
            setTimeout(HUDCRM_UI.updatePositionUi, 500, true);
        }
    },
    updatePositionTabUi: function (tab) {
        var position = HUDCRM_UI.getPositionTab(tab);
        var type = HUDCRM_UI.typesUiTiles.tab;
        var id = HUDCRM_UI.getIdForUi(tab.name, type);
        if (position != null) {
            var idTile = "tile_" + id;
            $("#" + idTile).css({ top: position.top, left: position.left });
        }
        if (typeof tab.sections != 'undefined' && tab.sections != null) {
            for (var i = 0; i < tab.sections.length; i++) {
                var section = tab.sections[i];
                HUDCRM_UI.updatePositionSectionUi(section);
            }
        }
    },
    updatePositionSectionUi: function (section) {
        var position = HUDCRM_UI.getPositionSection(section);
        var type = HUDCRM_UI.typesUiTiles.section;
        var id = HUDCRM_UI.getIdForUi(section.name, type);
        if (position != null) {
            var idTile = "tile_" + id;
            $("#" + idTile).css({ top: position.top, left: position.left });
        }
        if (typeof section.controls != 'undefined' && section.controls != null) {
            for (var i = 0; i < section.controls.length; i++) {
                var control = section.controls[i];
                HUDCRM_UI.updatePositionControlUi(control, false);
            }
        }
    },
    updatePositionControlUi: function (control, isheader) {
        var position = HUDCRM_UI.getPositionControl(control, isheader);
        var type = HUDCRM_UI.typesUiTiles.control;
        var id = HUDCRM_UI.getIdForUi(control.name, type);
        if (position != null) {
            var idTile = "tile_" + id;
            $("#" + idTile).css({ top: position.top, left: position.left });
        }
    },
    clickTileHandler: function (nameTile, type) {
        HUDCRM_INTER.apply(function () { HUDCRM_INTER.controller.clickOnTile(nameTile, type); });
    },
    appendDiv: function (divParent, innerHtml) {
        var div = document.createElement('div');
        div.innerHTML = innerHtml;
        document.getElementById(divParent).appendChild(div);
    },
    preppendDiv: function (divParent, innerHtml) {
        var div = document.createElement('div');
        div.innerHTML = innerHtml;
        var parent = document.getElementById(divParent);
        var version = HUDCRM_CORE.getApplicationVersion();
        var fistChild = document.getElementById(divParent).firstChild;
        document.getElementById(divParent).insertBefore(div, fistChild);


    },
    getIdForUi: function (idCrm, type) {
        if (idCrm == null) {
            return "";
        }
        return type + "_" + idCrm.replace(/-/g, "").replace(/{/g, "").replace(/}/g, "").split(" ").join("_");
    },
    getPositionControl: function (control, isheader) {
        var version = HUDCRM_CORE.getApplicationVersion();
        var position = null;
        if (typeof isheader == 'undefined') {
            isheader = false;
        }
        if (!isheader) {
            if (control.type == HUDCRM_UI.controlType.memo ||
                control.type == HUDCRM_UI.controlType.webresource ||
                control.type == HUDCRM_UI.controlType.iframe) {
                position = $('#' + control.name).position();

            } else if (control.type == HUDCRM_UI.controlType.subgrid) {
                position = $('#' + control.name + '_d').position();
            } else {
                position = $('#' + control.name + '_c').position();
            }
            if (typeof (position) == 'undefined') {
                position = null;
            } else {
                position.left -= HUDCRM_CORE.getCorrectionLeftControls();
                if (version == 5) {
                    position.top = position.top + HUDCRM_UI.getScrollVariationVersion5();
                }
            }
        } else {
            var literalHeaderProcessControl = "header_process";
            var literalHeaderControl = "header";
            var positionOff = $('#' + control.name + '_c').offset();
            var position_c = $('#' + control.name + '_c').position();
            if (control.name.substr(0, literalHeaderProcessControl.length) == literalHeaderProcessControl) {
                if (typeof (position_c) != 'undefined' && typeof (positionOff) != 'undefined') {
                    position = { left: position_c.left - HUDCRM_CORE.getCorrectionLeftControls(), top: positionOff.top }
                }
            } else if (control.name.substr(0, literalHeaderControl.length) == literalHeaderControl) {
                if (typeof (position_c) != 'undefined' && typeof (positionOff) != 'undefined') {
                    position = { left: positionOff.left - HUDCRM_CORE.getCorrectionLeftControls(), top: positionOff.top }
                }
            } else {
                if (typeof (position_c) != 'undefined') {
                    position = { left: position_c.left - HUDCRM_CORE.getCorrectionLeftControls(), top: position_c.top }
                }
            }
        }
        return position;
    },
    getPositionSection: function (section) {
        var version = HUDCRM_CORE.getApplicationVersion();
        var position = null;
        if (version == 5) {
            try {
                position = $('#' + section.idDiv).position();
                position.top = position.top + HUDCRM_UI.getScrollVariationVersion5();
            } catch (e) {
                position = null;
            }

        } else {
            position = $('table[name="' + section.name + '"]').position();
        }
        if (typeof (position) == 'undefined') {
            position = null;
        }
        return position;
    },
    getPositionTab: function (tab) {
        var version = HUDCRM_CORE.getApplicationVersion();
        var position = null;
        if (version == 5) {
            position = $('#' + tab.idDiv).position();
            position.top = position.top + HUDCRM_UI.getScrollVariationVersion5();
        } else {
            position = $('div[name="' + tab.name + '"]').position();
        }
        if (typeof (position) == 'undefined') {
            position = null;
        }
        return position;
    },
    getScrollVariationVersion5: function () {
        return $('#formBodyContainer').scrollTop();
    },
    getTile: function (id, position, color) {
        var $div = jQuery('<div/>', {
            id: id,
            text: '',
        });
        $div.html("<a href='#'><span class='label label-" + color + "'>*</span></a>");
        $div.css('border-radius', '50%');
        $div.css('left', position.left + 'px');
        $div.css('top', position.top + 'px');
        $div.css('position', 'absolute');   //2015-2016
        return $div;
    },
    setVisibilityControl: function (name, type, visible) {
        HUDCRM_XRM.setVisibleControl(type, name, visible);
    },
    setDisabledControl: function (name, type, enabled) {
        HUDCRM_XRM.setDisableControl(type, name, enabled);
    },
    setRequiredControl: function (name, type, required) {
        HUDCRM_XRM.setRequiredControl(type, name, required);
    },
    setAllVisible: function () {

    }
}
var HUDCRM_CORE = {
    versionCRM: null,
    targetDivForTiles: null,
    targetDivForMainMenu: null,
    formType: null,
    formSelector: Array(),
    isForm: true,
    isGrid: true,
    isDashboard: true,
    getFormSelector: function () {
        if (HUDCRM_CORE.formSelector.length > 0) {
            return HUDCRM_CORE.formSelector;
        }
        HUDCRM_CORE.formSelector = HUDCRM_XRM.getFormSelector();
        return HUDCRM_CORE.formSelector;
    },
    getFormType: function () {
        if (HUDCRM_CORE.formType != null) {
            return HUDCRM_CORE.formType;
        }
        HUDCRM_CORE.formType = HUDCRM_XRM.getFormType();
        return HUDCRM_CORE.formType;
    },
    getFormTypeString: function () {
        var type = HUDCRM_CORE.getFormType();
        var strFormType__;
        if (type == 0) {
            strFormType__ = "Undefined";
        } else if (type == 1) {
            strFormType__ = "Create";
        } else if (type == 2) {
            strFormType__ = "Update";
        } else if (type == 3) {
            strFormType__ = "Read Only";
        } else if (type == 4) {
            strFormType__ = "Disabled";
        } else if (type == 5) {
            strFormType__ = "Quick Create";
        } else if (type == 6) {
            strFormType__ = "Bulk Edit";
        } else if (type == 11) {
            strFormType__ = "Read Optimized";
        } else {
            strFormType__ = "Undefined";
        }
        return strFormType__;
    },
    getApplicationVersion: function () {
        if (HUDCRM_CORE.versionCRM != null) {
            return HUDCRM_CORE.versionCRM;
        }
        var versionCRM__ = APPLICATION_VERSION;
        versionCRM__ = parseFloat(versionCRM__);
        HUDCRM_CORE.versionCRM = versionCRM__;
        return HUDCRM_CORE.versionCRM;
    },
    getCorrectionLeftControls: function () {
        var version = HUDCRM_CORE.getApplicationVersion();
        if (version < 8) {
            return 6;
        } else if (version >= 8) {
            return 18;
        }
        return 18;
    },
    getTargetDivForTiles: function (isheader) {

        var version = HUDCRM_CORE.getApplicationVersion();
        if (isheader) {
            HUDCRM_CORE.targetDivForTiles = "#formHeaderContainer";
        } else {
            if (version == 5) {
                HUDCRM_CORE.targetDivForTiles = "#crmFormTabContainer";
            } else {
                HUDCRM_CORE.targetDivForTiles = "#formBodyContainer";
            }
        }
        return HUDCRM_CORE.targetDivForTiles;
    },
    getTargetDivForMainMenu: function () {
        HUDCRM_CORE.isForm = true;
        HUDCRM_CORE.isGrid = false;
        HUDCRM_CORE.isDashboard = false;
        if (HUDCRM_CORE.targetDivForMainMenu != null) {
            return HUDCRM_CORE.targetDivForMainMenu;
        }
        var version = HUDCRM_CORE.getApplicationVersion();
        if (version == 5) {
            HUDCRM_CORE.targetDivForMainMenu = "formHeaderContainer";
        } else {
            HUDCRM_CORE.targetDivForMainMenu = "formContainer";
        }

        var element = document.getElementById(HUDCRM_CORE.targetDivForMainMenu);
        if (element == null && version >= 9) {
            HUDCRM_CORE.isForm = false;
            HUDCRM_CORE.targetDivForMainMenu = "stdTable";

            HUDCRM_CORE.isForm = false;
            HUDCRM_CORE.isGrid = true;
            HUDCRM_CORE.isDashboard = false;
        }

        var element = document.getElementById(HUDCRM_CORE.targetDivForMainMenu);
        if (element == null && version >= 9) {
            HUDCRM_CORE.isForm = false;
            HUDCRM_CORE.targetDivForMainMenu = "mainContainer";
            HUDCRM_CORE.isForm = false;
            HUDCRM_CORE.isGrid = false;
            HUDCRM_CORE.isDashboard = true;
        }

        var element = document.getElementById(HUDCRM_CORE.targetDivForMainMenu);
        if (element == null && version >= 9) {
            alert("Cannot load HUDCRM Dynamics menu in this page. Please, try again in a form, grid or dashboard!");
        }

        return HUDCRM_CORE.targetDivForMainMenu;
    },
    getEntityProperties: function () {
        var prop = null;
        if (HUDCRM_CORE.isForm) {
            var ver = HUDCRM_CORE.getApplicationVersion();
            prop = HUDCRM_XRM.getEntityProperties(ver);
            var formType = HUDCRM_CORE.getFormType();
            var formTypeStr = HUDCRM_CORE.getFormTypeString();
            prop["formType"] = formTypeStr + " [" + formType + "]";
        }
        //TODO: async request to: PrimaryIdAttribute, PrimaryNameAttribute, ObjectTypeCode, IsCustomEntity, SchemaName
        return prop;
    }
}
var checkFilesBeforeLoad = ["Loaded_REFEREDVAR_JQuery", "Loaded_REFEREDVAR_HUDCRMCommonFunctions", "Loaded_REFEREDVAR_HUDCRMXrm", "Loaded_REFEREDVAR_Angular", "Loaded_REFEREDVAR_BootStrapJS",
    "Loaded_REFEREDVAR_AngularAnimate", "Loaded_REFEREDVAR_AngularRoute", "Loaded_REFEREDVAR_AngularAria", "Loaded_REFEREDVAR_AngularMessages", "Loaded_REFEREDVAR_AngularSvgAssets",
    "Loaded_REFEREDVAR_AngularMaterial"];
function checkIfLoaded() {

    var loaded = getIfLoadedAllFiles();;
    if (!loaded) {
        setTimeout(checkIfLoaded, 100);
    } else {
        startInitialing();
    }
}
function getIfLoadedAllFiles() {
    try {
        var allLoaded = true;
        for (var i = 0; i < checkFilesBeforeLoad.length; i++) {
            var loaded = getVariableGlobal(checkFilesBeforeLoad[i]);
            allLoaded = !allLoaded ? allLoaded : loaded;
        }
        return allLoaded;
    } catch (e) {
        console.log(e);
    }
}
function getVariableGlobal(name) {
    var value = window[name];
    if (typeof value != 'undefined') {
        if (value == true) {
            return true;
        }
    }
    return false;
}
checkIfLoaded();