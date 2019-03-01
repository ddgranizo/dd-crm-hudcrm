
var globalASD = Array();
var HUDCRM_XRM = {
    stringNoLabel: "[NOLABEL]",
    controlsInTabs: Array(),
    webResources: Array(),
    getAllAttributes: function () {

        var attributes = Xrm.Page.data.entity.attributes.$3_1.$1_0;
        return attributes;
    },

    getFormType: function () {

        return Xrm.Page.ui.getFormType();
    },

    getFormSelector: function () {
        var formsAr = Array();
        var forms = Xrm.Page.ui.formSelector.items.get();
        for (var i = 0; i < forms.length; i++) {
            var output = new Object();
            output.label = forms[i].getLabel();
            output.id = forms[i].getId();
            formsAr.push(output);
        }
        return formsAr;
    },
    getEntityProperties: function (__ver) {
        try {
            var output = new Object();
            var id = Xrm.Page.data.entity.getId();
            if (id != null) {
                id = id.replace(/{/g, '').replace(/}/g, '');
            }
            output.id = id;
            output.name = Xrm.Page.data.entity.getEntityName();
            if (__ver == 5) {

            } else {
                output.primaryField = Xrm.Page.data.entity.getPrimaryAttributeValue();
            }
            return output;
        } catch (e) {
            console.error(e);
        }
        return null;
        
    },
    getAttributes: function (__ver) {
        
        var attributesArr = Xrm.Page.data.entity.attributes.get();
        var output = [];

    
        for (var i = 0; i < attributesArr.length; i++) {
            var b = new Object();
            b.type = attributesArr[i].getAttributeType();
            b.format = attributesArr[i].getFormat();
            if (b.type == 'string' || b.type == 'memo') {
                b.maxlength = attributesArr[i].getMaxLength();
            } else {
                b.maxlength = null;
            }
            b.name = attributesArr[i].getName();
            b.userprivilege = attributesArr[i].getUserPrivilege();
            b.value = attributesArr[i].getValue();
            b.required = attributesArr[i].getRequiredLevel();
            if (__ver == 5) {
                //2011
                if (b.type == 'optionset') {
                    b.options = HUDCRM_XRM.getOptions(attributesArr[i], __ver);
                    b.initialvalue = attributesArr[i].getInitialValue();
                }
            } else {
                //2016 2015 (boolean in 2011 doesn't admit getOptions()
                if (b.type == 'optionset' || b.type == 'boolean') {
                    b.options = HUDCRM_XRM.getOptions(attributesArr[i], __ver);
                    b.initialvalue = attributesArr[i].getInitialValue();
                }
            }
            if (b.type == "lookup") {
                var value = attributesArr[i].getValue();
                if (value != null) {
                    b.value = HUDCRM_XRM.getLookup(value[0], __ver);
                }
            }
        
            output.push(b);
            
        }
        return output;
    },
    getLookup: function(__attribute, __ver) {
        var o = Object();
        try {
            o.type = __attribute.type;
            if (__ver == 8.2) {
                o.typename = __attribute.entityType;
            } else {
                o.typename = __attribute.entityType;
            }

            o.id = __attribute.id.replace(/{/g, "").replace(/}/g, "");
            return o;
        } catch (e) {
            return { "typename":"Error", "id": "Error" };
        }
        
    },
    getOptions: function (__attribute, __ver) {
        var optionsArr = __attribute.getOptions();

        var options = [];
        for (var i = 0; i < optionsArr.length; i++) {
            var b = new Object();
            b.value = optionsArr[i].value;
            b.text = optionsArr[i].text;
            options.push(b);
        }
        return options;
    },
    getTree: function (__ver) {
        
        var output = new Object();
        var tabs = [];
        var tabsArr = Xrm.Page.ui.tabs.get();
        
        for (var i = 0; i < tabsArr.length; i++) {
            tabs.push(HUDCRM_XRM.getTabs(tabsArr[i], __ver));
        };
        
        var controlsArr = Xrm.Page.ui.controls.get();
        var controls = [];
        for (var i = 0; i < controlsArr.length; i++) {
            if (!HUDCRM_XRM.checkIfControlAlreadyInTree(controlsArr[i].getName()) && controlsArr[i].getName().indexOf('Link') < 0) {
                controls.push(HUDCRM_XRM.getControl(controlsArr[i], true, true));
            }
        }
        output.controls = controls;
        output.tabs = tabs;
        return output;
    },
    checkIfControlAlreadyInTree: function (__name) {
        for (var i = 0; i < HUDCRM_XRM.controlsInTabs.length; i++) {
            if (HUDCRM_XRM.controlsInTabs[i].name == __name) {
                return true;
            }
        }
        return false;
    },
    getTabs: function (__tab, __ver) {

        var b = new Object();
        if (__ver == 5) {
            b.id = HUDCRM_COMMONFUNCTIONS.getNewGuid(true);
            b.idDiv = __tab._control._element.id;
        } else {
            b.id = __tab.getKey();
        }
        b.visible = __tab.getVisible();
        b.state = __tab.getDisplayState();
        b.name = __tab.getName();

        b.label = __tab.getLabel();
        if (b.label == "" || typeof (b.label) == 'undefined') {
            b.label = HUDCRM_XRM.stringNoLabel;
        }
        b.visibleHud = b.visible;
        b.errorShowed = false;

        var sections = [];
        var sectionsArr = __tab.sections.get();
        for (var i = 0; i < sectionsArr.length; i++) {
            sections.push(HUDCRM_XRM.getSection(sectionsArr[i], b.visibleHud, __ver));
        }
        b.sections = sections;
        return b;
    },
    globalVar: null,
    getSection: function (__section, __visibleHudTab, __ver) {
       
        var b = new Object();
        if (__ver == 5) {
            b.idDiv = __section._control._element.id;
        } 
        b.visible = __section.getVisible();
        if (typeof (__section.getName()) == 'undefined' || __section.getName() == null) {
            if (__ver == 5) {
                b.name = __section._control.$1U_4;
            } else if (__ver == 8 || __ver == 8.1) {
                b.name = __section.$1_2.$q_2;
            } else if (__ver == 8.2) {
                b.name = __section.$0_2.$t_2;
            } else {
                b.name = "[NONAME]";
            }
        } else {
            b.name = __section.getName();
        }
        
        b.label = __section.getLabel();
        if (b.label == "" || typeof (b.label) == 'undefined') {
            b.label = HUDCRM_XRM.stringNoLabel;
        }
        b.errorShowed = false;
        if (__visibleHudTab == true) {
            b.visibleHud = b.visible;
        } else {
            b.visibleHud = false;
        }
        
        var controls = [];
        var controlsArr = __section.controls.get();
        for (var i = 0; i < controlsArr.length; i++) {
            controls.push(HUDCRM_XRM.getControl(controlsArr[i], b.visibleHud, false));
        }
        b.controls = controls;
        
        return b;
    },

    getControl: function (__control, __visibleHudSection, __isInHeader) {
        var b = new Object();
        
        b.visible = __control.getVisible();
        
        if (__isInHeader) {
            if (__control.getName().substr(0, 7) == "header_") {
                b.nameHeader = __control.getName().substr(7);
            } else if (__control.getName().substr(0, 7) == "footer_") {
                b.nameHeader = __control.getName().substr(7);
            }else{
                b.nameHeader = __control.getName();
            }
        } else {
            b.nameHeader = __control.getName();
        }
        b.name = __control.getName();
        
        b.label = __control.getLabel();
        if (b.label == "" || typeof (b.label) == 'undefined') {
            b.label = HUDCRM_XRM.stringNoLabel;
        }
        b.errorShowed = false;
        var found = false;
        for (var j = 0; j < HUDCRM_UI.attributes.length; j++) {
            var name = b.name;
            if (__isInHeader) {
                name = b.nameHeader;
            }
            if (HUDCRM_UI.attributes[j].name == name) {
                b.type = HUDCRM_UI.attributes[j].type;
                found = true;
                if (b.type == 'optionset' || b.type == 'boolean') {
                    b.options = HUDCRM_UI.attributes[j].options;
                }
                if (b.type == 'memo' || b.type == 'string') {
                    b.maxlength = HUDCRM_UI.attributes[j].maxlength;
                }
                if (b.type == "lookup") {
                    b.value = HUDCRM_UI.attributes[j].value;
                }
                b.required = HUDCRM_UI.attributes[j].required;
                break;
            }  
        }
    
  
        if (!found) {
            b.type = __control.getControlType();
        }
        

        if (__visibleHudSection == true) {
            b.visibleHud = b.visible;
        } else {
            b.visibleHud = false;
        }

        if (b.type != "subgrid" && b.type != 'kbsearch' && b.type != "webresource" && b.type != "iframe") {
            b.disabled = __control.getDisabled();
        } else {
            b.disabled = false;
            
        }
        if (b.type == "subgrid") {
        }

        if (b.type == "webresource") {

            b.src = decodeURIComponent(__control.getSrc());
            b.nameWR = HUDCRM_XRM.getNameWR(b.src);
            b.inUi = true;
            if (!HUDCRM_XRM.getIfAlreadyWebResource(b.name)) {
                HUDCRM_XRM.webResources.push(b);
            }
        }
        if (b.type == "iframe") {
            b.src = decodeURIComponent(__control.getSrc());
        }
        HUDCRM_XRM.controlsInTabs.push(b);
        return b;
    },

    getNameWR: function (__src) {
        var word = "WebResources";
        var pos = __src.indexOf(word);
        if (pos >= 0) {
            var name = __src.substr(pos + word.length + 1);
            var posParam = name.indexOf("?");
            if (posParam>=0) {
                name = name.substr(0, posParam);
            }
            return name;
        }
        return "ERR";
    },

    getIfAlreadyWebResource: function (__name) {
        for (var i = 0; i < HUDCRM_XRM.webResources.length; i++) {
            if (HUDCRM_XRM.webResources[i].name == __name) {
                return true;
            }  
        }
        return false;
    },
    getVisible: function (__type, __name) {
        if (__type == "control") {
            return Xrm.Page.getControl(__name).getVisible();
        } else if (__type == "section") {
            var tabsArr = Xrm.Page.ui.tabs.get();
            for (var i = 0; i < tabsArr.length; i++) {
                var sectionsArr = tabsArr[i].sections.get();
                for (var j = 0; j < sectionsArr.length; j++) {
                    if (sectionsArr[j].getName() == __name) {
                        return sectionsArr[j].getVisible();
                    }
                }
            }
        }
        else if (__type == "tab") {
            var tabsArr = Xrm.Page.ui.tabs.get();
            for (var i = 0; i < tabsArr.length; i++) {
                if (tabsArr[i].getName() == __name) {
                    return tabsArr[i].getVisible();
                }
            };
        }
    }, 
    getStateTab: function (__name) {
    
        var tabsArr = Xrm.Page.ui.tabs.get();
        for (var i = 0; i < tabsArr.length; i++) {
            if (tabsArr[i].getName() == __name) {
                return tabsArr[i].getDisplayState();
            }
        };
    },
    getDisabledControl: function (__name) {
        return Xrm.Page.getControl(__name).getDisabled();
    },
    setRequiredControl: function (__type, __name, __required) {
        if (__type == "control") {
            try {
                Xrm.Page.getAttribute(__name).setRequiredLevel(__required);
            } catch (e) {
                console.log("error setting required " + __name);
            }

        }
    },
    setDisableControl: function (__type, __name, __disable) {
        if (__type == "control") {
            try {
                Xrm.Page.getControl(__name).setDisabled(__disable);
            } catch (e) {
                console.log("error setting disabled " + __name);
            }
            
        } 
    },
    setVisibleControl: function (__type, __name, __visible) {
        if (__type == "control") {
            Xrm.Page.getControl(__name).setVisible(__visible);
        } else if (__type == "section") {
            var tabsArr = Xrm.Page.ui.tabs.get();
            for (var i = 0; i < tabsArr.length; i++) {
                var sectionsArr = tabsArr[i].sections.get();
                for (var j = 0; j < sectionsArr.length; j++) {
                    if (sectionsArr[j].getName() == __name) {
                        sectionsArr[j].setVisible(__visible);
                        return;
                    }
                }
            }
        }
        else if (__type == "tab") {
            var tabsArr = Xrm.Page.ui.tabs.get();
            for (var i = 0; i < tabsArr.length; i++) {
                if (tabsArr[i].getName() == __name) {
                    tabsArr[i].setVisible(__visible);
                    return;
                }
            };
        }
   
    }
};


var Loaded_REFEREDVAR_HUDCRMXrm = true;
