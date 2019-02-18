
HUDCRM_SOAP = { 
    request: function (__requestSchema, __action, __successCallBack, __errorCallBack) {
        var req__ = new XMLHttpRequest();
        req__.open("POST", HUDCRM_SOAP._getURLServiceSoap(), true);
        try { req.responseType = 'msxml-document' } catch (e) { }
        req__.setRequestHeader("Accept", "application/xml, text/xml, */*");
        req__.setRequestHeader("Content-Type", "text/xml; charset=utf-8");
        req__.setRequestHeader("SOAPAction", "http://schemas.microsoft.com/xrm/2011/Contracts/Services/IOrganizationService/" + __action);
        req__.onreadystatechange = function () {
            if (req__.readyState == 4 /* complete */) {
                req__.onreadystatechange = null;
                if (req__.status == 200) {
                    var response__ = HUDCRM_SOAP.__getResponse(req__);
                    __successCallBack(response__);
                }
                else {
                    var response__ = HUDCRM_SOAP.__getResponse(req__);
                    var doc__ = req__.responseXML;
                    __errorCallBack(response__);
                }
            }
        };
        req__.send(__requestSchema);
    },
    _getURLServiceSoap: function () {
        return HUDCRM_SOAP._getUrl() + "/XRMServices/2011/Organization.svc/web";
    },
    __getResponse: function (__req) {
        var re__ = $(__req.responseXML).find('Body')[0].childNodes[0];
        return re__;
    },
    _getUrl: function () {
        var url__ = HUDCRM_SOAP._context().getClientUrl();
        return url__;
    },
    _context: function () {
        if (typeof GetGlobalContext != "undefined")
        { return GetGlobalContext(); }
        else {
            if (typeof Xrm != "undefined") {
                return Xrm.Page.context;
            }
            else { console.log("Error with context"); }
        }
    },


    deserializeRetrieveMultipleResponseCountRecords: function (__response) {
        var o__ = new Object();
        var responseR = $(__response).find('RetrieveMultipleResult')[0];
        o__.EntityName = $($(responseR).find('a\\:EntityName')[0]).html();
        var entities__ = $(responseR).find('a\\:Entities').find('a\\:Entity');
        var PagingCookie__ = $($(responseR).find('a\\:PagingCookie')[0]).html();
        var MoreRecords__ = $($(responseR).find('a\\:MoreRecords')[0]).html();
        var objEntities__ = Array();
        var attributes__ = Array();
        var attributesArra__ = $($(entities__[0]).find("a\\:Attributes")[0]).find('a\\:KeyValuePairOfstringanyType');
        //for (var i = 0; i < attributesArra__.length; i++) {
        //    var attr__ = attributesArra__[i];
        //    var key__ = $($(attr__).find('key')[0]).html();
        //    attributes__.push(key__);
        //}
        for (var i = 0; i < entities__.length; i++) {
            objEntities__.push(true);
        }
        o__.Attributes = attributes__;
        o__.Entities = objEntities__;
        o__.PagingCookie = PagingCookie__;
        o__.MoreRecords = MoreRecords__;
        return o__;
    },

    deserializeFaultString: function(__response) {
        return $($(__response).find('faultstring')[0]).html();
    },
    deserializeRetrieveResponse: function (__response, __includeFormatted) {

        var o__ = new Object();
        var responseR__ = $(__response).find('RetrieveResult')[0];
        
        //if (__includeFormatted) {
        //    console.log($(__response).find('RetrieveResult')[0]);
        //}
        //console.log($(responseR__)[0]);
        var id__ = null; // $($(responseR__).find('a\\:id')[0]).html();
        var children__ = $($(responseR__)[0]).children();
        for (var i = 0; i < children__.length; i++) {
            var tagName__ = children__[i].tagName;
            if (tagName__ == "A:ID") {
                id__ = $(children__[i]).html();
                break;
            }
        }
        o__.Id = id__;
        var attributes__ = Array();
        var formatted__ = Array();
        var attributesArra__ = $(responseR__).find("a\\:Attributes").find('a\\:KeyValuePairOfstringanyType');
        for (var i = 0; i < attributesArra__.length; i++) {

            var attrObj = Object();

            var attr__ = attributesArra__[i];
            var key__ = $($(attr__).find('b\\:key')[0]).html();
            var typeArr__ = $($(attr__).find('b\\:value')[0]).attr('i:type').split(":");
            var type__ = "";
            if (typeArr__.length == 2) {
                type__ = typeArr__[1];
            } else {
                type__ = typeArr__[0];
            }
            var value__ = null;
            var valueRaw__ = $($(attr__).find('b\\:value')[0]).html();
            if (type__ == "EntityReference") {
                value__ = HUDCRM_SOAP.deserializeEntityReference(valueRaw__);
            } else if (type__ == "OptionSetValue") {
                value__ = HUDCRM_SOAP.deserializeOptionSetValue(valueRaw__);
            } else if (type__ == "Money") {
                value__ = HUDCRM_SOAP.deserializeMoney(valueRaw__);
            } else if (type__ == "BooleanManagedProperty") {
                value__ = HUDCRM_SOAP.deserializeManagedProperty(valueRaw__);
            } else if (type__ == "AliasedValue") {
                value__ = HUDCRM_SOAP.deserializeAliasedValue(valueRaw__);
            } else {
                value__ = valueRaw__;
            }
            attrObj.key = key__;
            attrObj.value = value__;
            attrObj.type = type__;
            attributes__.push(attrObj);
            if (__includeFormatted) {
                formatted__.push({key: key__, value: value__, type: type__});
            }
        }
        if (__includeFormatted) {
            
            var formattedArra__ = $(responseR__).find("a\\:FormattedValues").find('a\\:KeyValuePairOfstringString');
            
            for (var i = 0; i < formattedArra__.length; i++) {
                var attr__ = formattedArra__[i];
                var key__ = $($(attr__).find('b\\:key')[0]).html();
                var value__ = $($(attr__).find('b\\:value')[0]).html();
                for (var j = 0; j < formatted__.length; j++) {
                    if (formatted__[j].key == key__) {
                        formatted__[j].value = value__;
                        break;
                    }
                }
            }
        }

        o__.Attributes = attributes__;
        if (__includeFormatted) {
            o__.FormattedValues = formatted__;
        }
        return o__;
    },
    deserializeRetrieveOptionSetResponse: function (__response) {
        var obj = Object();

        var optionsArray = Array();
        var o__ = new Object();
        var value = $(__response).find('b\\:value');
        var description__ = null;
        var displayName__ = null;
        var name__ = null;
        var children__ = $(__response).find('b\\:value').children();
        for (var i = 0; i < children__.length; i++) {
            var tagName__ = children__[i].tagName;
            if (tagName__ == "C:DESCRIPTION") {
                description__ = $(children__[i]).find("a\\:userlocalizedlabel").find('a\\:label').html()
            } else  if (tagName__ == "C:DISPLAYNAME") {
                displayName__ = $(children__[i]).find("a\\:userlocalizedlabel").find('a\\:label').html()
            } else if (tagName__ == "C:NAME") {
                name__ = $(children__[i]).html()
            } else  if (tagName__ == "C:OPTIONS") {
                var options__ = $(children__[i]).find('c\\:optionmetadata');
                for (var j = 0; j < options__.length; j++) {
                    var option__ = options__[j];
                    var label = $(option__).find('c\\:label').find('a\\:userlocalizedlabel').find('a\\:label').html();
                    var value = $(option__).find('c\\:value').html();
                    optionsArray.push({ label: label, value: value });
                }
            }
        }
        obj.name = name__;
        obj.displayName = displayName__;
        obj.description = description__;
        obj.options = optionsArray;
        return obj;
    },

    deserializeRetrieveMultipleResponse: function (__response, __includeFormatted) {
        
        var o__ = new Object();
        var responseR__ = $(__response).find('RetrieveMultipleResult')[0];
        o__.EntityName = $($(responseR__).find('a\\:EntityName')[0]).html();
        var entities__ = $(responseR__).find('a\\:Entities').find('a\\:Entity');
        var objEntities__ = Array();
        var attributes__ = Array();
        var attributesArra__ = $($(entities__[0]).find("a\\:Attributes")[0]).find('a\\:KeyValuePairOfstringanyType');
        for (var i = 0; i < attributesArra__.length; i++) {
            var attr__ = attributesArra__[i];
            var key__ = $($(attr__).find('b\\:key')[0]).html();
            attributes__.push(key__);
        }

        for (var i = 0; i < entities__.length; i++) {
            objEntities__.push(HUDCRM_SOAP.deserializeRetrieveMultipleEntity(entities__[i], __includeFormatted));
        }
        o__.Attributes = attributes__;
        o__.Entities = objEntities__;
        return o__;
    },
    global: null,
    deserializeRetrieveMultipleEntity: function (__entity, __includeFormatted) {
        HUDCRM_SOAP.global = __entity;
        var o__ = new Object();
        var values__ = new Object();
        var formatted__ = new Object();
        var types__ = new Object();
        var id__ = null; //$($(__entity).find("a\\:id")[0]).html();

        var children__ = $($(__entity)[0]).children();
        for (var i = 0; i < children__.length; i++) {
            var tagName__ = children__[i].tagName;
            if (tagName__ == "A:ID") {
                id__ = $(children__[i]).html();
                break;
            }
        }
        //console.log(children__);
        var attributes__ = $($(__entity).find("a\\:Attributes")[0]).find('a\\:KeyValuePairOfstringanyType');
        for (var i = 0; i < attributes__.length; i++) {

            var attr__ = attributes__[i];
            var key__ = $($(attr__).find('b\\:key')[0]).html();
            var typeArr__ = $($(attr__).find('b\\:value')[0]).attr('i:type').split(":");
            var type__ = "";
            if (typeArr__.length == 2) {
                type__ = typeArr__[1];
            } else {
                type__ = typeArr__[0];
            }
            types__[key__] = type__;
            var value__ = null;
            var valueRaw__ = $($(attr__).find('b\\:value')[0]).html();
            if (type__ == "EntityReference") {
                value__ = HUDCRM_SOAP.deserializeEntityReference(valueRaw__);
            } else if (type__ == "OptionSetValue") {
                value__ = HUDCRM_SOAP.deserializeOptionSetValue(valueRaw__);
            } else if (type__ == "Money") {
                value__ = HUDCRM_SOAP.deserializeMoney(valueRaw__);
            } else if (type__ == "BooleanManagedProperty") {
                value__ = HUDCRM_SOAP.deserializeManagedProperty(valueRaw__);
            } else if (type__ == "AliasedValue") {
                value__ = HUDCRM_SOAP.deserializeAliasedValue(valueRaw__);
            } else {
                value__ = valueRaw__;
            }
            values__[key__] = value__;
            if (__includeFormatted) {
                formatted__[key__] = value__;
            }
        }
        //HUDCRM_SOAP.global = __entity;

        if (__includeFormatted) {
            
            var formatedAttributes = $($(__entity).find("a\\:FormattedValues")[0]).find('a\\:KeyValuePairOfstringstring');
            //console.log($(formatedAttributes)[0]);
            for (var i = 0; i < formatedAttributes.length; i++) {
                var attr__ = formatedAttributes[i];
                var key__ = $($(attr__).find('b\\:key')[0]).html();
                var value__ = $($(attr__).find('b\\:value')[0]).html();
                //console.log(key__ + "->" + value__);
                formatted__[key__] = value__;

            }
        }
        o__.values = values__;
        o__.types = types__;
        o__.id = id__;
        if (__includeFormatted) {
            o__.formattedValues = formatted__;
        }
        return o__;
    },
    deserializeEntityReference: function (__value) {
        var o__ = Object();
        var Id__;
        var LogicalName__;
        var Name__;
        var array__ = $(__value);
        for (var i = 0; i < array__.length; i++) {
            var element__ = array__[i];
            var tagName__ = element__.tagName;
            if (tagName__ == "A:ID") {
                Id__ = $(element__).html();
            } else if (tagName__ == "A:LOGICALNAME") {
                LogicalName__ = $(element__).html();
            } else if (tagName__ == "A:NAME") {
                Name__ = $(element__).html();
            }
        }
        o__.Name = Name__;
        o__.LogicalName = LogicalName__;
        o__.Id = Id__;
        return o__;
        //console.log(Id + " - " + LogicalName + " - " + Name);
    },
    deserializeOptionSetValue: function (__value) {
        var o__ = Object();
        var Value__;
        var element__ = $(__value)[0];
        if (element__.tagName == "A:VALUE") {
            Value__ = $(element__).html();
        }
        o__.Value = Value__;
        return o__;
    },
    deserializeMoney: function (__value) {
        var o__ = Object();
        var Value__;
        var element__ = $(__value)[0];
        if (element__.tagName == "A:VALUE") {
            Value__ = $(element__).html();
        }
        o__.Value = Value__;
        return o__;
    },
    deserializeManagedProperty: function (__value) {
        var o__ = Object();
        var CanBeChanged__;
        var ManagedPropertyLogicalName__;
        var Value__;
        var array__ = $(__value);
        for (var i = 0; i < array__.length; i++) {
            var element__ = array__[i];
            var tagName__ = element__.tagName;
            if (tagName__ == "A:MANAGEDPROPERTYLOGICALNAME") {
                CanBeChanged__ = $(element__).html();
            } else if (tagName__ == "A:CANBECHANGED") {
                ManagedPropertyLogicalName__ = $(element__).html();
            } else if (tagName__ == "A:VALUE") {
                Value__ = $(element__).html();
            }
        }
        o__.Value = Value__;
        o__.ManagedPropertyLogicalName = ManagedPropertyLogicalName__;
        o__.CanBeChanged = CanBeChanged__;

        return o__;
    },
    deserializeAliasedValue: function (__value) {
        var o__ = Object();

        var AttributeLogicalName__;
        var EntityLogicalName__;
        var Value__;
        //var ManagedPropertyLogicalName__;
        //var Value__;
        var array__ = $(__value);
        for (var i = 0; i < array__.length; i++) {
            var element__ = array__[i];
            var tagName__ = element__.tagName;
            if (tagName__ == "A:ATTRIBUTELOGICALNAME") {
                AttributeLogicalName__ = $(element__).html();
            } else if (tagName__ == "A:ENTITYLOGICALNAME") {
                EntityLogicalName__ = $(element__).html();
            } else if (tagName__ == "A:VALUE") {
                Value__ = $(element__).html();
            }
        }
        o__.AttributeLogicalName = AttributeLogicalName__;
        o__.EntityLogicalName = EntityLogicalName__;
        o__.Value = Value__;
        return o__;
    },
    deserializeRetrieveAllEntities: function (__response, __includeAttributesMetadata) {
        var o__ = Array();
        var responseR__ = $(__response).find('ExecuteResult')[0];
        var entities__ = $($($(responseR__).find('a\\:KeyValuePairOfstringanyType')[0]).find('b\\:value')[0]).find('c\\:EntityMetadata');
        for (var i = 0; i < entities__.length; i++) {
            var entity__ = new Object();
            
            entity__.displayName = $(entities__[i]).find('c\\:DisplayName').find('a\\:LocalizedLabel').find('a\\:Label').html();
            entity__.logicalName = $($(entities__[i]).find('c\\:LogicalName')[0]).html();
            entity__.typeCode = $($(entities__[i]).find('c\\:ObjectTypeCode')[0]).html();
            entity__.schemaName = $($(entities__[i]).find('c\\:SchemaName')[0]).html();
            o__.push(entity__);
        }
        return o__;
    },
    deserializeRetrieveFieldsMetadata: function (__response) {
        var o__ = new Object();
        //console.log($(__response)[0]);
        var attributes__ = Array();
        var attributesArr__ = $($($(__response).find('ExecuteResult')[0]).find('c\\:Attributes')[0]).find('c\\:AttributeMetadata');
        var rel1ton__ = $($($(__response).find('ExecuteResult')[0]).find('c\\:OneToManyRelationships')[0]).find('c\\:OneToManyRelationshipMetadata');
        var relnto1__ = $($($(__response).find('ExecuteResult')[0]).find('c\\:ManyToOneRelationships')[0]).find('c\\:OneToManyRelationshipMetadata');
        var relnton__ = $($($(__response).find('ExecuteResult')[0]).find('c\\:ManyToManyRelationships')[0]).find('c\\:ManyToManyRelationshipMetadata');

        o__.PrimaryIdAttribute = $($($(__response).find('ExecuteResult')[0]).find('c\\:PrimaryIdAttribute')[0]).html();
        o__.PrimaryNameAttribute = $($($(__response).find('ExecuteResult')[0]).find('c\\:PrimaryNameAttribute')[0]).html();
        o__.ObjectTypeCode = $($($(__response).find('ExecuteResult')[0]).find('c\\:ObjectTypeCode')[0]).html();
        o__.IsCustomEntity = $($($(__response).find('ExecuteResult')[0]).find('c\\:IsCustomEntity')[0]).html();
        o__.SchemaName = $($($(__response).find('ExecuteResult')[0]).find('c\\:SchemaName')[0]).html();

        for (var i = 0; i < attributesArr__.length; i++) {

            var attribute = new Object();
            attribute.displayName = $($($($(attributesArr__[i]).find('c\\:DisplayName')[0]).find('a\\:LocalizedLabel')[0]).find('a\\:Label')[0]).html();
            attribute.logicalName = $($(attributesArr__[i]).find('c\\:LogicalName')[0]).html();
            attribute.type = $($(attributesArr__[i]).find('c\\:AttributeType')[0]).html();
            attribute.schemaName = $($(attributesArr__[i]).find('c\\:SchemaName')[0]).html();
            attribute.isSearchable = $($(attributesArr__[i]).find('c\\:issearchable')[0]).html();
            if (attribute.type=="Picklist" ) {
                var arrOptions = Array();
                var options = $(attributesArr__[i]).find('c\\:optionset').find('c\\:options').find('c\\:optionmetadata');
                for (var j = 0; j < options.length; j++) {
                    //console.log($(options[j])[0]);
                    var label = $(options[j]).find('c\\:label').find('a\\:userlocalizedlabel').find('a\\:label').html();
                    var value = $(options[j]).find('c\\:value').html();
                    arrOptions.push({value: value, display: label});
                }
                ////console.log(options);
                //HUDCRM_SOAP.global = options;
                attribute.options = arrOptions;
                //console.log(arrOptions);
            }
            if (attribute.type=="Boolean" ) {
                var arrOptions = Array();
                var displayTrue = $(attributesArr__[i]).find('c\\:optionset').find('c\\:trueoption').find('c\\:label').find('a\\:userlocalizedlabel').find('a\\:label').html();
                var displayFalse = $(attributesArr__[i]).find('c\\:optionset').find('c\\:falseoption').find('c\\:label').find('a\\:userlocalizedlabel').find('a\\:label').html();
                
                arrOptions.push({value: true, display: displayTrue});
                arrOptions.push({value: false, display: displayFalse});
                attribute.options = arrOptions;
                //var options = $(attributesArr__[i]).find('c\\:optionset').find('c\\:options').find('c\\:optionmetadata');
                //console.log($(attributesArr__[i])[0]);
            }
            if (attribute.type=="Decimal" ) {
                var precision = $(attributesArr__[i]).find('c\\:precision').html();
                attribute.precision = precision;
            }
            if (attribute.type=="DateTime" ) {
                var format = $(attributesArr__[i]).find('c\\:format').html();
                if(format == "DateOnly"){
                    attribute.dateonly = true;
                }else{
                    attribute.dateonly = false;
                }
                //console.log($(attributesArr__[i])[0]);
            }
            if (attribute.type == "Lookup") {
                var related = $(attributesArr__[i]).find('c\\:targets').find('d\\:string');
                attribute.moreThanOneRelated = true;
                if (related.length == 1) {
                    attribute.relatedEntity = $(related[0]).html();
                    attribute.moreThanOneRelated = false;
                } 
                //console.log($(attributesArr__[i])[0]);
            }
            attributes__.push(attribute);
        }
        o__.attributes = attributes__;
        var relations__ = Array();

        for (var i = 0; i < rel1ton__.length; i++) {

            var relation__ = new Object();
            relation__.schemaName = $($(rel1ton__[i]).find('c\\:SchemaName')[0]).html();
            relation__.referencingEntity = $($(rel1ton__[i]).find('c\\:ReferencingEntity')[0]).html();
            relation__.referencingAttribute = $($(rel1ton__[i]).find('c\\:ReferencingAttribute')[0]).html();
            relation__.referencedEntity = $($(rel1ton__[i]).find('c\\:ReferencedEntity')[0]).html();
            relation__.referencedAttribute = $($(rel1ton__[i]).find('c\\:ReferencedAttribute')[0]).html();
            relation__.type = "1:N";
            relations__.push(relation__);
        }
        for (var i = 0; i < relnto1__.length; i++) {
            var relation__ = new Object();
            relation__.schemaName = $($(relnto1__[i]).find('c\\:SchemaName')[0]).html();
            relation__.referencingEntity = $($(relnto1__[i]).find('c\\:ReferencingEntity')[0]).html();
            relation__.referencingAttribute = $($(relnto1__[i]).find('c\\:ReferencingAttribute')[0]).html();
            relation__.referencedEntity = $($(relnto1__[i]).find('c\\:ReferencedEntity')[0]).html();
            relation__.referencedAttribute = $($(relnto1__[i]).find('c\\:ReferencedAttribute')[0]).html();
            relation__.type = "N:1";
            relations__.push(relation__);
        }


        o__.relations = relations__;

        var relationsNN__ = Array();
        for (var i = 0; i < relnton__.length; i++) {
            var relation__ = new Object();
            relation__.intersectEntityName = $($(relnton__[i]).find('c\\:IntersectEntityName')[0]).html();
            relation__.schemaName = $($(relnton__[i]).find('c\\:SchemaName')[0]).html();
            relation__.entity1Attribute = $($(relnton__[i]).find('c\\:Entity1IntersectAttribute')[0]).html();
            relation__.entity1Entity = $($(relnton__[i]).find('c\\:Entity1LogicalName')[0]).html();
            relation__.entity2Attribute = $($(relnton__[i]).find('c\\:Entity2IntersectAttribute')[0]).html();
            relation__.entity2Entity = $($(relnton__[i]).find('c\\:Entity2LogicalName')[0]).html();
            relation__.type = "N:N";
            relationsNN__.push(relation__);
        }


        o__.relations = relations__;
        o__.relationsNN = relationsNN__;


        return o__;
    },
    deserializeRetrieveEntityMetadataFilteredEntity: function (__response) {
        var o__ = new Object();

        o__.PrimaryIdAttribute = $($($(__response).find('ExecuteResult')[0]).find('c\\:PrimaryIdAttribute')[0]).html();
        o__.PrimaryNameAttribute = $($($(__response).find('ExecuteResult')[0]).find('c\\:PrimaryNameAttribute')[0]).html();
        o__.ObjectTypeCode = $($($(__response).find('ExecuteResult')[0]).find('c\\:ObjectTypeCode')[0]).html();
        o__.IsCustomEntity = $($($(__response).find('ExecuteResult')[0]).find('c\\:IsCustomEntity')[0]).html();
        o__.SchemaName = $($($(__response).find('ExecuteResult')[0]).find('c\\:SchemaName')[0]).html();

        return o__;
    },
};

