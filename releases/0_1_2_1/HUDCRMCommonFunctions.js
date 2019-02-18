

var HUDCRM_COMMONFUNCTIONS = {

    getRelatedJSAndCSS: function (code) {
        var resources = Array();
        var js__ = code.match(/<script(.*?)<\/script>/g);
        if (js__!=null) {
            js__.map(function (val) {
                var jss__ = $(val).attr("src");
                if (typeof (jss__) != 'undefined') {
                    resources.push(jss__);
                }
            });
        }
        
        var css__ = code.match(/<link(.*?)>/g);
        if (css__!=null) {
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
    getCrmSvcUtilString: function ( __username) {
        var str = "CrmSvcUtil.exe /url:";
        str += SDK.REST._getClientUrl() + "/XRMServices/2011/Organization.svc ";
        str += "/out:ProxyCrm.cs ";
        str += "/username:" + __username + " ";
        str += "/password:\"YourPasswordHere\"";
        return str;
    },
    completeWebResources: function (__ver) {
        var webResources = Array();
        var wr = $.find('script');
        for (var i = 0; i < wr.length; i++) {
            if (typeof ($(wr[i]).attr('src')) != 'undefined') {
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
            for (var i = 0; i < wr.length; i++) {
                if (typeof ($(wr[i]).attr('src')) != 'undefined') {
                    if ($(wr[i]).attr('src').indexOf("/WebResources/") > -1) {
                        var name = HUDCRM_XRM.getNameWR($(wr[i]).attr('src'));
                        var o = new Object();
                        o.nameWR = name;
                        o.inUi = false;
                        webResources.push(o);
                    }
                }
            }
        }
        return webResources;
    },

    getCRMHeaderInfo:function (__ver) {
        var b = new Object();
        
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
        if (parametrosSinCodificar.indexOf("?")>=0) {
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
    getNewGuid: function(scores){
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