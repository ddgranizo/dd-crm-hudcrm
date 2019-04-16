

var HUDCRM_COMMONFUNCTIONS = {

    xml2json: function (xml, tab) {
        var X = {
            toObj: function (xml) {
                var o = {};
                if (xml.nodeType == 1) {   // element node ..
                    if (xml.attributes.length)   // element with attributes  ..
                        for (var i = 0; i < xml.attributes.length; i++)
                            o["@" + xml.attributes[i].nodeName] = (xml.attributes[i].nodeValue || "").toString();
                    if (xml.firstChild) { // element has child nodes ..
                        var textChild = 0, cdataChild = 0, hasElementChild = false;
                        for (var n = xml.firstChild; n; n = n.nextSibling) {
                            if (n.nodeType == 1) hasElementChild = true;
                            else if (n.nodeType == 3 && n.nodeValue.match(/[^ \f\n\r\t\v]/)) textChild++; // non-whitespace text
                            else if (n.nodeType == 4) cdataChild++; // cdata section node
                        }
                        if (hasElementChild) {
                            if (textChild < 2 && cdataChild < 2) { // structured element with evtl. a single text or/and cdata node ..
                                X.removeWhite(xml);
                                for (var n = xml.firstChild; n; n = n.nextSibling) {
                                    if (n.nodeType == 3)  // text node
                                        o["#text"] = X.escape(n.nodeValue);
                                    else if (n.nodeType == 4)  // cdata node
                                        o["#cdata"] = X.escape(n.nodeValue);
                                    else if (o[n.nodeName]) {  // multiple occurence of element ..
                                        if (o[n.nodeName] instanceof Array)
                                            o[n.nodeName][o[n.nodeName].length] = X.toObj(n);
                                        else
                                            o[n.nodeName] = [o[n.nodeName], X.toObj(n)];
                                    }
                                    else  // first occurence of element..
                                        o[n.nodeName] = X.toObj(n);
                                }
                            }
                            else { // mixed content
                                if (!xml.attributes.length)
                                    o = X.escape(X.innerXml(xml));
                                else
                                    o["#text"] = X.escape(X.innerXml(xml));
                            }
                        }
                        else if (textChild) { // pure text
                            if (!xml.attributes.length)
                                o = X.escape(X.innerXml(xml));
                            else
                                o["#text"] = X.escape(X.innerXml(xml));
                        }
                        else if (cdataChild) { // cdata
                            if (cdataChild > 1)
                                o = X.escape(X.innerXml(xml));
                            else
                                for (var n = xml.firstChild; n; n = n.nextSibling)
                                    o["#cdata"] = X.escape(n.nodeValue);
                        }
                    }
                    if (!xml.attributes.length && !xml.firstChild) o = null;
                }
                else if (xml.nodeType == 9) { // document.node
                    o = X.toObj(xml.documentElement);
                }
                else
                    alert("unhandled node type: " + xml.nodeType);
                return o;
            },
            toJson: function (o, name, ind) {
                var json = name ? ("\"" + name + "\"") : "";
                if (o instanceof Array) {
                    for (var i = 0, n = o.length; i < n; i++)
                        o[i] = X.toJson(o[i], "", ind + "\t");
                    json += (name ? ":[" : "[") + (o.length > 1 ? ("\n" + ind + "\t" + o.join(",\n" + ind + "\t") + "\n" + ind) : o.join("")) + "]";
                }
                else if (o == null)
                    json += (name && ":") + "null";
                else if (typeof (o) == "object") {
                    var arr = [];
                    for (var m in o)
                        arr[arr.length] = X.toJson(o[m], m, ind + "\t");
                    json += (name ? ":{" : "{") + (arr.length > 1 ? ("\n" + ind + "\t" + arr.join(",\n" + ind + "\t") + "\n" + ind) : arr.join("")) + "}";
                }
                else if (typeof (o) == "string")
                    json += (name && ":") + "\"" + o.toString() + "\"";
                else
                    json += (name && ":") + o.toString();
                return json;
            },
            innerXml: function (node) {
                var s = ""
                if ("innerHTML" in node)
                    s = node.innerHTML;
                else {
                    var asXml = function (n) {
                        var s = "";
                        if (n.nodeType == 1) {
                            s += "<" + n.nodeName;
                            for (var i = 0; i < n.attributes.length; i++)
                                s += " " + n.attributes[i].nodeName + "=\"" + (n.attributes[i].nodeValue || "").toString() + "\"";
                            if (n.firstChild) {
                                s += ">";
                                for (var c = n.firstChild; c; c = c.nextSibling)
                                    s += asXml(c);
                                s += "</" + n.nodeName + ">";
                            }
                            else
                                s += "/>";
                        }
                        else if (n.nodeType == 3)
                            s += n.nodeValue;
                        else if (n.nodeType == 4)
                            s += "<![CDATA[" + n.nodeValue + "]]>";
                        return s;
                    };
                    for (var c = node.firstChild; c; c = c.nextSibling)
                        s += asXml(c);
                }
                return s;
            },
            escape: function (txt) {
                return txt.replace(/[\\]/g, "\\\\")
                    .replace(/[\"]/g, '\\"')
                    .replace(/[\n]/g, '\\n')
                    .replace(/[\r]/g, '\\r');
            },
            removeWhite: function (e) {
                e.normalize();
                for (var n = e.firstChild; n;) {
                    if (n.nodeType == 3) {  // text node
                        if (!n.nodeValue.match(/[^ \f\n\r\t\v]/)) { // pure whitespace text node
                            var nxt = n.nextSibling;
                            e.removeChild(n);
                            n = nxt;
                        }
                        else
                            n = n.nextSibling;
                    }
                    else if (n.nodeType == 1) {  // element node
                        X.removeWhite(n);
                        n = n.nextSibling;
                    }
                    else                      // any other node
                        n = n.nextSibling;
                }
                return e;
            }
        };
        if (xml.nodeType == 9) // document node
            xml = xml.documentElement;
        var json = X.toJson(X.toObj(X.removeWhite(xml)), xml.nodeName, "\t");
        return "{\n" + tab + (tab ? json.replace(/\t/g, tab) : json.replace(/\t|\n/g, "")) + "\n}";
    },
    getRelatedJSAndCSS: function (code) {
        var resources = Array();
        var js__ = code.match(/<script(.*?)<\/script>/g);
        if (js__ != null) {
            js__.map(function (val) {
                var jss__ = $(val).attr("src");
                if (typeof (jss__) != 'undefined') {
                    resources.push(jss__);
                }
            });
        }

        var css__ = code.match(/<link(.*?)>/g);
        if (css__ != null) {
            css__.map(function (val) {
                var csss__ = $(val).attr("href");
                if (typeof (csss__) != 'undefined') {
                    resources.push(csss__);
                }
            });
        }
        return resources;
    },

    getStringConnection: function (__ver, __username, __isonline) {

        var str = "ServiceUri=";
        str += SDK.REST._getClientUrl() + "; ";
        str += "Username=" + __username + "; ";
        str += "Password=YourPasswordHere; ";
        if (__ver >= 8.2 && __isonline) {
            str += "authtype=Office365; ";
        }
        return str;
    },
    getCrmSvcUtilString: function (__username) {
        var str = "CrmSvcUtil.exe /url:";
        str += SDK.REST._getClientUrl() + "/XRMServices/2011/Organization.svc ";
        str += "/out:ProxyCrm.cs ";
        str += "/username:" + __username + " ";
        str += "/password:\"YourPasswordHere\"";
        return str;
    },
    completeWebResources: function (__ver) {
        try {
            var webResources = Array();
            var wr = $.find('script');
            for (var i = 0; i < wr.length; i++) {
                if (typeof wr[i] != 'undefined' && wr[i] != null && typeof ($(wr[i]).attr('src')) != 'undefined' && $(wr[i]).attr('src') != null) {
                    if ($(wr[i]).attr('src').indexOf("/WebResources/") > -1) {
                        var name = HUDCRM_XRM.getNameWR($(wr[i]).attr('src'));
                        var o = new Object();
                        o.nameWR = name;
                        o.inUi = false;
                        webResources.push(o);
                    }
                }
            }
            var childIframes = $("iframe");
            for (var i = 0; i < childIframes.length; i++) {
                var iframe = childIframes[i];
                var wr = $(iframe.contentDocument).find("script");
                for (var j = 0; j < wr.length; j++) {
                    if (typeof wr[j] != 'undefined' && wr[j] != null && typeof ($(wr[j]).attr('src')) != 'undefined' && $(wr[j]).attr('src') != null) {
                        if ($(wr[j]).attr('src').indexOf("/WebResources/") > -1) {
                            var name = HUDCRM_XRM.getNameWR($(wr[j]).attr('src'));
                            var o = new Object();
                            o.nameWR = name;
                            o.inUi = false;
                            webResources.push(o);
                        }
                    }
                }
            }

        } catch (error) {
            console.error(error);
        }

        return webResources;
    },

    getCRMHeaderInfo: function (__ver) {
        var b = new Object();

        try {
            b.APPLICATION_FULL_VERSION = APPLICATION_FULL_VERSION;
            b.APPLICATION_VERSION = APPLICATION_VERSION;
            b.CURRENT_WEB_THEME = CURRENT_WEB_THEME;
            b.DEF_SOL_ID = DEF_SOL_ID;
            b.ORG_ID = ORG_ID;
            b.ORG_UNIQUE_NAME = ORG_UNIQUE_NAME;
            b.USER_DATE_FORMATSTRING = USER_DATE_FORMATSTRING;
            b.USER_GUID = USER_GUID;
            b.USER_TIME_FORMAT = USER_TIME_FORMAT;
            b.SERVER_URL = SERVER_URL;
            b.IS_ONPREMISE = IS_ONPREMISE;

            if (__ver == 5) {

            } else {
                b.AUTO_SAVE_ENABLED = AUTO_SAVE_ENABLED;
                b.USER_LANGUAGE_TWO_LETTER_NAME = USER_LANGUAGE_TWO_LETTER_NAME;
            }
        } catch (error) {
            console.error(error);
        }


        return b;
    },
    getExtraqs: function (__url) {
        var parametrosSinCodificar = __url;
        var arrayParametros = Array();
        arrayParametros = parametrosSinCodificar.split("&");
        if (arrayParametros.length == 0 && parametrosSinCodificar.indexOf("=") > 0) {
            arrayParametros[0] = parametrosSinCodificar;
        }
        var extraqs = "";
        for (var i = 0; i < arrayParametros.length; i++) {
            var arrayVar = arrayParametros[i].split("=");
            var nombre = arrayVar[0];
            var valor = arrayVar[1];
            if (nombre == "extraqs") {
                extraqs = valor;
            } else {
                arrayParametros[i] = decodeURIComponent(arrayParametros[i]).replace(/\++/g, ' ');
            }
        }
        var parametrosExtraqs = decodeURIComponent(decodeURIComponent(extraqs).replace(/\++/g, ' '));
        if (parametrosExtraqs.indexOf("?") >= 0) {
            parametrosExtraqs = parametrosExtraqs.substr(parametrosExtraqs.indexOf("?") + 1);
        }
        return parametrosExtraqs;
    },
    getParamUrl: function (__url, __param) {

        var parametrosSinCodificar = __url;
        if (parametrosSinCodificar.indexOf("?") >= 0) {
            parametrosSinCodificar = parametrosSinCodificar.substr(parametrosSinCodificar.indexOf("?") + 1);
        }
        var arrayParametros = Array();
        arrayParametros = parametrosSinCodificar.split("&");
        if (arrayParametros.length == 0 && parametrosSinCodificar.indexOf("=") > 0) {
            arrayParametros[0] = parametrosSinCodificar;
        }
        for (var i = 0; i < arrayParametros.length; i++) {
            var arrayVar = arrayParametros[i].split("=");
            var nombre = arrayVar[0];
            var valor = arrayVar[1];
            if (nombre == __param) {
                return valor;
            }
        }
        return "";
    },
    getNewGuid: function (scores) {
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1);
        }
        if (scores) {
            return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
                s4() + '-' + s4() + s4() + s4();
        }
        return s4() + s4() + '' + s4() + '' + s4() + '' +
            s4() + '' + s4() + s4() + s4();
    }
};