HUDCRM_SOAP.SCHEMAS = {

    Update_Record: function(__entity, __id, __attributes) {
        var attributes__ = __attributes;
        var req1__ = ["<s:Envelope xmlns:s=\"http://schemas.xmlsoap.org/soap/envelope/\">",
            "<s:Body>",
            "<Update xmlns=\"http://schemas.microsoft.com/xrm/2011/Contracts/Services\" xmlns:i=\"http://www.w3.org/2001/XMLSchema-instance\">",
            "<entity xmlns:a=\"http://schemas.microsoft.com/xrm/2011/Contracts\">",
            "<a:Attributes xmlns:b=\"http://schemas.datacontract.org/2004/07/System.Collections.Generic\">"].join("");

        for (var i = 0; i < attributes__.length; i++) {
            console.log(attributes__[i]);

            if (attributes__[i].type == "Uniqueidentifier") {
                //req1__ = req1__ + HUDCRM_SOAP.SCHEMAS.getSchemaKeyValuePairOfStringAnyGuid(attributes__[i].logicalName, attributes__[i].val);
            } else if (attributes__[i].type == "DateTime") {
                req1__ = req1__ + HUDCRM_SOAP.SCHEMAS.getSchemaKeyValuePairOfStringAnyDateTime(attributes__[i].logicalName, attributes__[i].val);
            } else if (attributes__[i].type == "Lookup") {
               // console.log(attributes__[i]);
                req1__ = req1__ + HUDCRM_SOAP.SCHEMAS.getSchemaKeyValuePairOfStringAnyEntityReference(attributes__[i].logicalName, attributes__[i].entityRelated, attributes__[i].val);
            } else if (attributes__[i].type == "Owner") {
                req1__ = req1__ + HUDCRM_SOAP.SCHEMAS.getSchemaKeyValuePairOfStringAnyEntityReference(attributes__[i].logicalName, attributes__[i].entityRelated, attributes__[i].val);
            } else if (attributes__[i].type == "State") {
                //req1__ = req1__ + HUDCRM_ASYNC.getSchemaKeyValuePairOfStringAnyDateTime(attributes__[i].logicalName, attributes__[i].val);
            } else if (attributes__[i].type == "Status") {
                //req1__ = req1__ + HUDCRM_ASYNC.getSchemaKeyValuePairOfStringAnyDateTime(attributes__[i].logicalName, attributes__[i].val);
            } else if (attributes__[i].type == "Integer") {
                req1__ = req1__ + HUDCRM_SOAP.SCHEMAS.getSchemaKeyValuePairOfStringAnyInteger(attributes__[i].logicalName, attributes__[i].val);
            } else if (attributes__[i].type == "Memo") {
                req1__ = req1__ + HUDCRM_SOAP.SCHEMAS.getSchemaKeyValuePairOfStringAnyString(attributes__[i].logicalName, attributes__[i].val);
            } else if (attributes__[i].type == "String") {
                req1__ = req1__ + HUDCRM_SOAP.SCHEMAS.getSchemaKeyValuePairOfStringAnyString(attributes__[i].logicalName, attributes__[i].val);
            } else if (attributes__[i].type == "Picklist") {
                req1__ = req1__ + HUDCRM_SOAP.SCHEMAS.getSchemaKeyValuePairOfStringAnyOptionSetValue(attributes__[i].logicalName, attributes__[i].val);
            } else if (attributes__[i].type == "Decimal") {
                req1__ = req1__ + HUDCRM_SOAP.SCHEMAS.getSchemaKeyValuePairOfStringAnyDecimal(attributes__[i].logicalName, attributes__[i].val);
            } else if (attributes__[i].type == "Boolean") {
                req1__ = req1__ + HUDCRM_SOAP.SCHEMAS.getSchemaKeyValuePairOfStringAnyBoolean(attributes__[i].logicalName, attributes__[i].val);
            } else if (attributes__[i].type == "Double") {
                req1__ = req1__ + HUDCRM_SOAP.SCHEMAS.getSchemaKeyValuePairOfStringAnyDouble(attributes__[i].logicalName, attributes__[i].val);
            } else if (attributes__[i].type == "Money") {
                req1__ = req1__ + HUDCRM_SOAP.SCHEMAS.getSchemaKeyValuePairOfStringAnyMoney(attributes__[i].logicalName, attributes__[i].val);
            }
        }

        var req2__ = ["</a:Attributes>",
            "<a:EntityState i:nil=\"true\" />",
            "<a:FormattedValues xmlns:b=\"http://schemas.datacontract.org/2004/07/System.Collections.Generic\" />",
            "<a:Id>" + __id + "</a:Id>",
            "<a:KeyAttributes xmlns:b=\"http://schemas.microsoft.com/xrm/7.1/Contracts\" xmlns:c=\"http://schemas.datacontract.org/2004/07/System.Collections.Generic\" />",
            "<a:LogicalName>" + __entity + "</a:LogicalName>",
            "<a:RelatedEntities xmlns:b=\"http://schemas.datacontract.org/2004/07/System.Collections.Generic\" />",
            "<a:RowVersion i:nil=\"true\" />",
            "</entity>",
            "</Update>",
            "</s:Body>",
            "</s:Envelope>"].join("");

        var req__ = req1__ + req2__;
        console.log($(req__)[0]);
        return req__;

    },
    getSchemaKeyValuePairOfStringAnyDouble: function(__key, __value) {
        return ["<a:KeyValuePairOfstringanyType>",
            "<b:key>" + __key + "</b:key>",
            "<b:value i:type=\"c:double\" xmlns:c=\"http://www.w3.org/2001/XMLSchema\">" + __value + "</b:value>",
            "</a:KeyValuePairOfstringanyType>"].join("");
    },
    getSchemaKeyValuePairOfStringAnyBoolean: function(__key, __value) {
        var value__ = __value;

        var formttedvalue__ = value__;
        if (value__ == "1" || value__.toLowerCase() == "si" || value__.toLowerCase() == "s" || value__.toLowerCase() == "yes" || value__.toLowerCase() == "y" || value__.toLowerCase() == "true") {
            formttedvalue__ = true;
        } else if (value__ == "0" || value__.toLowerCase() == "no" || value__.toLowerCase() == "n" || value__.toLowerCase() == "false") {
            formttedvalue__ = false;
        } else {
            formttedvalue__ = value__;
        }

        return ["<a:KeyValuePairOfstringanyType>",
            "<b:key>" + __key + "</b:key>",
            "<b:value i:type=\"c:boolean\" xmlns:c=\"http://www.w3.org/2001/XMLSchema\">" + formttedvalue__ + "</b:value>",
            "</a:KeyValuePairOfstringanyType>"].join("");
    },
    getSchemaKeyValuePairOfStringAnyInteger: function(__key, __value) {
        return ["<a:KeyValuePairOfstringanyType>",
            "<b:key>" + __key + "</b:key>",
            "<b:value i:type=\"c:int\" xmlns:c=\"http://www.w3.org/2001/XMLSchema\">" + __value + "</b:value>",
            "</a:KeyValuePairOfstringanyType>"].join("");
    },
    getSchemaKeyValuePairOfStringAnyDateTime: function(__key, __value) {
        return ["<a:KeyValuePairOfstringanyType>",
            "<b:key>" + __key + "</b:key>",
            "<b:value i:type=\"c:dateTime\" xmlns:c=\"http://www.w3.org/2001/XMLSchema\">" + __value + "</b:value>",
            "</a:KeyValuePairOfstringanyType>"].join("");
    },
    getSchemaKeyValuePairOfStringAnyGuid: function(__key, __value) {
        return ["<a:KeyValuePairOfstringanyType>",
            "<b:key>" + __key + "</b:key>",
            "<b:value i:type=\"c:guid\" xmlns:c=\"http://schemas.microsoft.com/2003/10/Serialization/\">" + __value + "</b:value>",
            "</a:KeyValuePairOfstringanyType>"].join("");
    },
    getSchemaKeyValuePairOfStringAnyString: function(__key, __value) {
        return ["<a:KeyValuePairOfstringanyType>",
            "<b:key>" + __key + "</b:key>",
            "<b:value i:type=\"c:string\" xmlns:c=\"http://www.w3.org/2001/XMLSchema\">" + __value + "</b:value>",
            "</a:KeyValuePairOfstringanyType>"].join("");

    },
    getSchemaKeyValuePairOfStringAnyDecimal: function(__key, __value) {
        return ["<a:KeyValuePairOfstringanyType>",
            "<b:key>" + __key + "</b:key>",
            "<b:value i:type=\"c:decimal\" xmlns:c=\"http://www.w3.org/2001/XMLSchema\">" + __value + "</b:value>",
            "</a:KeyValuePairOfstringanyType>"].join("");

    },
    getSchemaKeyValuePairOfStringAnyEntityReference: function (__key, __entity, __id) {
        if (__id == null || __id=="") {
            return ["<a:KeyValuePairOfstringanyType>",
                "<b:key>" + __key + "</b:key>",
                "<b:value i:nil=\"true\" />",
                "</a:KeyValuePairOfstringanyType>"].join("");
        }
        return ["<a:KeyValuePairOfstringanyType>",
            "<b:key>" + __key + "</b:key>",
            "<b:value i:type=\"a:EntityReference\">",
            "<a:Id>" + __id + "</a:Id>",
            "<a:KeyAttributes xmlns:c=\"http://schemas.microsoft.com/xrm/7.1/Contracts\" />",
            "<a:LogicalName>" + __entity + "</a:LogicalName>",
            "<a:Name i:nil=\"true\" />",
            "<a:RowVersion i:nil=\"true\" />",
            "</b:value>",
            "</a:KeyValuePairOfstringanyType>"].join("");

    },
    getSchemaKeyValuePairOfStringAnyOptionSetValue: function (__key, __value) {
        if (__value == null || __value == "") {
            return ["<a:KeyValuePairOfstringanyType>",
                "<b:key>" + __key + "</b:key>",
                "<b:value i:nil=\"true\" />",
                "</a:KeyValuePairOfstringanyType>",].join("");
        }
        return ["<a:KeyValuePairOfstringanyType>",
            "<b:key>" + __key + "</b:key>",
            "<b:value i:type=\"a:OptionSetValue\">",
            "<a:Value>" + __value + "</a:Value>",
            "</b:value>",
            "</a:KeyValuePairOfstringanyType>",].join("");

    },
    getSchemaKeyValuePairOfStringAnyMoney: function (__key, __value) {
        if (__value == null || __value == "") {
            return ["<a:KeyValuePairOfstringanyType>",
                "<b:key>" + __key + "</b:key>",
                "<b:value i:nil=\"true\" />",
                "</a:KeyValuePairOfstringanyType>",].join("");
        }
        return ["<a:KeyValuePairOfstringanyType>",
            "<b:key>" + __key + "</b:key>",
            "<b:value i:type=\"a:Money\">",
            "<a:Value>" + __value + "</a:Value>",
            "</b:value>",
            "</a:KeyValuePairOfstringanyType>",].join("");
    },
    RetrieveMultiple_USDItemsOfConfiguration: function (entity, fieldName, fieldId, configurationId, intersectionEntity) {

        //console.log(entity);
        //console.log(fieldName);
        //console.log(fieldId);
        //console.log(configurationId);

        var request = ["<s:Envelope xmlns:s=\"http://schemas.xmlsoap.org/soap/envelope/\">",
            "<s:Body>",
            "<RetrieveMultiple xmlns=\"http://schemas.microsoft.com/xrm/2011/Contracts/Services\" xmlns:i=\"http://www.w3.org/2001/XMLSchema-instance\">",
            "<query i:type=\"a:QueryExpression\" xmlns:a=\"http://schemas.microsoft.com/xrm/2011/Contracts\">",
            "<a:ColumnSet>",
            "<a:AllColumns>true</a:AllColumns>",
            "<a:Columns xmlns:b=\"http://schemas.microsoft.com/2003/10/Serialization/Arrays\" />",
            "</a:ColumnSet>",
            "<a:Criteria>",
            "<a:Conditions>",
            "<a:ConditionExpression>",
            "<a:AttributeName>statecode</a:AttributeName>",
            "<a:Operator>Equal</a:Operator>",
            "<a:Values xmlns:b=\"http://schemas.microsoft.com/2003/10/Serialization/Arrays\">",
            "<b:anyType i:type=\"c:int\" xmlns:c=\"http://www.w3.org/2001/XMLSchema\">0</b:anyType>",
            "</a:Values>",
            "<a:EntityName i:nil=\"true\" />",
            "</a:ConditionExpression>",
            "</a:Conditions>",
            "<a:FilterOperator>And</a:FilterOperator>",
            "<a:Filters />",
            "</a:Criteria>",
            "<a:Distinct>false</a:Distinct>",
            "<a:EntityName>" + entity + "</a:EntityName>",
            "<a:LinkEntities>",
            "<a:LinkEntity>",
            "<a:Columns>",
            "<a:AllColumns>true</a:AllColumns>",
            "<a:Columns xmlns:b=\"http://schemas.microsoft.com/2003/10/Serialization/Arrays\" />",
            "</a:Columns>",
            "<a:EntityAlias>config</a:EntityAlias>",
            "<a:JoinOperator>Inner</a:JoinOperator>",
            "<a:LinkCriteria>",
            "<a:Conditions>",
            "<a:ConditionExpression>",
            "<a:AttributeName>msdyusd_configurationid</a:AttributeName>",
            "<a:Operator>Equal</a:Operator>",
            "<a:Values xmlns:b=\"http://schemas.microsoft.com/2003/10/Serialization/Arrays\">",
            "<b:anyType i:type=\"c:guid\" xmlns:c=\"http://schemas.microsoft.com/2003/10/Serialization/\">" + configurationId + "</b:anyType>",
            "</a:Values>",
            "<a:EntityName i:nil=\"true\" />",
            "</a:ConditionExpression>",
            "</a:Conditions>",
            "<a:FilterOperator>And</a:FilterOperator>",
            "<a:Filters />",
            "</a:LinkCriteria>",
            "<a:LinkEntities />",
            "<a:LinkFromAttributeName>" + fieldId + "</a:LinkFromAttributeName>",
            "<a:LinkFromEntityName>" + entity + "</a:LinkFromEntityName>",
            "<a:LinkToAttributeName>" + fieldId + "</a:LinkToAttributeName>",
            "<a:LinkToEntityName>" + intersectionEntity + "</a:LinkToEntityName>",
            "<a:Orders />",
            "</a:LinkEntity>",
            "</a:LinkEntities>",
            "<a:Orders />",
            "<a:PageInfo>",
            "<a:Count>0</a:Count>",
            "<a:PageNumber>0</a:PageNumber>",
            "<a:PagingCookie i:nil=\"true\" />",
            "<a:ReturnTotalRecordCount>false</a:ReturnTotalRecordCount>",
            "</a:PageInfo>",
            "<a:NoLock>false</a:NoLock>",
            "</query>",
            "</RetrieveMultiple>",
            "</s:Body>",
            "</s:Envelope>"].join("");

        //var request = ["<s:Envelope xmlns:s=\"http://schemas.xmlsoap.org/soap/envelope/\">",
        //    "<s:Body>",
        //    "<RetrieveMultiple xmlns=\"http://schemas.microsoft.com/xrm/2011/Contracts/Services\" xmlns:i=\"http://www.w3.org/2001/XMLSchema-instance\">",
        //    "<query i:type=\"a:QueryExpression\" xmlns:a=\"http://schemas.microsoft.com/xrm/2011/Contracts\">",
        //    //"<a:ColumnSet>",
        //    //"<a:AllColumns>false</a:AllColumns>",
        //    //"<a:Columns xmlns:b=\"http://schemas.microsoft.com/2003/10/Serialization/Arrays\">",
        //    //"<b:string>" + fieldName + "</b:string>",
        //    //"</a:Columns>",
        //    //"</a:ColumnSet>",
        //    "<a:ColumnSet>",
        //    "<a:AllColumns>true</a:AllColumns>",
        //    "<a:Columns xmlns:b=\"http://schemas.microsoft.com/2003/10/Serialization/Arrays\" />",
        //    "</a:ColumnSet>",
        //    "<a:Criteria>",
        //    "<a:Conditions>",
        //    "<a:ConditionExpression>",
        //    "<a:AttributeName>statecode</a:AttributeName>",
        //    "<a:Operator>Equal</a:Operator>",
        //    "<a:Values xmlns:b=\"http://schemas.microsoft.com/2003/10/Serialization/Arrays\">",
        //    "<b:anyType i:type=\"c:int\" xmlns:c=\"http://www.w3.org/2001/XMLSchema\">0</b:anyType>",
        //    "</a:Values>",
        //    "<a:EntityName i:nil=\"true\" />",
        //    "</a:ConditionExpression>",
        //    "</a:Conditions>",
        //    "<a:FilterOperator>And</a:FilterOperator>",
        //    "<a:Filters />",
        //    "</a:Criteria>",
        //    "<a:Distinct>false</a:Distinct>",
        //    "<a:EntityName>" + entity + "</a:EntityName>",
        //    "<a:LinkEntities>",
        //    "<a:LinkEntity>",
        //    "<a:Columns>",
        //    "<a:AllColumns>false</a:AllColumns>",
        //    "<a:Columns xmlns:b=\"http://schemas.microsoft.com/2003/10/Serialization/Arrays\" />",
        //    "</a:Columns>",
        //    "<a:EntityAlias i:nil=\"true\" />",
        //    "<a:JoinOperator>Inner</a:JoinOperator>",
        //    "<a:LinkCriteria>",
        //    "<a:Conditions>",
        //    "<a:ConditionExpression>",
        //    "<a:AttributeName>msdyusd_configurationid</a:AttributeName>",
        //    "<a:Operator>Equal</a:Operator>",
        //    "<a:Values xmlns:b=\"http://schemas.microsoft.com/2003/10/Serialization/Arrays\">",
        //    "<b:anyType i:type=\"c:guid\" xmlns:c=\"http://schemas.microsoft.com/2003/10/Serialization/\">" + configurationId + "</b:anyType>",
        //    "</a:Values>",
        //    "<a:EntityName i:nil=\"true\" />",
        //    "</a:ConditionExpression>",
        //    "</a:Conditions>",
        //    "<a:FilterOperator>And</a:FilterOperator>",
        //    "<a:Filters />",
        //    "</a:LinkCriteria>",
        //    "<a:LinkEntities />",
        //    "<a:LinkFromAttributeName>" + fieldId + "</a:LinkFromAttributeName>",
        //    "<a:LinkFromEntityName>" + entity + "</a:LinkFromEntityName>",
        //    "<a:LinkToAttributeName>" + fieldId + "</a:LinkToAttributeName>",
        //    "<a:LinkToEntityName>msdyusd_configuration_hostedcontrol</a:LinkToEntityName>",
        //    "<a:Orders />",
        //    "</a:LinkEntity>",
        //    "</a:LinkEntities>",
        //    "<a:Orders />",
        //    "<a:PageInfo>",
        //    "<a:Count>0</a:Count>",
        //    "<a:PageNumber>0</a:PageNumber>",
        //    "<a:PagingCookie i:nil=\"true\" />",
        //    "<a:ReturnTotalRecordCount>false</a:ReturnTotalRecordCount>",
        //    "</a:PageInfo>",
        //    "<a:NoLock>false</a:NoLock>",
        //    "</query>",
        //    "</RetrieveMultiple>",
        //    "</s:Body>",
        //    "</s:Envelope>"].join("");
        return request;
    },
    RetrieveMultiple_USDConfigurations: function (entity, field) {
        var request = ["<s:Envelope xmlns:s=\"http://schemas.xmlsoap.org/soap/envelope/\">",
            "<s:Body>",
            "<RetrieveMultiple xmlns=\"http://schemas.microsoft.com/xrm/2011/Contracts/Services\" xmlns:i=\"http://www.w3.org/2001/XMLSchema-instance\">",
            "<query i:type=\"a:QueryExpression\" xmlns:a=\"http://schemas.microsoft.com/xrm/2011/Contracts\">",
            "<a:ColumnSet>",
            "<a:AllColumns>false</a:AllColumns>",
            "<a:Columns xmlns:b=\"http://schemas.microsoft.com/2003/10/Serialization/Arrays\">",
            "<b:string>" + field + "</b:string>",
            "</a:Columns>",
            "</a:ColumnSet>",
            "<a:Criteria>",
            "<a:Conditions />",
            "<a:FilterOperator>And</a:FilterOperator>",
            "<a:Filters>",
            "<a:FilterExpression>",
            "<a:Conditions>",
            "<a:ConditionExpression>",
            "<a:AttributeName>statecode</a:AttributeName>",
            "<a:Operator>Equal</a:Operator>",
            "<a:Values xmlns:b=\"http://schemas.microsoft.com/2003/10/Serialization/Arrays\">",
            "<b:anyType i:type=\"c:int\" xmlns:c=\"http://www.w3.org/2001/XMLSchema\">0</b:anyType>",
            "</a:Values>",
            "<a:EntityName i:nil=\"true\" />",
            "</a:ConditionExpression>",
            "</a:Conditions>",
            "<a:FilterOperator>And</a:FilterOperator>",
            "<a:Filters />",
            "</a:FilterExpression>",
            "</a:Filters>",
            "</a:Criteria>",
            "<a:Distinct>false</a:Distinct>",
            "<a:EntityName>" + entity + "</a:EntityName>",
            "<a:LinkEntities />",
            "<a:Orders />",
            "<a:PageInfo>",
            "<a:Count>0</a:Count>",
            "<a:PageNumber>0</a:PageNumber>",
            "<a:PagingCookie i:nil=\"true\" />",
            "<a:ReturnTotalRecordCount>false</a:ReturnTotalRecordCount>",
            "</a:PageInfo>",
            "<a:NoLock>false</a:NoLock>",
            "</query>",
            "</RetrieveMultiple>",
            "</s:Body>",
            "</s:Envelope>"].join("");
        return request;
    },
    RetrieveMultiple_CheckHostedControls: function () {
        var request = ["<s:Envelope xmlns:s=\"http://schemas.xmlsoap.org/soap/envelope/\">",
            "<s:Body>",
            "<RetrieveMultiple xmlns=\"http://schemas.microsoft.com/xrm/2011/Contracts/Services\" xmlns:i=\"http://www.w3.org/2001/XMLSchema-instance\">",
            "<query i:type=\"a:QueryExpression\" xmlns:a=\"http://schemas.microsoft.com/xrm/2011/Contracts\">",
            "<a:ColumnSet>",
            "<a:AllColumns>false</a:AllColumns>",
            "<a:Columns xmlns:b=\"http://schemas.microsoft.com/2003/10/Serialization/Arrays\" />",
            "</a:ColumnSet>",
            "<a:Criteria>",
            "<a:Conditions />",
            "<a:FilterOperator>And</a:FilterOperator>",
            "<a:Filters />",
            "</a:Criteria>",
            "<a:Distinct>false</a:Distinct>",
            "<a:EntityName>uii_hostedapplication</a:EntityName>",
            "<a:LinkEntities />",
            "<a:Orders />",
            "<a:PageInfo>",
            "<a:Count>0</a:Count>",
            "<a:PageNumber>0</a:PageNumber>",
            "<a:PagingCookie i:nil=\"true\" />",
            "<a:ReturnTotalRecordCount>false</a:ReturnTotalRecordCount>",
            "</a:PageInfo>",
            "<a:NoLock>false</a:NoLock>",
            "<a:TopCount>1</a:TopCount>",
            "</query>",
            "</RetrieveMultiple>",
            "</s:Body>",
            "</s:Envelope>"].join("");
        return request;
    },

    Execute_PublishWebresource: function (__id) {
        return ["<s:Envelope xmlns:s=\"http://schemas.xmlsoap.org/soap/envelope/\">",
            "<s:Body>",
            "<Execute xmlns=\"http://schemas.microsoft.com/xrm/2011/Contracts/Services\" xmlns:i=\"http://www.w3.org/2001/XMLSchema-instance\">",
            "<request i:type=\"b:PublishXmlRequest\" xmlns:a=\"http://schemas.microsoft.com/xrm/2011/Contracts\" xmlns:b=\"http://schemas.microsoft.com/crm/2011/Contracts\">",
            "<a:Parameters xmlns:c=\"http://schemas.datacontract.org/2004/07/System.Collections.Generic\">",
            "<a:KeyValuePairOfstringanyType>",
            "<c:key>ParameterXml</c:key>",
            "<c:value i:type=\"d:string\" xmlns:d=\"http://www.w3.org/2001/XMLSchema\">&lt;importexportxml&gt;",
            "&lt;webresources&gt;",
            "&lt;webresource&gt;{" + __id + "}&lt;/webresource&gt;",
            "&lt;/webresources&gt;",
            "&lt;/importexportxml&gt;</c:value>",
            "</a:KeyValuePairOfstringanyType>",
            "</a:Parameters>",
            "<a:RequestId i:nil=\"true\" />",
            "<a:RequestName>PublishXml</a:RequestName>",
            "</request>",
            "</Execute>",
            "</s:Body>",
            "</s:Envelope>"].join("");
    },

    Update_Webresource: function (__id, content) {
        return ["<s:Envelope xmlns:s=\"http://schemas.xmlsoap.org/soap/envelope/\">",
            "<s:Body>",
            "<Update xmlns=\"http://schemas.microsoft.com/xrm/2011/Contracts/Services\" xmlns:i=\"http://www.w3.org/2001/XMLSchema-instance\">",
            "<entity xmlns:a=\"http://schemas.microsoft.com/xrm/2011/Contracts\">",
            "<a:Attributes xmlns:b=\"http://schemas.datacontract.org/2004/07/System.Collections.Generic\">",
            "<a:KeyValuePairOfstringanyType>",
            "<b:key>content</b:key>",
            "<b:value i:type=\"c:string\" xmlns:c=\"http://www.w3.org/2001/XMLSchema\">" + content + "</b:value>",
            "</a:KeyValuePairOfstringanyType>",
            "</a:Attributes>",
            "<a:EntityState i:nil=\"true\" />",
            "<a:FormattedValues xmlns:b=\"http://schemas.datacontract.org/2004/07/System.Collections.Generic\" />",
            "<a:Id>" + __id + "</a:Id>",
            "<a:KeyAttributes xmlns:b=\"http://schemas.microsoft.com/xrm/7.1/Contracts\" xmlns:c=\"http://schemas.datacontract.org/2004/07/System.Collections.Generic\" />",
            "<a:LogicalName>webresource</a:LogicalName>",
            "<a:RelatedEntities xmlns:b=\"http://schemas.datacontract.org/2004/07/System.Collections.Generic\" />",
            "<a:RowVersion i:nil=\"true\" />",
            "</entity>",
            "</Update>",
            "</s:Body>",
            "</s:Envelope>"].join("");
    },
     Retrieve_Record: function (__id, entity) {
        return  ["<s:Envelope xmlns:s=\"http://schemas.xmlsoap.org/soap/envelope/\">",
                "<s:Body>",
                "<Retrieve xmlns=\"http://schemas.microsoft.com/xrm/2011/Contracts/Services\" xmlns:i=\"http://www.w3.org/2001/XMLSchema-instance\">",
                "<entityName>" + entity + "</entityName>",
                "<id>" + __id + "</id>",
                "<columnSet xmlns:a=\"http://schemas.microsoft.com/xrm/2011/Contracts\">",
                "<a:AllColumns>true</a:AllColumns>",
                "<a:Columns xmlns:b=\"http://schemas.microsoft.com/2003/10/Serialization/Arrays\" />",
                "</columnSet>",
                "</Retrieve>",
                "</s:Body>",
                "</s:Envelope>"].join("");
    },


    Retrieve_RecordPrimaryFieldValue: function (__id, entity, primaryField) {
        return ["<s:Envelope xmlns:s=\"http://schemas.xmlsoap.org/soap/envelope/\">",
            "<s:Body>",
            "<Retrieve xmlns=\"http://schemas.microsoft.com/xrm/2011/Contracts/Services\" xmlns:i=\"http://www.w3.org/2001/XMLSchema-instance\">",
            "<entityName>" + entity + "</entityName>",
            "<id>" + __id + "</id>",
            "<columnSet xmlns:a=\"http://schemas.microsoft.com/xrm/2011/Contracts\">",
            "<a:AllColumns>false</a:AllColumns>",
            "<a:Columns xmlns:b=\"http://schemas.microsoft.com/2003/10/Serialization/Arrays\">",
            "<b:string>" + primaryField + "</b:string>",
            "</a:Columns>",
            "</columnSet>",
            "</Retrieve>",
            "</s:Body>",
            "</s:Envelope>"].join("");
    },

    Retrieve_Webresource: function (__id) {
        return ["<s:Envelope xmlns:s=\"http://schemas.xmlsoap.org/soap/envelope/\">",
            "<s:Body>",
            "<Retrieve xmlns=\"http://schemas.microsoft.com/xrm/2011/Contracts/Services\" xmlns:i=\"http://www.w3.org/2001/XMLSchema-instance\">",
            "<entityName>webresource</entityName>",
            "<id>" + __id + "</id>",
            "<columnSet xmlns:a=\"http://schemas.microsoft.com/xrm/2011/Contracts\">",
            "<a:AllColumns>false</a:AllColumns>",
            "<a:Columns xmlns:b=\"http://schemas.microsoft.com/2003/10/Serialization/Arrays\">",
            "<b:string>content</b:string>",
            "<b:string>name</b:string>",
            "<b:string>webresourcetype</b:string>",
            "<b:string>modifiedon</b:string>",
            "<b:string>modifiedby</b:string>",
            "</a:Columns>",
            "</columnSet>",
            "</Retrieve>",
            "</s:Body>",
            "</s:Envelope>"].join("");
    },
    RetrieveMultiple_SolutionComponents: function (solutions) {
        var request = ["<s:Envelope xmlns:s=\"http://schemas.xmlsoap.org/soap/envelope/\">",
            "<s:Body>",
            "<RetrieveMultiple xmlns=\"http://schemas.microsoft.com/xrm/2011/Contracts/Services\" xmlns:i=\"http://www.w3.org/2001/XMLSchema-instance\">",
            "<query i:type=\"a:QueryExpression\" xmlns:a=\"http://schemas.microsoft.com/xrm/2011/Contracts\">",
            "<a:ColumnSet>",
            "<a:AllColumns>false</a:AllColumns>",
            "<a:Columns xmlns:b=\"http://schemas.microsoft.com/2003/10/Serialization/Arrays\">",
            "<b:string>solutionid</b:string>",
            "<b:string>objectid</b:string>",
            "</a:Columns>",
            "</a:ColumnSet>",
            "<a:Criteria>",
            "<a:Conditions />",
            "<a:FilterOperator>And</a:FilterOperator>",
            "<a:Filters>",
            "<a:FilterExpression>",
            "<a:Conditions>",
            "<a:ConditionExpression>",
            "<a:AttributeName>solutionid</a:AttributeName>",
            "<a:Operator>In</a:Operator>",
            "<a:Values xmlns:b=\"http://schemas.microsoft.com/2003/10/Serialization/Arrays\">"].join("");
        for (var i = 0; i < solutions.length; i++) {
            request += "<b:anyType i:type=\"c:guid\" xmlns:c=\"http://schemas.microsoft.com/2003/10/Serialization/\">" + solutions[i].values["solutionid"] + "</b:anyType>";
        }
           
        request += ["<b:anyType i:type=\"c:guid\" xmlns:c=\"http://schemas.microsoft.com/2003/10/Serialization/\">515be353-1d0e-e711-80f2-5065f38b3601</b:anyType>",
            "</a:Values>",
            "<a:EntityName i:nil=\"true\" />",
            "</a:ConditionExpression>",
            "<a:ConditionExpression>",
            "<a:AttributeName>componenttype</a:AttributeName>",
            "<a:Operator>Equal</a:Operator>",
            "<a:Values xmlns:b=\"http://schemas.microsoft.com/2003/10/Serialization/Arrays\">",
            "<b:anyType i:type=\"c:int\" xmlns:c=\"http://www.w3.org/2001/XMLSchema\">61</b:anyType>",
            "</a:Values>",
            "<a:EntityName i:nil=\"true\" />",
            "</a:ConditionExpression>",
            "</a:Conditions>",
            "<a:FilterOperator>And</a:FilterOperator>",
            "<a:Filters />",
            "</a:FilterExpression>",
            "</a:Filters>",
            "</a:Criteria>",
            "<a:Distinct>false</a:Distinct>",
            "<a:EntityName>solutioncomponent</a:EntityName>",
            "<a:LinkEntities />",
            "<a:Orders />",
            "<a:PageInfo>",
            "<a:Count>0</a:Count>",
            "<a:PageNumber>0</a:PageNumber>",
            "<a:PagingCookie i:nil=\"true\" />",
            "<a:ReturnTotalRecordCount>false</a:ReturnTotalRecordCount>",
            "</a:PageInfo>",
            "<a:NoLock>false</a:NoLock>",
            "</query>",
            "</RetrieveMultiple>",
            "</s:Body>",
            "</s:Envelope>"].join("");
        //console.log((request));
        return request;
    },

    RetrieveMultiple_Webresources: function (wrs) {
        var request = ["<s:Envelope xmlns:s=\"http://schemas.xmlsoap.org/soap/envelope/\">",
            "<s:Body>",
            "<RetrieveMultiple xmlns=\"http://schemas.microsoft.com/xrm/2011/Contracts/Services\" xmlns:i=\"http://www.w3.org/2001/XMLSchema-instance\">",
            "<query i:type=\"a:QueryExpression\" xmlns:a=\"http://schemas.microsoft.com/xrm/2011/Contracts\">",
            "<a:ColumnSet>",
            "<a:AllColumns>false</a:AllColumns>",
            "<a:Columns xmlns:b=\"http://schemas.microsoft.com/2003/10/Serialization/Arrays\">",
            "<b:string>webresourceid</b:string>",
            "<b:string>name</b:string>",
            "<b:string>webresourcetype</b:string>",
            "</a:Columns>",
            "</a:ColumnSet>",
            "<a:Criteria>",
            "<a:Conditions />",
            "<a:FilterOperator>And</a:FilterOperator>",
            "<a:Filters>",
            "<a:FilterExpression>",
            "<a:Conditions>",
            "<a:ConditionExpression>",
            "<a:AttributeName>name</a:AttributeName>",
            "<a:Operator>In</a:Operator>",
            "<a:Values xmlns:b=\"http://schemas.microsoft.com/2003/10/Serialization/Arrays\">"].join("");
        for (var i = 0; i < wrs.length; i++) {
            request += "<b:anyType i:type=\"c:string\" xmlns:c=\"http://www.w3.org/2001/XMLSchema\">" + wrs[i] + "</b:anyType>";
        }
        request += ["</a:Values>",
            "<a:EntityName i:nil=\"true\" />",
            "</a:ConditionExpression>",
            "</a:Conditions>",
            "<a:FilterOperator>And</a:FilterOperator>",
            "<a:Filters />",
            "</a:FilterExpression>",
            "</a:Filters>",
            "</a:Criteria>",
            "<a:Distinct>false</a:Distinct>",
            "<a:EntityName>webresource</a:EntityName>",
            "<a:LinkEntities />",
            "<a:Orders />",
            "<a:PageInfo>",
            "<a:Count>0</a:Count>",
            "<a:PageNumber>0</a:PageNumber>",
            "<a:PagingCookie i:nil=\"true\" />",
            "<a:ReturnTotalRecordCount>false</a:ReturnTotalRecordCount>",
            "</a:PageInfo>",
            "<a:NoLock>false</a:NoLock>",
            "</query>",
            "</RetrieveMultiple>",
            "</s:Body>",
            "</s:Envelope>"].join("");
        return request;
    },

    RetrieveMultiple_Solutions: function () {
        return ["<s:Envelope xmlns:s=\"http://schemas.xmlsoap.org/soap/envelope/\">",
        "<s:Body>",
        "<RetrieveMultiple xmlns=\"http://schemas.microsoft.com/xrm/2011/Contracts/Services\" xmlns:i=\"http://www.w3.org/2001/XMLSchema-instance\">",
        "<query i:type=\"a:QueryExpression\" xmlns:a=\"http://schemas.microsoft.com/xrm/2011/Contracts\">",
        "<a:ColumnSet>",
        "<a:AllColumns>false</a:AllColumns>",
        "<a:Columns xmlns:b=\"http://schemas.microsoft.com/2003/10/Serialization/Arrays\">",
        "<b:string>solutionid</b:string>",
        "<b:string>uniquename</b:string>",
        "</a:Columns>",
        "</a:ColumnSet>",
        "<a:Criteria>",
        "<a:Conditions />",
        "<a:FilterOperator>And</a:FilterOperator>",
        "<a:Filters>",
        "<a:FilterExpression>",
        "<a:Conditions>",
        "<a:ConditionExpression>",
        "<a:AttributeName>ismanaged</a:AttributeName>",
        "<a:Operator>Equal</a:Operator>",
        "<a:Values xmlns:b=\"http://schemas.microsoft.com/2003/10/Serialization/Arrays\">",
        "<b:anyType i:type=\"c:boolean\" xmlns:c=\"http://www.w3.org/2001/XMLSchema\">false</b:anyType>",
        "</a:Values>",
        "<a:EntityName i:nil=\"true\" />",
        "</a:ConditionExpression>",
        "<a:ConditionExpression>",
        "<a:AttributeName>uniquename</a:AttributeName>",
        "<a:Operator>NotIn</a:Operator>",
        "<a:Values xmlns:b=\"http://schemas.microsoft.com/2003/10/Serialization/Arrays\">",
        "<b:anyType i:type=\"c:string\" xmlns:c=\"http://www.w3.org/2001/XMLSchema\">Active</b:anyType>",
        "<b:anyType i:type=\"c:string\" xmlns:c=\"http://www.w3.org/2001/XMLSchema\">Default</b:anyType>",
        "<b:anyType i:type=\"c:string\" xmlns:c=\"http://www.w3.org/2001/XMLSchema\">Basic</b:anyType>",
        "</a:Values>",
        "<a:EntityName i:nil=\"true\" />",
        "</a:ConditionExpression>",
        "</a:Conditions>",
        "<a:FilterOperator>And</a:FilterOperator>",
        "<a:Filters />",
        "</a:FilterExpression>",
        "</a:Filters>",
        "</a:Criteria>",
        "<a:Distinct>false</a:Distinct>",
        "<a:EntityName>solution</a:EntityName>",
        "<a:LinkEntities />",
        "<a:Orders />",
        "<a:PageInfo>",
        "<a:Count>0</a:Count>",
        "<a:PageNumber>0</a:PageNumber>",
        "<a:PagingCookie i:nil=\"true\" />",
        "<a:ReturnTotalRecordCount>false</a:ReturnTotalRecordCount>",
        "</a:PageInfo>",
        "<a:NoLock>false</a:NoLock>",
        "</query>",
        "</RetrieveMultiple>",
        "</s:Body>",
        "</s:Envelope>"].join("");
    },


    RetrieveMultiple_Filter: function (__entityname, __primaryfieldname, __filtername, __orderbyDescField) {
        return  ["<s:Envelope xmlns:s=\"http://schemas.xmlsoap.org/soap/envelope/\">",
                    "<s:Body>",
                    "<RetrieveMultiple xmlns=\"http://schemas.microsoft.com/xrm/2011/Contracts/Services\" xmlns:i=\"http://www.w3.org/2001/XMLSchema-instance\">",
                    "<query i:type=\"a:QueryExpression\" xmlns:a=\"http://schemas.microsoft.com/xrm/2011/Contracts\">",
                    "<a:ColumnSet>",
                    "<a:AllColumns>false</a:AllColumns>",
                    "<a:Columns xmlns:b=\"http://schemas.microsoft.com/2003/10/Serialization/Arrays\">",
                    "<b:string>" + __primaryfieldname + "</b:string>",
                    "</a:Columns>",
                    "</a:ColumnSet>",
                    "<a:Criteria>",
                    "<a:Conditions />",
                    "<a:FilterOperator>And</a:FilterOperator>",
                    "<a:Filters>",
                    "<a:FilterExpression>",
                    "<a:Conditions>",
                    "<a:ConditionExpression>",
                    "<a:AttributeName>new_name</a:AttributeName>",
                    "<a:Operator>Equal</a:Operator>",
                    "<a:Values xmlns:b=\"http://schemas.microsoft.com/2003/10/Serialization/Arrays\">",
                    "<b:anyType i:type=\"c:string\" xmlns:c=\"http://www.w3.org/2001/XMLSchema\">" + __filtername + "</b:anyType>",
                    "</a:Values>",
                    "<a:EntityName i:nil=\"true\" />",
                    "</a:ConditionExpression>",
                    "</a:Conditions>",
                    "<a:FilterOperator>And</a:FilterOperator>",
                    "<a:Filters />",
                    "</a:FilterExpression>",
                    "</a:Filters>",
                    "</a:Criteria>",
                    "<a:Distinct>false</a:Distinct>",
                    "<a:EntityName>" + __entityname + "</a:EntityName>",
                    "<a:LinkEntities />",
                    "<a:Orders>",
                    "<a:OrderExpression>",
                    "<a:AttributeName>" + __orderbyDescField + "</a:AttributeName>",
                    "<a:OrderType>Descending</a:OrderType>",
                    "</a:OrderExpression>",
                    "</a:Orders>",
                    "<a:PageInfo>",
                    "<a:Count>0</a:Count>",
                    "<a:PageNumber>0</a:PageNumber>",
                    "<a:PagingCookie i:nil=\"true\" />",
                    "<a:ReturnTotalRecordCount>false</a:ReturnTotalRecordCount>",
                    "</a:PageInfo>",
                    "<a:NoLock>true</a:NoLock>",
                    "<a:TopCount>1</a:TopCount>",
                    "</query>",
                    "</RetrieveMultiple>",
                    "</s:Body>",
                    "</s:Envelope>"].join("");

    },
    RetrieveMultiple_Conditions: function (__entityname, __primaryfieldname, __FilterId, __orderbyAscField) {
        return  ["<s:Envelope xmlns:s=\"http://schemas.xmlsoap.org/soap/envelope/\">",
                    "<s:Body>",
                    "<RetrieveMultiple xmlns=\"http://schemas.microsoft.com/xrm/2011/Contracts/Services\" xmlns:i=\"http://www.w3.org/2001/XMLSchema-instance\">",
                    "<query i:type=\"a:QueryExpression\" xmlns:a=\"http://schemas.microsoft.com/xrm/2011/Contracts\">",
                    "<a:ColumnSet>",
                    "<a:AllColumns>false</a:AllColumns>",
                    "<a:Columns xmlns:b=\"http://schemas.microsoft.com/2003/10/Serialization/Arrays\">",
                    "<b:string>" + __primaryfieldname + "</b:string>",
                    "<b:string>new_displayname</b:string>",
                    "<b:string>new_name</b:string>",
                    "</a:Columns>",
                    "</a:ColumnSet>",
                    "<a:Criteria>",
                    "<a:Conditions />",
                    "<a:FilterOperator>And</a:FilterOperator>",
                    "<a:Filters>",
                    "<a:FilterExpression>",
                    "<a:Conditions>",
                    "<a:ConditionExpression>",
                    "<a:AttributeName>new_filterid</a:AttributeName>",
                    "<a:Operator>Equal</a:Operator>",
                    "<a:Values xmlns:b=\"http://schemas.microsoft.com/2003/10/Serialization/Arrays\">",
                    "<b:anyType i:type=\"c:guid\" xmlns:c=\"http://schemas.microsoft.com/2003/10/Serialization/\">" + __FilterId + "</b:anyType>",
                    "</a:Values>",
                    "<a:EntityName i:nil=\"true\" />",
                    "</a:ConditionExpression>",
                    "</a:Conditions>",
                    "<a:FilterOperator>And</a:FilterOperator>",
                    "<a:Filters />",
                    "</a:FilterExpression>",
                    "</a:Filters>",
                    "</a:Criteria>",
                    "<a:Distinct>false</a:Distinct>",
                    "<a:EntityName>" + __entityname + "</a:EntityName>",
                    "<a:LinkEntities />",
                    "<a:Orders>",
                    "<a:OrderExpression>",
                    "<a:AttributeName>" + __orderbyAscField + "</a:AttributeName>",
                    "<a:OrderType>Ascending</a:OrderType>",
                    "</a:OrderExpression>",
                    "</a:Orders>",
                    "<a:PageInfo>",
                    "<a:Count>0</a:Count>",
                    "<a:PageNumber>0</a:PageNumber>",
                    "<a:PagingCookie i:nil=\"true\" />",
                    "<a:ReturnTotalRecordCount>false</a:ReturnTotalRecordCount>",
                    "</a:PageInfo>",
                    "<a:NoLock>true</a:NoLock>",
                    "</query>",
                    "</RetrieveMultiple>",
                    "</s:Body>",
                    "</s:Envelope>"].join("");

    },
    RetrieveMultiple_Attributes: function (__entityname, __primaryfieldname, __conditionId, __orderbyAscField) {
        return ["<s:Envelope xmlns:s=\"http://schemas.xmlsoap.org/soap/envelope/\">",
                    "<s:Body>",
                    "<RetrieveMultiple xmlns=\"http://schemas.microsoft.com/xrm/2011/Contracts/Services\" xmlns:i=\"http://www.w3.org/2001/XMLSchema-instance\">",
                    "<query i:type=\"a:QueryExpression\" xmlns:a=\"http://schemas.microsoft.com/xrm/2011/Contracts\">",
                    "<a:ColumnSet>",
                    "<a:AllColumns>false</a:AllColumns>",
                    "<a:Columns xmlns:b=\"http://schemas.microsoft.com/2003/10/Serialization/Arrays\">",
                    "<b:string>" + __primaryfieldname + "</b:string>",
                    "<b:string>new_displayname</b:string>",
                    "<b:string>new_name</b:string>",
                    "<b:string>new_position</b:string>",
                    "<b:string>new_type</b:string>",
                    "<b:string>new_sourceid</b:string>",
                    "</a:Columns>",
                    "</a:ColumnSet>",
                    "<a:Criteria>",
                    "<a:Conditions />",
                    "<a:FilterOperator>And</a:FilterOperator>",
                    "<a:Filters>",
                    "<a:FilterExpression>",
                    "<a:Conditions>",
                    "<a:ConditionExpression>",
                    "<a:AttributeName>new_conditionid</a:AttributeName>",
                    "<a:Operator>Equal</a:Operator>",
                    "<a:Values xmlns:b=\"http://schemas.microsoft.com/2003/10/Serialization/Arrays\">",
                    "<b:anyType i:type=\"c:guid\" xmlns:c=\"http://schemas.microsoft.com/2003/10/Serialization/\">" + __conditionId  + "</b:anyType>",
                    "</a:Values>",
                    "<a:EntityName i:nil=\"true\" />",
                    "</a:ConditionExpression>",
                    "</a:Conditions>",
                    "<a:FilterOperator>And</a:FilterOperator>",
                    "<a:Filters />",
                    "</a:FilterExpression>",
                    "</a:Filters>",
                    "</a:Criteria>",
                    "<a:Distinct>false</a:Distinct>",
                    "<a:EntityName>" + __entityname + "</a:EntityName>",
                    "<a:LinkEntities />",
                    "<a:Orders>",
                    "<a:OrderExpression>",
                    "<a:AttributeName>" + __orderbyAscField + "</a:AttributeName>",
                    "<a:OrderType>Ascending</a:OrderType>",
                    "</a:OrderExpression>",
                    "</a:Orders>",
                    "<a:PageInfo>",
                    "<a:Count>0</a:Count>",
                    "<a:PageNumber>0</a:PageNumber>",
                    "<a:PagingCookie i:nil=\"true\" />",
                    "<a:ReturnTotalRecordCount>false</a:ReturnTotalRecordCount>",
                    "</a:PageInfo>",
                    "<a:NoLock>true</a:NoLock>",
                    "</query>",
                    "</RetrieveMultiple>",
                    "</s:Body>",
                    "</s:Envelope>"].join("");

    },
    Retrieve_Sources: function (__entityname, __sourceId) {
        return ["<s:Envelope xmlns:s=\"http://schemas.xmlsoap.org/soap/envelope/\">",
                "<s:Body>",
                "<Retrieve xmlns=\"http://schemas.microsoft.com/xrm/2011/Contracts/Services\" xmlns:i=\"http://www.w3.org/2001/XMLSchema-instance\">",
                "<entityName>" + __entityname + "</entityName>",
                "<id>" + __sourceId + "</id>",
                "<columnSet xmlns:a=\"http://schemas.microsoft.com/xrm/2011/Contracts\">",
                "<a:AllColumns>false</a:AllColumns>",
                "<a:Columns xmlns:b=\"http://schemas.microsoft.com/2003/10/Serialization/Arrays\">",
                "<b:string>new_type</b:string>",
                "<b:string>new_name_xml_crm</b:string>",
                "<b:string>new_name</b:string>",
                "<b:string>new_string</b:string>", 
                "<b:string>new_iterationnode</b:string>",
                "<b:string>new_keyproperty</b:string>",
                "<b:string>new_displayproperty</b:string>",
                "<b:string>new_default</b:string>",
                "<b:string>new_returntype</b:string>",
                "<b:string>new_optionsetname</b:string>",
                "<b:string>new_entityname</b:string>",
                "<b:string>new_keyattribute_metadata</b:string>",
                "<b:string>new_displayattribute_metadata</b:string>",
                "</a:Columns>",
                "</columnSet>",
                "</Retrieve>",
                "</s:Body>",
                "</s:Envelope>"].join("");
          
    },
    RetrieveMultiple_XmlCRM: function (__XMLname) {
        return ["<s:Envelope xmlns:s=\"http://schemas.xmlsoap.org/soap/envelope/\">",
                    "<s:Body>",
                    "<RetrieveMultiple xmlns=\"http://schemas.microsoft.com/xrm/2011/Contracts/Services\" xmlns:i=\"http://www.w3.org/2001/XMLSchema-instance\">",
                    "<query i:type=\"a:QueryExpression\" xmlns:a=\"http://schemas.microsoft.com/xrm/2011/Contracts\">",
                    "<a:ColumnSet>",
                    "<a:AllColumns>false</a:AllColumns>",
                    "<a:Columns xmlns:b=\"http://schemas.microsoft.com/2003/10/Serialization/Arrays\">",
                    "<b:string>content</b:string>",
                    "<b:string>webresourcetype</b:string>",
                    "</a:Columns>",
                    "</a:ColumnSet>",
                    "<a:Criteria>",
                    "<a:Conditions />",
                    "<a:FilterOperator>And</a:FilterOperator>",
                    "<a:Filters>",
                    "<a:FilterExpression>",
                    "<a:Conditions>",
                    "<a:ConditionExpression>",
                    "<a:AttributeName>name</a:AttributeName>",
                    "<a:Operator>Equal</a:Operator>",
                    "<a:Values xmlns:b=\"http://schemas.microsoft.com/2003/10/Serialization/Arrays\">",
                    "<b:anyType i:type=\"c:string\" xmlns:c=\"http://www.w3.org/2001/XMLSchema\">" + __XMLname + "</b:anyType>",
                    "</a:Values>",
                    "<a:EntityName i:nil=\"true\" />",
                    "</a:ConditionExpression>",
                    "</a:Conditions>",
                    "<a:FilterOperator>And</a:FilterOperator>",
                    "<a:Filters />",
                    "</a:FilterExpression>",
                    "</a:Filters>",
                    "</a:Criteria>",
                    "<a:Distinct>false</a:Distinct>",
                    "<a:EntityName>webresource</a:EntityName>",
                    "<a:LinkEntities />",
                    "<a:Orders />",
                    "<a:PageInfo>",
                    "<a:Count>0</a:Count>",
                    "<a:PageNumber>0</a:PageNumber>",
                    "<a:PagingCookie i:nil=\"true\" />",
                    "<a:ReturnTotalRecordCount>false</a:ReturnTotalRecordCount>",
                    "</a:PageInfo>",
                    "<a:NoLock>false</a:NoLock>",
                    "<a:TopCount>1</a:TopCount>",
                    "</query>",
                    "</RetrieveMultiple>",
                    "</s:Body>",
                    "</s:Envelope>"].join("");

    },
    RetrieveMultiple_DependenciesID: function (__entityname, __primaryfieldname, __id) {
        return ["<s:Envelope xmlns:s=\"http://schemas.xmlsoap.org/soap/envelope/\">",
                    "<s:Body>",
                    "<RetrieveMultiple xmlns=\"http://schemas.microsoft.com/xrm/2011/Contracts/Services\" xmlns:i=\"http://www.w3.org/2001/XMLSchema-instance\">",
                    "<query i:type=\"a:QueryExpression\" xmlns:a=\"http://schemas.microsoft.com/xrm/2011/Contracts\">",
                    "<a:ColumnSet>",
                    "<a:AllColumns>false</a:AllColumns>",
                    "<a:Columns xmlns:b=\"http://schemas.microsoft.com/2003/10/Serialization/Arrays\">",
                    "<b:string>new_segmentationplusattributeidtwo</b:string>",
                     "<b:string>new_segmentationplusattributeidone</b:string>",
                    "</a:Columns>",
                    "</a:ColumnSet>",
                    "<a:Criteria>",
                    "<a:Conditions />",
                    "<a:FilterOperator>And</a:FilterOperator>",
                    "<a:Filters>",
                    "<a:FilterExpression>",
                    "<a:Conditions>",
                    "<a:ConditionExpression>",
                    "<a:AttributeName>" + __primaryfieldname + "</a:AttributeName>",
                    "<a:Operator>Equal</a:Operator>",
                    "<a:Values xmlns:b=\"http://schemas.microsoft.com/2003/10/Serialization/Arrays\">",
                    "<b:anyType i:type=\"c:guid\" xmlns:c=\"http://schemas.microsoft.com/2003/10/Serialization/\">" + __id + "</b:anyType>",
                    "</a:Values>",
                    "<a:EntityName i:nil=\"true\" />",
                    "</a:ConditionExpression>",
                    "</a:Conditions>",
                    "<a:FilterOperator>And</a:FilterOperator>",
                    "<a:Filters />",
                    "</a:FilterExpression>",
                    "</a:Filters>",
                    "</a:Criteria>",
                    "<a:Distinct>false</a:Distinct>",
                    "<a:EntityName>" + __entityname + "</a:EntityName>",
                    "<a:LinkEntities />",
                    "<a:Orders />",
                    "<a:PageInfo>",
                    "<a:Count>0</a:Count>",
                    "<a:PageNumber>0</a:PageNumber>",
                    "<a:PagingCookie i:nil=\"true\" />",
                    "<a:ReturnTotalRecordCount>false</a:ReturnTotalRecordCount>",
                    "</a:PageInfo>",
                    "<a:NoLock>false</a:NoLock>",
                    "</query>",
                    "</RetrieveMultiple>",
                    "</s:Body>",
                    "</s:Envelope>"].join("");

    },

    RetrieveMultiple_Fetch: function (__fetch, top) {
       
        if (typeof top != undefined && top > 0) {
            return ["<s:Envelope xmlns:s=\"http://schemas.xmlsoap.org/soap/envelope/\">",
                "<s:Body>",
                "<RetrieveMultiple xmlns=\"http://schemas.microsoft.com/xrm/2011/Contracts/Services\" xmlns:i=\"http://www.w3.org/2001/XMLSchema-instance\">",
                "<query i:type=\"a:FetchExpression\" xmlns:a=\"http://schemas.microsoft.com/xrm/2011/Contracts\">",
                "<a:Query>" + __fetch + "</a:Query>",
                "<a:TopCount>" + top + "</a:TopCount > ",
                "</query>",
                "</RetrieveMultiple>",
                "</s:Body>",
                "</s:Envelope>"].join("");
        }
        return ["<s:Envelope xmlns:s=\"http://schemas.xmlsoap.org/soap/envelope/\">",
           "<s:Body>",
           "<RetrieveMultiple xmlns=\"http://schemas.microsoft.com/xrm/2011/Contracts/Services\" xmlns:i=\"http://www.w3.org/2001/XMLSchema-instance\">",
           "<query i:type=\"a:FetchExpression\" xmlns:a=\"http://schemas.microsoft.com/xrm/2011/Contracts\">",
           "<a:Query>" + __fetch + "</a:Query>",
           "</query>",
           "</RetrieveMultiple>",
           "</s:Body>",
           "</s:Envelope>"].join("");

    },
    Execute_RetrieveMetadataOptionset: function (__name) {
        return ["<s:Envelope xmlns:s=\"http://schemas.xmlsoap.org/soap/envelope/\">",
                "<s:Body>",
                "<Execute xmlns=\"http://schemas.microsoft.com/xrm/2011/Contracts/Services\" xmlns:i=\"http://www.w3.org/2001/XMLSchema-instance\">",
                "<request i:type=\"a:RetrieveOptionSetRequest\" xmlns:a=\"http://schemas.microsoft.com/xrm/2011/Contracts\">",
                "<a:Parameters xmlns:b=\"http://schemas.datacontract.org/2004/07/System.Collections.Generic\">",
                "<a:KeyValuePairOfstringanyType>",
                "<b:key>MetadataId</b:key>",
                "<b:value i:type=\"c:guid\" xmlns:c=\"http://schemas.microsoft.com/2003/10/Serialization/\">00000000-0000-0000-0000-000000000000</b:value>",
                "</a:KeyValuePairOfstringanyType>",
                "<a:KeyValuePairOfstringanyType>",
                "<b:key>RetrieveAsIfPublished</b:key>",
                "<b:value i:type=\"c:boolean\" xmlns:c=\"http://www.w3.org/2001/XMLSchema\">false</b:value>",
                "</a:KeyValuePairOfstringanyType>",
                "<a:KeyValuePairOfstringanyType>",
                "<b:key>Name</b:key>",
                "<b:value i:type=\"c:string\" xmlns:c=\"http://www.w3.org/2001/XMLSchema\">" + __name + "</b:value>",
                "</a:KeyValuePairOfstringanyType>",
                "</a:Parameters>",
                "<a:RequestId i:nil=\"true\" />",
                "<a:RequestName>RetrieveOptionSet</a:RequestName>",
                "</request>",
                "</Execute>",
                "</s:Body>",
                "</s:Envelope>"].join("");

    },
    Execute_RetrieveMetadataEntities: function () {
        return ["<s:Envelope xmlns:s=\"http://schemas.xmlsoap.org/soap/envelope/\">",
                "<s:Body>",
                "<Execute xmlns=\"http://schemas.microsoft.com/xrm/2011/Contracts/Services\" xmlns:i=\"http://www.w3.org/2001/XMLSchema-instance\">",
                "<request i:type=\"a:RetrieveAllEntitiesRequest\" xmlns:a=\"http://schemas.microsoft.com/xrm/2011/Contracts\">",
                "<a:Parameters xmlns:b=\"http://schemas.datacontract.org/2004/07/System.Collections.Generic\">",
                "<a:KeyValuePairOfstringanyType>",
                "<b:key>EntityFilters</b:key>",
                "<b:value i:type=\"c:EntityFilters\" xmlns:c=\"http://schemas.microsoft.com/xrm/2011/Metadata\">Entity</b:value>",
                "</a:KeyValuePairOfstringanyType>",
                "<a:KeyValuePairOfstringanyType>",
                "<b:key>RetrieveAsIfPublished</b:key>",
                "<b:value i:type=\"c:boolean\" xmlns:c=\"http://www.w3.org/2001/XMLSchema\">true</b:value>",
                "</a:KeyValuePairOfstringanyType>",
                "</a:Parameters>",
                "<a:RequestId i:nil=\"true\" />",
                "<a:RequestName>RetrieveAllEntities</a:RequestName>",
                "</request>",
                "</Execute>",
                "</s:Body>",
                "</s:Envelope>"].join("");

    },
    Execute_RetrieveMetadataFields: function (__entity) {
        return ["<s:Envelope xmlns:s=\"http://schemas.xmlsoap.org/soap/envelope/\">",
                    "<s:Body>",
                    "<Execute xmlns=\"http://schemas.microsoft.com/xrm/2011/Contracts/Services\" xmlns:i=\"http://www.w3.org/2001/XMLSchema-instance\">",
                    "<request i:type=\"a:RetrieveEntityRequest\" xmlns:a=\"http://schemas.microsoft.com/xrm/2011/Contracts\">",
                    "<a:Parameters xmlns:b=\"http://schemas.datacontract.org/2004/07/System.Collections.Generic\">",
                    "<a:KeyValuePairOfstringanyType>",
                    "<b:key>EntityFilters</b:key>",
                    "<b:value i:type=\"c:EntityFilters\" xmlns:c=\"http://schemas.microsoft.com/xrm/2011/Metadata\">Attributes Relationships</b:value>",
                    "</a:KeyValuePairOfstringanyType>",
                    "<a:KeyValuePairOfstringanyType>",
                    "<b:key>MetadataId</b:key>",
                    "<b:value i:type=\"c:guid\" xmlns:c=\"http://schemas.microsoft.com/2003/10/Serialization/\">00000000-0000-0000-0000-000000000000</b:value>",
                    "</a:KeyValuePairOfstringanyType>",
                    "<a:KeyValuePairOfstringanyType>",
                    "<b:key>RetrieveAsIfPublished</b:key>",
                    "<b:value i:type=\"c:boolean\" xmlns:c=\"http://www.w3.org/2001/XMLSchema\">true</b:value>",
                    "</a:KeyValuePairOfstringanyType>",
                    "<a:KeyValuePairOfstringanyType>",
                    "<b:key>LogicalName</b:key>",
                    "<b:value i:type=\"c:string\" xmlns:c=\"http://www.w3.org/2001/XMLSchema\">" + __entity + "</b:value>",
                    "</a:KeyValuePairOfstringanyType>",
                    "</a:Parameters>",
                    "<a:RequestId i:nil=\"true\" />",
                    "<a:RequestName>RetrieveEntity</a:RequestName>",
                    "</request>",
                    "</Execute>",
                    "</s:Body>",
                    "</s:Envelope>"].join("");
    },
    Execute_RetrieveMetadataPrimaryField: function (__entity) {
        return ["<s:Envelope xmlns:s=\"http://schemas.xmlsoap.org/soap/envelope/\">",
                "<s:Body>",
                "<Execute xmlns=\"http://schemas.microsoft.com/xrm/2011/Contracts/Services\" xmlns:i=\"http://www.w3.org/2001/XMLSchema-instance\">",
                "<request i:type=\"a:RetrieveEntityRequest\" xmlns:a=\"http://schemas.microsoft.com/xrm/2011/Contracts\">",
                "<a:Parameters xmlns:b=\"http://schemas.datacontract.org/2004/07/System.Collections.Generic\">",
                "<a:KeyValuePairOfstringanyType>",
                "<b:key>EntityFilters</b:key>",
                "<b:value i:type=\"c:EntityFilters\" xmlns:c=\"http://schemas.microsoft.com/xrm/2011/Metadata\">Entity</b:value>",
                "</a:KeyValuePairOfstringanyType>",
                "<a:KeyValuePairOfstringanyType>",
                "<b:key>MetadataId</b:key>",
                "<b:value i:type=\"c:guid\" xmlns:c=\"http://schemas.microsoft.com/2003/10/Serialization/\">00000000-0000-0000-0000-000000000000</b:value>",
                "</a:KeyValuePairOfstringanyType>",
                "<a:KeyValuePairOfstringanyType>",
                "<b:key>RetrieveAsIfPublished</b:key>",
                "<b:value i:type=\"c:boolean\" xmlns:c=\"http://www.w3.org/2001/XMLSchema\">false</b:value>",
                "</a:KeyValuePairOfstringanyType>",
                "<a:KeyValuePairOfstringanyType>",
                "<b:key>LogicalName</b:key>",
                "<b:value i:type=\"c:string\" xmlns:c=\"http://www.w3.org/2001/XMLSchema\">" + __entity + "</b:value>",
                "</a:KeyValuePairOfstringanyType>",
                "</a:Parameters>",
                "<a:RequestId i:nil=\"true\" />",
                "<a:RequestName>RetrieveEntity</a:RequestName>",
                "</request>",
                "</Execute>",
                "</s:Body>",
                "</s:Envelope>"].join("");
    },
    RetrieveMultiple_SearchForLookup: function (__entity, __primaryField, __topCount ,  __text) {
        return ["<s:Envelope xmlns:s=\"http://schemas.xmlsoap.org/soap/envelope/\">",
                        "<s:Body>",
                        "<RetrieveMultiple xmlns=\"http://schemas.microsoft.com/xrm/2011/Contracts/Services\" xmlns:i=\"http://www.w3.org/2001/XMLSchema-instance\">",
                        "<query i:type=\"a:QueryExpression\" xmlns:a=\"http://schemas.microsoft.com/xrm/2011/Contracts\">",
                        "<a:ColumnSet>",
                        "<a:AllColumns>false</a:AllColumns>",
                        "<a:Columns xmlns:b=\"http://schemas.microsoft.com/2003/10/Serialization/Arrays\">",
                        "<b:string>" + __primaryField + "</b:string>",
                        "</a:Columns>",
                        "</a:ColumnSet>",
                        "<a:Criteria>",
                        "<a:Conditions />",
                        "<a:FilterOperator>And</a:FilterOperator>",
                        "<a:Filters>",
                        "<a:FilterExpression>",
                        "<a:Conditions>",
                        "<a:ConditionExpression>",
                        "<a:AttributeName>" + __primaryField + "</a:AttributeName>",
                        "<a:Operator>BeginsWith</a:Operator>",
                        "<a:Values xmlns:b=\"http://schemas.microsoft.com/2003/10/Serialization/Arrays\">",
                        "<b:anyType i:type=\"c:string\" xmlns:c=\"http://www.w3.org/2001/XMLSchema\">" + __text + "</b:anyType>",
                        "</a:Values>",
                        "<a:EntityName i:nil=\"true\" />",
                        "</a:ConditionExpression>",
                        "</a:Conditions>",
                        "<a:FilterOperator>And</a:FilterOperator>",
                        "<a:Filters />",
                        "</a:FilterExpression>",
                        "</a:Filters>",
                        "</a:Criteria>",
                        "<a:Distinct>false</a:Distinct>",
                        "<a:EntityName>" + __entity + "</a:EntityName>",
                        "<a:LinkEntities />",
                        "<a:Orders>",
                        "<a:OrderExpression>",
                        "<a:AttributeName>" + __primaryField + "</a:AttributeName>",
                        "<a:OrderType>Ascending</a:OrderType>",
                        "</a:OrderExpression>",
                        "</a:Orders>",
                        "<a:PageInfo>",
                        "<a:Count>0</a:Count>",
                        "<a:PageNumber>0</a:PageNumber>",
                        "<a:PagingCookie i:nil=\"true\" />",
                        "<a:ReturnTotalRecordCount>false</a:ReturnTotalRecordCount>",
                        "</a:PageInfo>",
                        "<a:NoLock>true</a:NoLock>",
                        "<a:TopCount>" + __topCount + "</a:TopCount>",
                        "</query>",
                        "</RetrieveMultiple>",
                        "</s:Body>",
                        "</s:Envelope>"].join("");

    },
    RetrieveMultiple_SavedQueries: function (__entity) {
        return ["<s:Envelope xmlns:s=\"http://schemas.xmlsoap.org/soap/envelope/\">",
            "<s:Body>",
            "<RetrieveMultiple xmlns=\"http://schemas.microsoft.com/xrm/2011/Contracts/Services\" xmlns:i=\"http://www.w3.org/2001/XMLSchema-instance\">",
            "<query i:type=\"a:QueryExpression\" xmlns:a=\"http://schemas.microsoft.com/xrm/2011/Contracts\">",
            "<a:ColumnSet>",
            "<a:AllColumns>false</a:AllColumns>",
            "<a:Columns xmlns:b=\"http://schemas.microsoft.com/2003/10/Serialization/Arrays\">",
            "<b:string>fetchxml</b:string>",
            "<b:string>name</b:string>",
            "</a:Columns>",
            "</a:ColumnSet>",
            "<a:Criteria>",
            "<a:Conditions />",
            "<a:FilterOperator>And</a:FilterOperator>",
            "<a:Filters>",
            "<a:FilterExpression>",
            "<a:Conditions>",
            "<a:ConditionExpression>",
            "<a:AttributeName>returnedtypecode</a:AttributeName>",
            "<a:Operator>Equal</a:Operator>",
            "<a:Values xmlns:b=\"http://schemas.microsoft.com/2003/10/Serialization/Arrays\">",
            "<b:anyType i:type=\"c:string\" xmlns:c=\"http://www.w3.org/2001/XMLSchema\">" + __entity + "</b:anyType>",
            "</a:Values>",
            "<a:EntityName i:nil=\"true\" />",
            "</a:ConditionExpression>",
            "</a:Conditions>",
            "<a:FilterOperator>And</a:FilterOperator>",
            "<a:Filters />",
            "</a:FilterExpression>",
            "</a:Filters>",
            "</a:Criteria>",
            "<a:Distinct>false</a:Distinct>",
            "<a:EntityName>savedquery</a:EntityName>",
            "<a:LinkEntities />",
            "<a:Orders />",
            "<a:PageInfo>",
            "<a:Count>0</a:Count>",
            "<a:PageNumber>0</a:PageNumber>",
            "<a:PagingCookie i:nil=\"true\" />",
            "<a:ReturnTotalRecordCount>false</a:ReturnTotalRecordCount>",
            "</a:PageInfo>",
            "<a:NoLock>false</a:NoLock>",
            "</query>",
            "</RetrieveMultiple>",
            "</s:Body>",
            "</s:Envelope>"].join("");
    },
    RetrieveMultiple_CountRecords : function (__entity,  __pageNumber, __pageCookie) {
        var pageCookieStr__ = "<a:PagingCookie i:nil=\"true\" />";
        if (__pageCookie != null) {
            pageCookieStr__ = "<a:PagingCookie>" + __pageCookie + "</a:PagingCookie>";
        }
        return ["<s:Envelope xmlns:s=\"http://schemas.xmlsoap.org/soap/envelope/\">",
            "<s:Body>",
            "<RetrieveMultiple xmlns=\"http://schemas.microsoft.com/xrm/2011/Contracts/Services\" xmlns:i=\"http://www.w3.org/2001/XMLSchema-instance\">",
            "<query i:type=\"a:QueryExpression\" xmlns:a=\"http://schemas.microsoft.com/xrm/2011/Contracts\">",
            "<a:ColumnSet>",
            "<a:AllColumns>false</a:AllColumns>",
            "<a:Columns xmlns:b=\"http://schemas.microsoft.com/2003/10/Serialization/Arrays\"/>",
            "</a:ColumnSet>",
            "<a:Criteria>",
            "<a:Conditions />",
            "<a:FilterOperator>And</a:FilterOperator>",
            "<a:Filters />",
            "</a:Criteria>",
            "<a:Distinct>false</a:Distinct>",
            "<a:EntityName>" + __entity + "</a:EntityName>",
            "<a:LinkEntities />",
            "<a:Orders />",
            "<a:PageInfo>",
            "<a:Count>5000</a:Count>",
            "<a:PageNumber>" + __pageNumber + "</a:PageNumber>",
            pageCookieStr__,
            "<a:ReturnTotalRecordCount>true</a:ReturnTotalRecordCount>",
            "</a:PageInfo>",
            "<a:NoLock>true</a:NoLock>",
            "</query>",
            "</RetrieveMultiple>",
            "</s:Body>",
            "</s:Envelope>"].join("");
    },
    RetrieveMultiple_Fetch: function (__fetch, __pageNumber, __pageCookie) {
        var pageCookieStr__ = "<a:PagingCookie i:nil=\"true\" />";
        if (__pageCookie != null) {
            pageCookieStr__ = "<a:PagingCookie>" + __pageCookie + "</a:PagingCookie>";
        }
       
        return ["<s:Envelope xmlns:s=\"http://schemas.xmlsoap.org/soap/envelope/\">",
            "<s:Body>",
            "<RetrieveMultiple xmlns=\"http://schemas.microsoft.com/xrm/2011/Contracts/Services\" xmlns:i=\"http://www.w3.org/2001/XMLSchema-instance\">",
            "<query i:type=\"a:FetchExpression\" xmlns:a=\"http://schemas.microsoft.com/xrm/2011/Contracts\">",
            "<a:Query>" + __fetch + "</a:Query>",
            "<a:PageInfo>",
            "<a:Count>5000</a:Count>",
            "<a:PageNumber>" + __pageNumber + "</a:PageNumber>",
            pageCookieStr__,
            "<a:ReturnTotalRecordCount>true</a:ReturnTotalRecordCount>",
            "</a:PageInfo>",
            "<a:NoLock>true</a:NoLock>",
            "</query>",
            "</RetrieveMultiple>",
            "</s:Body>",
            "</s:Envelope>"].join("");
    },
    RetrieveMultiple_RelatedRecords : function (id, relatedEntity, relatedAttribute, primaryNameAttribute) {
        return ["<s:Envelope xmlns:s=\"http://schemas.xmlsoap.org/soap/envelope/\">",
            "<s:Body>",
            "<RetrieveMultiple xmlns=\"http://schemas.microsoft.com/xrm/2011/Contracts/Services\" xmlns:i=\"http://www.w3.org/2001/XMLSchema-instance\">",
            "<query i:type=\"a:QueryExpression\" xmlns:a=\"http://schemas.microsoft.com/xrm/2011/Contracts\">",
            "<a:ColumnSet>",
            "<a:AllColumns>false</a:AllColumns>",
            "<a:Columns xmlns:b=\"http://schemas.microsoft.com/2003/10/Serialization/Arrays\">",
            "<b:string>" + primaryNameAttribute + "</b:string>",
            "<b:string>createdby</b:string>",
            "<b:string>createdon</b:string>",
            "</a:Columns>",
            "</a:ColumnSet>",
            "<a:Criteria>",
            "<a:Conditions />",
            "<a:FilterOperator>And</a:FilterOperator>",
            "<a:Filters>",
            "<a:FilterExpression>",
            "<a:Conditions>",
            "<a:ConditionExpression>",
            "<a:AttributeName>" + relatedAttribute + "</a:AttributeName>",
            "<a:Operator>Equal</a:Operator>",
            "<a:Values xmlns:b=\"http://schemas.microsoft.com/2003/10/Serialization/Arrays\">",
            "<b:anyType i:type=\"c:guid\" xmlns:c=\"http://schemas.microsoft.com/2003/10/Serialization/\">" + id + "</b:anyType>",
            "</a:Values>",
            "<a:EntityName i:nil=\"true\" />",
            "</a:ConditionExpression>",
            "</a:Conditions>",
            "<a:FilterOperator>And</a:FilterOperator>",
            "<a:Filters />",
            "</a:FilterExpression>",
            "</a:Filters>",
            "</a:Criteria>",
            "<a:Distinct>false</a:Distinct>",
            "<a:EntityName>" + relatedEntity + "</a:EntityName>",
            "<a:LinkEntities />",
            "<a:Orders>",
            "<a:OrderExpression>",
            "<a:AttributeName>createdon</a:AttributeName>",
            "<a:OrderType>Descending</a:OrderType>",
            "</a:OrderExpression>",
            "</a:Orders>",
            "<a:PageInfo>",
            "<a:Count>0</a:Count>",
            "<a:PageNumber>0</a:PageNumber>",
            "<a:PagingCookie i:nil=\"true\" />",
            "<a:ReturnTotalRecordCount>false</a:ReturnTotalRecordCount>",
            "</a:PageInfo>",
            "<a:NoLock>false</a:NoLock>",
            "</query>",
            "</RetrieveMultiple>",
            "</s:Body>",
            "</s:Envelope>"].join("");
    },
};

var Loaded_REFEREDVAR_HUDCRMSoap = true;