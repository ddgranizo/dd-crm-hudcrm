

chrome.extension.onMessage.addListener(function (msg, sender, sendResponse) {
    if (msg.action == 'loadHUDCRM') {
        includesDependencies();
        execute();
    }
});



var SecondLevelFiles = [
    { name: "REFEREDVAR_JQuery", filename: "thirds/jquery-2.1.3.js", type: "js", apply: "form" },

    { name: "REFEREDVAR_HUDCRMCommonFunctions", filename: "HUDCRMCommonFunctions.js", type: "js", apply: "form" },
    { name: "REFEREDVAR_HUDCRMXrm", filename: "HUDCRMXrm.js", type: "js", apply: "form" }, //Must be after commonfunctions
    { name: "REFEREDVAR_HUDCRMSoap", filename: "HUDCRMSoap.js", type: "js", apply: "form" },
    { name: "REFEREDVAR_HUDCRMCodemirror", filename: "HUDCRMCodemirror.js", type: "js", apply: "form" },


    { name: "REFEREDVAR_LibBeautify", filename: "thirds/libsBeautify.js", type: "js", apply: "form" },
    { name: "REFEREDVAR_LibBeautifyUnpacker", filename: "thirds/libBeautifyUnpacker.js", type: "js", apply: "form" },
    { name: "REFEREDVAR_LibCodeMirror", filename: "thirds/libsCodeMirror.js", type: "js", apply: "form" },
    { name: "REFEREDVAR_CodemirrorCSS", filename: "thirds/codemirror.css", type: "css", apply: "form" },

    { name: "REFEREDVAR_Angular", filename: "thirds/angular.min.js", type: "js", apply: "form" },
    { name: "REFEREDVAR_AngularAnimate", filename: "thirds/angular_animate.min.js", type: "js", apply: "form" },
    { name: "REFEREDVAR_AngularAria", filename: "thirds/angular_aria.min.js", type: "js", apply: "form" },
    { name: "REFEREDVAR_AngularMaterial", filename: "thirds/angular_material.js", type: "js", apply: "form" },
    { name: "REFEREDVAR_AngularMessages", filename: "thirds/angular_messages.min.js", type: "js", apply: "form" },
    { name: "REFEREDVAR_AngularRoute", filename: "thirds/angular_route.min.js", type: "js", apply: "form" },
    { name: "REFEREDVAR_AngularSvgAssets", filename: "thirds/svg_assets_cache.js", type: "js", apply: "form" },
    { name: "REFEREDVAR_AngularMaterialCSS", filename: "thirds/angular_material.min.css", type: "css", apply: "form" },
    { name: "REFEREDVAR_DocsMaterialCSS", filename: "thirds/docs.material.css", type: "css", apply: "form" },

    { name: "REFEREDVAR_Moments", filename: "thirds/moment.js", type: "js", apply: "form" },
    { name: "REFEREDVAR_MDDatetime", filename: "thirds/mdDatetime.js", type: "js", apply: "form" },
    { name: "REFEREDVAR_MDDatetimeCSS", filename: "thirds/mdDatetimeStyle.css", type: "css", apply: "form" },

    { name: "REFEREDVAR_BootStrapCSS", filename: "thirds/bootstrap.min.css", type:"css", apply : "form" },
    { name: "REFEREDVAR_BootStrapJS", filename: "thirds/bootstrap.min.js", type: "js", apply: "form" },
    { name: "REFEREDVAR_DocsCSS", filename: "thirds/docs.min.css", type: "css", apply: "form" },

    { name: "REFEREDVAR_HUDCRMstyleCSS", filename: "style/HUDCRMstyle.css", type: "css", apply: "form" },

    //templates. Only referenced by a variable but not injected

    { name: "REFEREDVAR_SDKRest", filename: "thirds/SDK.REST.js", type: "js", apply: "form" },
    { name: "REFEREDVAR_JSON", filename: "thirds/json2.js", type: "js", apply: "form" },

    { name: "REFEREDVAR_Core", filename: "HUDCRMManager.js", type: "js", apply: "form" },


];

var firstLevelIncluded = false;
var urlLastHudLoaded = "";

function includesDependencies() {
    if (firstLevelIncluded) {
        return;
    }

    appendScriptChildFile("thirds/angular.js");
    appendScriptChildFile("HUDCRMLoader.js");

    var txtVarsRefers = "";
    for (var i = 0; i < SecondLevelFiles.length; i++) {
        txtVarsRefers += getLiteralVar(SecondLevelFiles[i].name, SecondLevelFiles[i].filename);
    }
    appendScriptChildText(txtVarsRefers);
    
    firstLevelIncluded = true;

}

function appendScriptChildText(text) {
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.text = text
    document.body.appendChild(script);
}
function appendScriptChildFile(filename) {
    var url = chrome.extension.getURL(filename);
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = url;
    document.body.appendChild(script);
}
function getLiteralVar(name, filename) {
    return 'var ' + name + ' = "' + chrome.extension.getURL(filename) + '";';
}
function execute() {
    appendScriptChildText("window.setTimeout('HUDCRM_LOADER.checkWhere();', 500); ");
}
