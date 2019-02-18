


var HUDCRM_CODEMIRROR = {
    typeWebresource : { html: 1, css: 2, js: 3, xml: 4, png: 5, jpg: 6, gif: 7 },
    wrModifiedOnSafetyControlVersion: "",
    wrTypeLoaded: "",
    wrBaseCode: "",
    saving: false,
    beautify_in_progress: false,
    globalCodeMirror: null,
    initialize: function (code, type, divId) {
        //TODO: type
        try {
            var target = $("#" + divId)[0];
            var myCodeMirror = CodeMirror(target, {
                value: code,
                theme: 'default',
                mode: "javascript",
                lineNumbers: true
            });
            myCodeMirror.focus();
            HUDCRM_CODEMIRROR.globalCodeMirror = myCodeMirror;
            setTimeout(function () {
                myCodeMirror.refresh();
            }, 500);
        } catch (e) {
            console.error(e);
        }
        
    },
    unload: function () {
        HUDCRM_CODEMIRROR.globalCodeMirror = null;
    },
    unpacker_filter: function (__source) {
        var source__ = __source;
        var trailing_comments__ = '';
        var comment__ = '';
        var unpacked__ = '';
        var found__ = false;
        do {
            found__ = false;
            if (new RegExp("/^\s*\/\*/").test(source__)) {
                found__ = true;
                comment__ = source__.substr(0, source__.indexOf('*/') + 2);
                source__ = source__.substr(comment__.length).replace(/^\s+/, '');
                trailing_comments__ += comment__ + "\n";
            } else if (new RegExp("/^\s*\/\//").test(source__)) {
                found__ = true;
                comment__ = source__.match(/^\s*\/\/.*/)[0];
                source__ = source__.substr(comment__.length).replace(/^\s+/, '');
                trailing_comments__ += comment__ + "\n";
            }
        } while (found__);

        var unpackers__ = [P_A_C_K_E_R, Urlencoded, /*JavascriptObfuscator,*/ MyObfuscate];
        for (var i = 0; i < unpackers__.length; i++) {
            if (unpackers__[i].detect(source__)) {
                unpacked__ = unpackers__[i].unpack(source__);
                if (unpacked__ != source__) {
                    source__ = HUDCRM_CODEMIRROR.unpacker_filter(unpacked__);
                }
            }
        }
        return trailing_comments__ + source__;
    },
    beautifyCodeMirror: function (type) {
        if (HUDCRM_CODEMIRROR.beautify_in_progress) return;
        HUDCRM_CODEMIRROR.beautify_in_progress = true;

        var source__ = HUDCRM_CODEMIRROR.globalCodeMirror.getValue();
        var output__;

        var opts__ = {};
        opts__.indent_size = 4;
        opts__.indent_char = ' ';
        opts__.max_preserve_newlines = 5;
        opts__.preserve_newlines = true;
        opts__.keep_array_indentation = false;
        opts__.break_chained_methods = false;
        opts__.indent_scripts = "normal";
        opts__.brace_style = "collapse";
        opts__.space_before_conditional = true;
        opts__.unescape_strings = false;
        opts__.jslint_happy = false;
        opts__.end_with_newline = false;
        opts__.wrap_line_length = 0;
        opts__.indent_inner_html = false;
        opts__.comma_first = false;
        opts__.e4x = false;

        if (type == HUDCRM_CODEMIRROR.typeWebresource.html) {
            output__ = html_beautify(source__, opts__);
        } else {
            source__ = HUDCRM_CODEMIRROR.unpacker_filter(source__);
            output__ = js_beautify(source__, opts__);
        }
        HUDCRM_CODEMIRROR.globalCodeMirror.setValue(output__);

        HUDCRM_CODEMIRROR.beautify_in_progress = false;
    },
    getRelated: function (__code, __idWebResource) {
        if (HUDCRM_CODEMIRROR.wrTypeLoaded == "Html") {
            var js__ = __code.match(/<script(.*?)<\/script>/g).map(function (val) {
                var jss__ = $(val).attr("src");
                if (typeof (jss__) != 'undefined') {
                    HUDCRM_CODEMIRROR.findReferencedWR(jss__, __idWebResource);
                }
            });
            var css__ = __code.match(/<link(.*?)>/g).map(function (val) {
                var csss__ = $(val).attr("href");
                if (typeof (csss__) != 'undefined') {
                    HUDCRM_CODEMIRROR.findReferencedWR(csss__, __idWebResource);
                }
            });
        }
    },
    findReferencedWR: function (__name, __idWebResource) {
        var namePr__ = HUDCRM_CODEMIRROR.getNameWRReferenced(__name);
        if (namePr__ != "") {
            var options__ = "$select=WebResourceId, Name &$filter=Name eq '" + namePr__ + "'";
            SDK.REST.retrieveMultipleRecords(
                 "WebResource",
                 options__,
                 function (e) {
                     if (e.length > 0) {
                         HUDCRM_CODEMIRROR.addReferenced(e[0].WebResourceId, e[0].Name, __idWebResource);
                     }
                 },
                 function (e) {
                 },
                 function () {
                 }
            );
        }
    },
    addReferenced: function (__id, __name, __idWebResource) {
        $('#referencedCodeMirror').append("<div class='btn btn-primary btn-sm' onclick='HUDCRM_CORE.showCodeMirror(\"" + __id + "\",\"" + __idWebResource + "\")'>" + __name + "</div>");
    },
    getNameWRReferenced: function (__str) {
        var word__ = "WebResources";
        if (typeof (__str) != 'undefined') {
            var pos__ = __str.indexOf(word__);
            if (pos__ >= 0) {
                var name__ = __str.substr(pos__ + word__.length + 1);
                var posParam__ = name__.indexOf("?");
                if (posParam__ >= 0) {
                    name__ = name__.substr(0, posParam__);
                }
                return name__;
            } else {
                return __str;
            }
        }
        return "";

    },
    getDivCodeMirror: function (__idWebResource, __referenced) {

        var divBackToMain__ = "";
        if (__referenced != null) {
            divBackToMain__ = "<div class='btn btn-primary btn-sm' onclick='HUDCRM_CORE.showCodeMirror(\"" + __referenced + "\", null)'>Back</div>"
        }
        var div__ = "<div>Referenced: " + divBackToMain__ + "<div id='referencedCodeMirror'></div></div>";
        div__ = div__ + "<div class='row'><div class='col-sm-5'><div id='nameCodeMirror'></div></div><div class='col-sm-3'><div id='modifiedOnCodeMirror'></div></div><div class='col-sm-4'><div id='idWRCodeMirror'></div></div></div>";
        div__ = div__ + '<div id="divSourceCodeMirror"><textarea id="sourceCodeMirror" rows="15" cols="160"></textarea></div>';
        div__ = div__ + '<div id="divSourceCodeMirrorDifferences" style=" max-height: 300px; overflow-y: scroll;"></div>';
        div__ = div__ + "<div class='row'><div  id='btnBeatufiyCodeMirror'  style='margin-left: 20px'   class='btn btn-info btn-sm' onclick='HUDCRM_CODEMIRROR.beautifyCodeMirror()'>Beautify code</div>\
                        <div  style='margin-left: 20px'  class='btn btn-info btn-sm' id='btnDifferencesCodeMirror' onclick='HUDCRM_CODEMIRROR.showDifferences()'>Show differences</div>\
                        <div  style='margin-left: 20px' id='btnSaveCodeMirror' class='btn btn-success btn-sm' onclick='HUDCRM_CODEMIRROR.saveWR(\"" + __idWebResource + "\", false)'>Save</div>\
                        <div  style='margin-left: 20px' id='btnSaveAndPublishCodeMirror' class='btn btn-success btn-sm' onclick='HUDCRM_CODEMIRROR.saveWR(\"" + __idWebResource + "\", true)'>Save + Publish</div>\
                        <div  style='display: none; margin-left: 20px; line-height: 12px; padding: 10px;' class='alert alert-sm alert-danger' id='saveAndPublishResponseErrorCodeMirror'></div>\
                        <div style='display: none; margin-left: 20px; line-height: 12px; padding: 10px;' class='alert alert-sm alert-success' id='saveAndPublishResponseCodeMirror'></div></div>";
        return div__;
    },
    showDifferences: function () {
        var divCodeM__ = $("#divSourceCodeMirror");
        var divCodeMDiff__ = $("#divSourceCodeMirrorDifferences");
        var buttonShowDiff__ = $("#btnDifferencesCodeMirror");
        var buttonBeautify__ = $("#btnBeatufiyCodeMirror");
        var buttonPublish__ = $("#btnSaveAndPublishCodeMirror");

        var visibleSourceCodeMirror = divCodeM__.css('display');
        if (visibleSourceCodeMirror == "none") {
            divCodeM__.css('display', "");
            divCodeMDiff__.css('display', "none");
            divCodeMDiff__.html("");
            buttonBeautify__.css('display', "");
            buttonPublish__.css('display', "");
            buttonShowDiff__.html("Show differences");
        } else {
            divCodeM__.css('display', "none");
            divCodeMDiff__.css('display', "");
            buttonBeautify__.css('display', "none");
            buttonPublish__.css('display', "none");
            buttonShowDiff__.html("Hide differences");

            var base__ = difflib.stringAsLines(wrBaseCode);
            var newtxt__ = difflib.stringAsLines(globalThe.editor.getValue());

            var sm__ = new difflib.SequenceMatcher(base__, newtxt__);
            var opcodes__ = sm__.get_opcodes();
            var diffoutputdiv__ = $("#divSourceCodeMirrorDifferences");

            contextSize = null;

            diffoutputdiv__.html(diffview.buildView({
                baseTextLines: base__,
                newTextLines: newtxt__,
                opcodes: opcodes__,
                baseTextName: "Base Code",
                newTextName: "New Code",
                contextSize: 2,
                viewType: 1
            }));

        }
    },
    saveWR: function (__idWebResource, __publish) {

        if (HUDCRM_CODEMIRROR.saving) {
            return;
        }

        HUDCRM_CORE.showConfirmModoalUI("Before confirm back up all this data. Continue?", function () {
            HUDCRM_CODEMIRROR.saving = true;
            $('#btnSaveAndPublishCodeMirror').attr('class', 'btn btn-success btn-sm disabled');
            $('#btnSaveCodeMirror').attr('class', 'btn btn-success btn-sm disabled');
            if (__publish) {
                $('#btnSaveAndPublishCodeMirror').html("Saving...");
            } else {
                $('#btnSaveCodeMirror').html("Saving...");
            }

            $("#saveAndPublishResponseErrorCodeMirror").css('display', 'none');
            $("#saveAndPublishResponseCodeMirror").css('display', 'none');
            HUDCRM_CODEMIRROR.saveConfirmWR(__idWebResource, __publish);
        });
    },
    saveConfirmWR: function (__idWebResource, __publish) {

        HUDCRM_ASYNC.SOAP(HUDCRM_ASYNC.getSchemaModifiedOnWebResource(__idWebResource),
                "Execute",
                function (response) {
                    //var response = HUDCRM_ASYNC.getResponse(req);
                    var obj__ = HUDCRM_CODEMIRROR.deserializeWRResponse(response);
                    if (obj__.values["modifiedon"].toString() == HUDCRM_CODEMIRROR.wrModifiedOnSafetyControlVersion.toString()) {
                        var html__ = globalThe.editor.getValue();
                        var encoded__ = Base64.encode(html__);
                        var WR__ = new Object();
                        WR__.Content = encoded__;
                        SDK.REST.updateRecord(
                        __idWebResource,
                        WR__,
                        "WebResource",
                        function (e2) {
                            if (__publish) {
                                $('#btnSaveAndPublishCodeMirror').html("Publishing...");
                                HUDCRM_CODEMIRROR.publishWR(__idWebResource);

                            } else {
                                HUDCRM_CODEMIRROR.afterPulbishWork(__idWebResource, false);
                            }
                        },
                        function (e2) {
                            HUDCRM_CODEMIRROR.showError("Error updating content of WR. The modifications has not been saved.");
                            HUDCRM_CODEMIRROR.setControlsEnabled(__idWebResource, __publish, false);
                        });
                    } else {
                        HUDCRM_CODEMIRROR.showError("The version of this Web resource has been modified in CRM since you loaded it. It's not possible to overwrite. Close and modify again.");
                        HUDCRM_CODEMIRROR.setControlsEnabled(__idWebResource, __publish, false);
                    }
                },
                function (e) {
                    HUDCRM_CODEMIRROR.showError("Error getting ModifiedOn data of WR.");
                    HUDCRM_CODEMIRROR.setControlsEnabled(__idWebResource, __publish, false);
                });

    },
    setControlsEnabled: function (__idWebResource, __published, __success) {
        $('#btnSaveAndPublishCodeMirror').attr('class', 'btn btn-success btn-sm');
        $('#btnSaveCodeMirror').attr('class', 'btn btn-success btn-sm');
        if (__success) {
            if (__published) {
                $('#btnSaveAndPublishCodeMirror').html("Save + Publish");
                HUDCRM_CODEMIRROR.showSuccess("Published!");
                HUDCRM_CODEMIRROR.updateIframeModified(__idWebResource);
            } else {
                $('#btnSaveCodeMirror').html("Save");
                HUDCRM_CODEMIRROR.showSuccess("Saved!");
            }
        } else {
            if (__published) {
                $('#btnSaveAndPublishCodeMirror').html("Save + Publish");
            } else {
                $('#btnSaveCodeMirror').html("Save");
            }
        }
        HUDCRM_CODEMIRROR.saving = false;
    },
    showError: function (__e) {
        $("#saveAndPublishResponseErrorCodeMirror").css('display', 'inline-block');
        $("#saveAndPublishResponseErrorCodeMirror").html(__e);
    },
    showSuccess: function (__message) {
        $("#saveAndPublishResponseErrorCodeMirror").css('display', 'none');
        $("#saveAndPublishResponseCodeMirror").css('display', 'inline-block');
        $("#saveAndPublishResponseCodeMirror").html(__message);
    },
    publishWR: function (__idWebResource) {
        HUDCRM_ASYNC.SOAP(HUDCRM_ASYNC.getSchemaPublisWR(__idWebResource),
                "Execute",
                function (response) {
                    HUDCRM_CODEMIRROR.afterPulbishWork(__idWebResource, true);
                },
                function (e) {
                    HUDCRM_CODEMIRROR.showError("Error publishing the content. The modifications has been saved but not published.");
                    HUDCRM_CODEMIRROR.setControlsEnabled(__idWebResource, true, false);

                });

    },
    afterPulbishWork: function (__idWebResource, __published) {

        HUDCRM_ASYNC.SOAP(HUDCRM_ASYNC.getSchemaModifiedOnWebResource(__idWebResource),
               "Execute",
               function (response) {
                   var obj = HUDCRM_CODEMIRROR.deserializeWRResponse(response);
                   $("#modifiedOnCodeMirror").html("ModifiedOn: " + obj.formattedValues["modifiedon"]);
                   HUDCRM_CODEMIRROR.wrModifiedOnSafetyControlVersion = obj.values["modifiedon"].toString();
                   HUDCRM_CODEMIRROR.setControlsEnabled(__idWebResource, __published, true);
               },
               function (e) {
                   HUDCRM_CODEMIRROR.showError("The WR Has been saved and published propperly but for continue modifying is necessary to close this popup");
               });

    },
    updateIframeModified: function (__idWebResource) {
        for (var i = 0; i < HUDCRM_CORE.webResources.length; i++) {
            if (HUDCRM_CORE.webResources[i].WebResourceId == __idWebResource) {
                if (typeof (HUDCRM_CORE.webResources[i].name) != 'undefined') {
                    if (HUDCRM_CORE.webResources[i].name != "") {
                        HUDCRM_CORE.reloadWR(HUDCRM_CORE.webResources[i].name);
                    }
                }
            }
        }
    },
    globalReq: Object,
    loadWRSoap: function (__idWebResource) {

        var the__ = Object();
        the__.use_codemirror = (!window.location.href.match(/without-codemirror/));
        the__.beautify_in_progress = false;
        the__.editor = null;


        var default_text__ = "loading...";
        var textArea__ = $('#sourceCodeMirror')[0];

        if (the__.use_codemirror && typeof CodeMirror !== 'undefined') {
            the__.editor = CodeMirror.fromTextArea(textArea__, {
                theme: 'default',
                lineNumbers: true
            });
            the__.editor.focus();

            the__.editor.setValue(default_text__);
            $('.CodeMirror').click(function () {
                if (the__.editor.getValue() == default_text__) {
                    the__.editor.setValue('');
                }
            });
        } else {
            $('#sourceCodeMirror').val(default_text__).bind('click focus', function () {
                if ($(this).val() == default_text__) {
                    $(this).val('');
                }
            }).bind('blur', function () {
                if (!$(this).val()) {
                    $(this).val(default_text__);
                }
            });
        }
        HUDCRM_ASYNC.SOAP(HUDCRM_ASYNC.getSchemaGetWebResource(__idWebResource),
               "Execute",
               function (response) {
                   var obj__ = HUDCRM_CODEMIRROR.deserializeWRResponse(response);
                   var type__ = "";
                   var num__ = $(obj__.values["webresourcetype"]).html();
                   if (num__ == "1") {
                       type__ = "Html";
                   } else if (num__ == "3") {
                       type__ = "Javascript";
                   } else if (num__ == "2") {
                       type__ = "CSS";
                   } else {
                       $("#sourceCodeMirror").val("Only can be modified HTML/JS/CSS Webresources");
                       return;
                   }
                   HUDCRM_CODEMIRROR.wrTypeLoaded = type__;
                   $("#nameCodeMirror").html("Name: " + obj__.values["name"] + " (" + type__ + ")");
                   $("#idWRCodeMirror").html("Id: " + __idWebResource);
                   var decoded__ = Base64.decode(obj__.values["content"]);
                   $("#modifiedOnCodeMirror").html("ModifiedOn: " + obj__.formattedValues["modifiedon"]);
                   HUDCRM_CODEMIRROR.wrModifiedOnSafetyControlVersion = obj__.values["modifiedon"].toString();
                   the__.editor.setValue(decoded__);
                   globalThe = the__;
                   HUDCRM_CODEMIRROR.beautifyCodeMirror();
                   wrBaseCode = globalThe.editor.getValue();
                   HUDCRM_CODEMIRROR.getRelated(decoded__, __idWebResource);
               },
               function (e) {
                   console.log(e);
               });
        //var request = ["<s:Envelope xmlns:s=\"http://schemas.xmlsoap.org/soap/envelope/\">",
        //                "<s:Body>",
        //                "<Execute xmlns=\"http://schemas.microsoft.com/xrm/2011/Contracts/Services\" xmlns:i=\"http://www.w3.org/2001/XMLSchema-instance\">",
        //                "<request i:type=\"b:RetrieveUnpublishedRequest\" xmlns:a=\"http://schemas.microsoft.com/xrm/2011/Contracts\" xmlns:b=\"http://schemas.microsoft.com/crm/2011/Contracts\">",
        //                "<a:Parameters xmlns:c=\"http://schemas.datacontract.org/2004/07/System.Collections.Generic\">",
        //                "<a:KeyValuePairOfstringanyType>",
        //                "<c:key>Target</c:key>",
        //                "<c:value i:type=\"a:EntityReference\">",
        //                "<a:Id>" + __idWebResource + "</a:Id>",
        //                "<a:KeyAttributes xmlns:d=\"http://schemas.microsoft.com/xrm/7.1/Contracts\" />",
        //                "<a:LogicalName>webresource</a:LogicalName>",
        //                "<a:Name i:nil=\"true\" />",
        //                "<a:RowVersion i:nil=\"true\" />",
        //                "</c:value>",
        //                "</a:KeyValuePairOfstringanyType>",
        //                "<a:KeyValuePairOfstringanyType>",
        //                "<c:key>ColumnSet</c:key>",
        //                "<c:value i:type=\"a:ColumnSet\">",
        //                "<a:AllColumns>false</a:AllColumns>",
        //                "<a:Columns xmlns:d=\"http://schemas.microsoft.com/2003/10/Serialization/Arrays\">",
        //                "<d:string>name</d:string>",
        //                "<d:string>content</d:string>",
        //                "<d:string>webresourcetype</d:string>",
        //                "<d:string>modifiedon</d:string>",
        //                "</a:Columns>",
        //                "</c:value>",
        //                "</a:KeyValuePairOfstringanyType>",
        //                "</a:Parameters>",
        //                "<a:RequestId i:nil=\"true\" />",
        //                "<a:RequestName>RetrieveUnpublished</a:RequestName>",
        //                "</request>",
        //                "</Execute>",
        //                "</s:Body>",
        //                "</s:Envelope>"].join("");
        //var req = new XMLHttpRequest();
        //req.open("POST", HUDCRM_ASYNC._getURLServiceSoap(), true);
        //try { req.responseType = 'msxml-document' } catch (e) { }
        //req.setRequestHeader("Accept", "application/xml, text/xml, */*");
        //req.setRequestHeader("Content-Type", "text/xml; charset=utf-8");
        //req.setRequestHeader("SOAPAction", "http://schemas.microsoft.com/xrm/2011/Contracts/Services/IOrganizationService/Execute");
        //req.onreadystatechange = function () {
        //    if (req.readyState == 4) {
        //        req.onreadystatechange = null;
        //        if (req.status == 200) {
        //            var response = HUDCRM_ASYNC.getResponse(req);


        //        }
        //        else {

        //        }
        //    }
        //};
        //req.send(request);


    }, deserializeWRResponse: function (__response) {

        var o__ = new Object();
        var values__ = new Object();
        var formattedValues__ = new Object();
        var attr__ = $(__response).find('Attributes')[0];
        var attrArr__ = $(attr__).find('KeyValuePairOfstringanyType');
        for (var i = 0; i < attrArr__.length; i++) {
            var key__ = $($(attrArr__[i]).find('key')[0]).html();
            var value__ = $($(attrArr__[i]).find('value')[0]).html();
            values__[key__] = value__;
            formattedValues__[key__] = value__;
            //console.log(attrArr[i]);
            //HUDCRM_CODEMIRROR.globalReq = attrArr[i];
        }
        var attrF__ = $(__response).find('FormattedValues')[0];
        var attrArrF__ = $(attrF__).find('KeyValuePairOfstringstring');
        for (var i = 0; i < attrArrF__.length; i++) {
            var key__ = $($(attrArrF__[i]).find('key')[0]).html();
            var value__ = $($(attrArrF__[i]).find('value')[0]).html();
            formattedValues__[key__] = value__;
            //console.log(attrArr[i]);
            //HUDCRM_CODEMIRROR.globalReq = attrArr[i];
        }
        o__.values = values__;
        o__.formattedValues = formattedValues__;
        return o__;

    }

};





