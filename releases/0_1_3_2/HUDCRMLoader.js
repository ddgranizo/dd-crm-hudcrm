
var SecondLevelFiles = [ //This is the real order of inject.
    {order:1, name: "REFEREDVAR_JQuery", filename: "thirds/jquery-2.1.3.js", type: "js", apply: "form", dependencies: [] },
    {order: 17,  name: "REFEREDVAR_SDKRest", filename: "thirds/SDK.REST.js", type: "js", apply: "form", dependencies: [1,18] },
    { order: 18, name: "REFEREDVAR_JSON", filename: "thirds/json2.js", type: "js", apply: "form", dependencies: [1] },

    { order: 2, name: "REFEREDVAR_HUDCRMCommonFunctions", filename: "HUDCRMCommonFunctions.js", type: "js", apply: "form", dependencies: [1]  },
    { order: 3, name: "REFEREDVAR_HUDCRMXrm", filename: "HUDCRMXrm.js", type: "js", apply: "form", dependencies: [1,2]  },
    { order: 19, name: "REFEREDVAR_HUDCRMSoap", filename: "HUDCRMSoap.js", type: "js", apply: "form", dependencies: [1, 17, 18, 3]  },
    { order: 23, name: "REFEREDVAR_HUDCRMCodemirror", filename: "HUDCRMCodemirror.js", type: "js", apply: "form", dependencies: [1, 17, 18, 3, 20, 21] },


    { order: 20, name: "REFEREDVAR_LibBeautify", filename: "thirds/libsBeautify.js", type: "js", apply: "form", dependencies: [1, 17, 18, 3]  },
    { order: 21, name: "REFEREDVAR_LibBeautifyUnpacker", filename: "thirds/libBeautifyUnpacker.js", type: "js", apply: "form", dependencies: [1, 17, 18, 3] },
    { order: 24, name: "REFEREDVAR_LibCodeMirror", filename: "thirds/libsCodeMirror.js", type: "js", apply: "form", dependencies: [1, 17, 18, 3]  },
    { order: 22, name: "REFEREDVAR_CodemirrorCSS", filename: "thirds/codemirror.css", type: "css", apply: "form", dependencies: []  },

    { order: 4, name: "REFEREDVAR_Angular", filename: "thirds/angular.min.js", type: "js", apply: "form", dependencies: [1,2,3]  },

    { order: 5, name: "REFEREDVAR_BootStrapCSS", filename: "thirds/bootstrap.min.css", type: "css", apply: "form", dependencies: []  },
    { order: 6, name: "REFEREDVAR_BootStrapJS", filename: "thirds/bootstrap.min.js", type: "js", apply: "form", dependencies: [1]  },
    { order: 7, name: "REFEREDVAR_DocsCSS", filename: "thirds/docs.min.css", type: "css", apply: "form", dependencies: []  },

    { order: 8, name: "REFEREDVAR_HUDCRMstyleCSS", filename: "style/HUDCRMstyle.css", type: "css", apply: "form", dependencies: []  },

    { order: 9, name: "REFEREDVAR_AngularAnimate", filename: "thirds/angular_animate.min.js", type: "js", apply: "form", dependencies: [4]  }, 
    { order: 10, name: "REFEREDVAR_AngularRoute", filename: "thirds/angular_route.min.js", type: "js", apply: "form", dependencies: [4]  },
    { order: 11, name: "REFEREDVAR_AngularAria", filename: "thirds/angular_aria.min.js", type: "js", apply: "form", dependencies: [4]  },
    { order: 12, name: "REFEREDVAR_AngularMessages", filename: "thirds/angular_messages.min.js", type: "js", apply: "form", dependencies: [4]  },
    { order: 13, name: "REFEREDVAR_AngularSvgAssets", filename: "thirds/svg_assets_cache.js", type: "js", apply: "form", dependencies: [4]  },
    { order: 14, name: "REFEREDVAR_AngularMaterialCSS", filename: "thirds/angular_material.min.css", type: "css", apply: "form", dependencies: []  },
    { order: 15, name: "REFEREDVAR_AngularMaterial", filename: "thirds/angular_material.js", type: "js", apply: "form", dependencies: [4,9,10,11,12,13,14]  },
    { order: 16, name: "REFEREDVAR_DocsMaterialCSS", filename: "thirds/docs.material.css", type: "css", apply: "form", dependencies: [] },

    { order: 27, name: "REFEREDVAR_Moments", filename: "thirds/moment.js", type: "js", apply: "form", dependencies: [4] },
    { order: 25, name: "REFEREDVAR_MDDatetime", filename: "thirds/mdDatetime.js", type: "js", apply: "form", dependencies: [4] },
    { order: 26, name: "REFEREDVAR_MDDatetimeCSS", filename: "thirds/mdDatetimeStyle.css", type: "css", apply: "form", dependencies: [] },

    { order: 99, name: "REFEREDVAR_Core", filename: "HUDCRMManager.js", type: "js", apply: "form", dependencies: [1,2,3,4,6,9,10,11,12,13,14,15] }, 
   
];
var global = null;
var HUDCRM_LOADER = {
    injected: Array(),
    loopCount: 0,
    lastUrlLoaded : "",
    checkWhere: function () {
        
        var frames__;
        var version__ = HUDCRM_LOADER.getVersion();
        var ver__ = 0;
        if (typeof( version__) != 'undefined') {
            ver__ = version__.split(".")[0];
        }
        
        frames__ = document.getElementsByTagName("iframe");
        global = frames__;
        for (var i = 0; i < frames__.length; ++i) {
            try {
                
                var visibility = frames__[i].style.visibility;
                var display = frames__[i].style.display;
                var type = HUDCRM_LOADER.getTypeWindow(frames__[i]);
                var currentUrl = frames__[i].parentElement.src;

                //console.log(currentUrl);
                //console.log(HUDCRM_LOADER.lastUrlLoaded);
                //console.log(visibility);

                if (ver__ == 5) {
                    //CRM 2011
                    if (display == "inline") {
                        //var currentUrl = $(frames__[i].parentElement).attr('src');
                        if (HUDCRM_LOADER.lastUrlLoaded != currentUrl) {
                            HUDCRM_LOADER.lastUrlLoaded = currentUrl;
                            HUDCRM_LOADER.injectJSV2(frames__[i], visibility, type);
                        }
                    }

                } else {
                    //CRM 2015 and 2016
                    if (visibility == "visible") {
                        //var currentUrl = $(frames__[i].parentElement).attr('src');
                        //if (HUDCRM_LOADER.lastUrlLoaded != currentUrl) {
                        HUDCRM_LOADER.injectJSV2(frames__[i], visibility, type);
                        //}
                    }
                }
            } catch (e) {
                console.log(e);
            }
        }
    },
    getVersion: function(){
        return APPLICATION_VERSION;
    },
    getTypeWindow: function (__frame) {
        try {
            var grid = __frame.contentDocument.getElementById("homepageTableCell");
            if (grid != null && typeof (grid) != 'undefined') {
                return "grid";
            }
            var form = __frame.contentDocument.getElementById("crmForm");
            if (form != null && typeof (form) != 'undefined') {
                return "form";
            }
            var dashboard = __frame.contentDocument.getElementById("mainTable");
            if (dashboard != null && typeof (dashboard) != 'undefined') {
                return "dashboard";
            }
        } catch (e) {
            return null;
        }
    },
    injectJSV2: function (__iframe, __visibility, __type) {
        HUDCRM_LOADER.injected = Array();
        HUDCRM_LOADER.loopCount = 0;
        //console.log(__type);
        HUDCRM_LOADER.injectFormLooper(__iframe);
        //if (__type == "form") {
        //    HUDCRM_LOADER.injectFormLooper(__iframe);
        //} else if (__type == "grid") {
        //    //HUDCRM_LOADER.injectFormLooper(__iframe);
        //} else if (__type == "dashboard") {
        //    //HUDCRM_LOADER.injectFormLooper(__iframe);
        //}

    },
    injectFormLooper: function (__iframe) {
        try {
            if (HUDCRM_LOADER.injected.length == SecondLevelFiles.length) {
                //console.log("");//OK
                return;
            }
            if (HUDCRM_LOADER.loopCount > 250) {
                console.error("Cound't load all files. Injected:");
                console.log(HUDCRM_LOADER.injected);
                return;
            }
            HUDCRM_LOADER.loopCount++;
            for (var i = 0; i < SecondLevelFiles.length; i++) {
                var file = SecondLevelFiles[i];
                //console.log(file);
                var applyArray = file.apply.split('|');
                if (applyArray.indexOf("form") > -1) {
                    var alreadyInjected = HUDCRM_LOADER.checkIfAlreadyInjected(file);
                    if (!alreadyInjected) {
                        if (file.type == "css") {
                            //for css don't check dependencies
                            HUDCRM_LOADER.append(__iframe, HUDCRM_LOADER.getLinkObject(file.name, window[file.name]));
                            HUDCRM_LOADER.injected.push(file.order);
                            //console.log("Injected: " + file.order);
                        } else {
                            var dependenciesAlreadyInjected = HUDCRM_LOADER.checkIfDependenciesAlreadyInjected(__iframe, file);
                            if (dependenciesAlreadyInjected) {
                                HUDCRM_LOADER.append(__iframe, HUDCRM_LOADER.getScriptObject(file.name, window[file.name]));
                                HUDCRM_LOADER.injected.push(file.order);
                                //console.log("Injected: " + file.order);
                            }
                        }
                    }
                }
            }
            setTimeout(HUDCRM_LOADER.injectFormLooper, 20, __iframe);
        } catch (e) {
            console.log(e);
        }
    },
    checkIfAlreadyInjected: function (file) {
        for (var i = 0; i < HUDCRM_LOADER.injected.length; i++) {
            if (HUDCRM_LOADER.injected[i] == file.order) {
                return true;
            }
        }
        return false;
    },
    checkIfDependenciesAlreadyInjected: function (iframe, file) {
        var allIncluded = true;
        for (var i = 0; i < file.dependencies.length; i++) {
            var order = file.dependencies[i];
            var file = HUDCRM_LOADER.getFileData(order);
            var included = false;
            if (file.type == "css") {
                //we do not wait until css is loaded. 
                included = true;
            } else {
                included = iframe.contentWindow["Loaded_" + file.name];
            }
            allIncluded = !allIncluded ? allIncluded : included;
        }
        return allIncluded;
    },
    getFileData: function (order) {
        for (var i = 0; i < SecondLevelFiles.length; i++) {
            var file = SecondLevelFiles[i];
            if (file.order == order) {
                return file;
            }
        }
        return null;
    },
    injectJS: function (__iframe, __visibility, __type) {
        //deprecated
        try {
            if (__type == "form") {
                for (var i = 0; i < SecondLevelFiles.length; i++) {
                    var file = SecondLevelFiles[i];
                    var applyArray = file.apply.split('|');
                    if (applyArray.indexOf("form") > -1) {
                        if (file.type == "js") {
                            HUDCRM_LOADER.append(__iframe, HUDCRM_LOADER.getScriptObject(file.name, window[file.name]));
                        } else if (file.type == "css") {
                            HUDCRM_LOADER.append(__iframe, HUDCRM_LOADER.getLinkObject(file.name, window[file.name]));
                        } 
                    }
                }
            } else if (__type == "grid") {
                console.log("GRID");
            }
        } catch (e) {
            console.log(e);
        }
       
    },
    injectJsFile: function () {
    },
    append: function (__iframe, __obj) {
        try {
            __iframe.contentDocument.body.appendChild(__obj);
        } catch (e) {
            console.log(e);
        }
        
    },
    getLinkObject: function (__id, __src) {
        var cssLink = document.createElement("link");
        cssLink.href = __src;
        cssLink.id = __id;
        cssLink.rel = "stylesheet";
        cssLink.type = "text/css";
        return cssLink;
    }, 

    getScriptObject: function (__id, __src) {
        var script = document.createElement('script');
        script.type = 'text/javascript';
        script.id = __id;
        script.src = __src;

        return script;
    },
    getScriptObjectFromText: function (__id, __text) {
        var script = document.createElement('script');
        script.type = 'text/javascript';
        script.id = __id;
        script.text = __text;
        return script;
    }
};