var Base64 = {

    _keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
    encode: function (input) {
        var output = "";
        var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
        var i = 0;

        input = Base64._utf8_encode(input);

        while (i < input.length) {

            chr1 = input.charCodeAt(i++);
            chr2 = input.charCodeAt(i++);
            chr3 = input.charCodeAt(i++);

            enc1 = chr1 >> 2;
            enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
            enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
            enc4 = chr3 & 63;

            if (isNaN(chr2)) {
                enc3 = enc4 = 64;
            } else if (isNaN(chr3)) {
                enc4 = 64;
            }

            output = output +
                this._keyStr.charAt(enc1) + this._keyStr.charAt(enc2) +
                this._keyStr.charAt(enc3) + this._keyStr.charAt(enc4);

        }

        return output;
    },
    decode: function (input) {
        var output = "";
        var chr1, chr2, chr3;
        var enc1, enc2, enc3, enc4;
        var i = 0;

        input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

        while (i < input.length) {

            enc1 = this._keyStr.indexOf(input.charAt(i++));
            enc2 = this._keyStr.indexOf(input.charAt(i++));
            enc3 = this._keyStr.indexOf(input.charAt(i++));
            enc4 = this._keyStr.indexOf(input.charAt(i++));

            chr1 = (enc1 << 2) | (enc2 >> 4);
            chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
            chr3 = ((enc3 & 3) << 6) | enc4;

            output = output + String.fromCharCode(chr1);

            if (enc3 != 64) {
                output = output + String.fromCharCode(chr2);
            }
            if (enc4 != 64) {
                output = output + String.fromCharCode(chr3);
            }

        }

        output = Base64._utf8_decode(output);

        return output;

    },
    _utf8_encode: function (string) {
        string = string.replace(/\r\n/g, "\n");
        var utftext = "";

        for (var n = 0; n < string.length; n++) {

            var c = string.charCodeAt(n);

            if (c < 128) {
                utftext += String.fromCharCode(c);
            }
            else if ((c > 127) && (c < 2048)) {
                utftext += String.fromCharCode((c >> 6) | 192);
                utftext += String.fromCharCode((c & 63) | 128);
            }
            else {
                utftext += String.fromCharCode((c >> 12) | 224);
                utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                utftext += String.fromCharCode((c & 63) | 128);
            }

        }

        return utftext;
    },
    _utf8_decode: function (utftext) {
        var string = "";
        var i = 0;
        var c = c1 = c2 = 0;

        while (i < utftext.length) {

            c = utftext.charCodeAt(i);

            if (c < 128) {
                string += String.fromCharCode(c);
                i++;
            }
            else if ((c > 191) && (c < 224)) {
                c2 = utftext.charCodeAt(i + 1);
                string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
                i += 2;
            }
            else {
                c2 = utftext.charCodeAt(i + 1);
                c3 = utftext.charCodeAt(i + 2);
                string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
                i += 3;
            }

        }

        return string;
    }

}



var Loaded_REFEREDVAR_HUDCRMCommonFunctions = true;