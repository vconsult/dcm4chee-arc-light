"use strict";

myApp.controller('StudyListCtrl', function ($scope, $window, $http, QidoService, StudiesService, cfpLoadingBar, $modalities, $compile, DeviceService,  $filter, $templateRequest, $timeout) {
    $scope.logoutUrl = myApp.logoutUrl();
    $scope.patients = [];
    $scope.mwl = [];
    $scope.iod = {};
    $scope.showClipboardHeaders = {
        "study":false,
        "series":false,
        "instance":false
    };
//   $scope.studies = [];
    // $scope.allhidden = false;
    $scope.clipboard = {};
    $scope.selected = {};
    $scope.pressedKey;
    $scope.keysdown = {};
    $scope.dateplaceholder = {};
    $scope.opendropdown = false;
    $scope.patientmode = true;
    $scope.morePatients;
    $scope.moreStudies;
    $scope.limit = 20;
    $scope.aes;
    $scope.aetmodel;
    $scope.trashaktive = false;
    $scope.aet = null;
    $scope.exporters;
    $scope.exporterID = null;
    $scope.attributeFilters = {};
    $scope.rjnotes;
    $scope.keepRejectionNote = false;2
    $scope.rjnote = null;
    $scope.advancedConfig = false;
    $scope.showModalitySelector = false;
    $scope.filter = { orderby: "StudyDate,StudyTime" };
    $scope.studyDate = { from: StudiesService.getTodayDate(), to: StudiesService.getTodayDate(),toObject:new Date(),fromObject:new Date()};
    $scope["ScheduledProcedureStepSequence.ScheduledProcedureStepStartDate"] = { from: StudiesService.getTodayDate(), to: StudiesService.getTodayDate(),toObject:new Date(),fromObject:new Date()};
    $scope.studyTime = { from: '', to: ''};
    $scope["ScheduledProcedureStepSequence.ScheduledProcedureStepStartTime"] = { from: '', to: ''};
    $scope.format = "yyyyMMdd";
    $scope.format2 = "yyyy-MM-dd";
    $scope.modalities = $modalities;
    $scope.rjcode = null;
    $scope.options = {};
    $scope.disabled = {};
    $scope.options["genders"] = [
            {
                "vr": "CS",
                "Value":["F"],
                "title":"Female"
            },
            {
                "vr": "CS",
                "Value":["M"],
                "title":"Male"
            },
            {
                "vr": "CS",
                "Value":["O"],
                "title":"Other"
            }
    ];
    $http.get('iod/study.iod.json',{ cache: true}).then(function (res) {
        $scope.iod["study"] = res.data;
    });
    $http.get('iod/mwl.iod.json',{ cache: true}).then(function (res) {
        $scope.iod["mwl"] = res.data;
    });
    $scope.filterMode = "study";
    $scope.orderby = [
        {
            value:"PatientName",
            label:"<label>Patient</label><span class=\"glyphicon glyphicon-sort-by-alphabet\"></span>",
            mode:"patient"
        },
        {
            value:"-PatientName",
            label:"<label>Patient</label><span class=\"orderbynamedesc\"></span>",
            mode:"patient"
        },
        {

            value:"StudyDate,StudyTime",
            label:"<label>Study</label><span class=\"orderbydateasc\"></span>",
            mode:"study"
        },
        {
            value:"-StudyDate,-StudyTime",
            label:"<label>Study</label><span class=\"orderbydatedesc\"></span>",
            mode:"study"
        },
        {
            value:"PatientName,StudyDate,StudyTime",
            label:"<label>Study</label><span class=\"glyphicon glyphicon-sort-by-alphabet\"></span><span class=\"orderbydateasc\"></span>",
            mode:"study"
        },
        {
            value:"-PatientName,StudyDate,StudyTime",
            label:"<label>Study</label><span class=\"orderbynamedesc\"></span><span class=\"orderbydateasc\"></span>",
            mode:"study"
        },
        {
            value:"PatientName,-StudyDate,-StudyTime",
            label:"<label>Study</label><span class=\"glyphicon glyphicon-sort-by-alphabet\"></span><span class=\"orderbydatedesc\"></span>",
            mode:"study"
        },
        {
            value:"-PatientName,-StudyDate,-StudyTime",
            label:"<label>Study</label><span class=\"orderbynamedesc\"></span><span class=\"orderbydatedesc\"></span>",
            mode:"study"
        },
        {
            value:"ScheduledProcedureStepSequence.ScheduledProcedureStepStartDate,ScheduledProcedureStepSequence.ScheduledProcedureStepStartTime",
            label:"<label title=\"Modality worklist\">MWL</label></span><span class=\"orderbydateasc\"></span>",
            mode:"mwl"
        },
        {
            value:"-ScheduledProcedureStepSequence.ScheduledProcedureStepStartDate,-ScheduledProcedureStepSequence.ScheduledProcedureStepStartTime",
            label:"<label title=\"Modality worklist\">MWL</label><span class=\"orderbydatedesc\"></span>",
            mode:"mwl"
        },
        {
            value:"PatientName,ScheduledProcedureStepSequence.ScheduledProcedureStepStartDate,ScheduledProcedureStepSequence.ScheduledProcedureStepStartTime",
            label:"<label title=\"Modality worklist\">MWL</label><span class=\"glyphicon glyphicon-sort-by-alphabet\"></span><span class=\"orderbydateasc\"></span>",
            mode:"mwl"
        },
        {
            value:"-PatientName,ScheduledProcedureStepSequence.ScheduledProcedureStepStartDate,ScheduledProcedureStepSequence.ScheduledProcedureStepStartTime",
            label:"<label title=\"Modality worklist\">MWL</label><span class=\"orderbynamedesc\"></span><span class=\"orderbydateasc\"></span>",
            mode:"mwl"
        },
        {
            value:"PatientName,-ScheduledProcedureStepSequence.ScheduledProcedureStepStartDate,-ScheduledProcedureStepSequence.ScheduledProcedureStepStartTime",
            label:"<label title=\"Modality worklist\">MWL</label><span class=\"glyphicon glyphicon-sort-by-alphabet\"></span><span class=\"orderbydatedesc\"></span>",
            mode:"mwl"
        },
        {
            value:"-PatientName,-ScheduledProcedureStepSequence.ScheduledProcedureStepStartDate,-ScheduledProcedureStepSequence.ScheduledProcedureStepStartTime",
            label:"<label title=\"Modality worklist\">MWL</label><span class=\"orderbynamedesc\"></span><span class=\"orderbydatedesc\"></span>",
            mode:"mwl"
        }
    ];
    $scope.setTrash = function(){
        $scope.aet = $scope.aetmodel.title;
        if($scope.aetmodel.dcmHideNotRejectedInstances === true){
            if($scope.rjcode === null){
                $http.get("../reject?dcmRevokeRejection=true").then(function (res) {
                    $scope.rjcode = res.data[0];
                });
            }
            $scope.filter.returnempty = false;
            $scope.trashaktive = true;
        }else{
            $scope.trashaktive = false;
        }
    };
    $scope.$watchCollection('patients', function(newValue, oldValue){
        StudiesService.trim($scope);
    });
    // $scope.trim = function(selector){
    //     StudiesService.trim(selector);
    // };
    // $scope.getLengthOfObject = function(obj){
    //     if(obj){
    //         console.log("obj",obj);
    //         console.log("obj.length",obj.length);
    //         // console.log("Object.keys(obj).length",Object.keys(obj).length);
    //         return Object.keys(obj).length;
    //     }else{
    //         return 0;
    //     }
    // };
    $scope.addFileAttribute = function(instance){
        var id      = '#file-attribute-list-'+(instance.attrs['00080018'].Value[0]).replace(/\./g, '');
        if(angular.element(id).find("*").length < 1){
            cfpLoadingBar.start();
            var html    = '<file-attribute-list studyuid="'+ instance.wadoQueryParams.studyUID +'" seriesuid="'+ instance.wadoQueryParams.seriesUID +'"  objectuid="'+ instance.wadoQueryParams.objectUID+ '"></file-attribute-list>';
            // console.log("html=",html);
            cfpLoadingBar.set(cfpLoadingBar.status()+(0.2));
            angular.element(id).html(
                $compile(html)($scope)
            );
        }
    };
    // $scope.getObjectFromString = function(string){
    //     console.log("string",string);
    //     console.log("string length=", string.lenght);
    //     console.log("string[0]",string[0]);
    //     return $scope.testmodel[string[0]];
    // };
    var modifyStudy = function(patient, mode, patientkey, studykey, study){
        cfpLoadingBar.start();
        var editstudy     = {};
        // console.log("patient",patient);
        // console.log("studykey",studykey);
        // console.log("study",study);
        angular.copy(study, editstudy);
        if(mode === "edit"){
            angular.forEach(editstudy.attrs,function(value, index) {
                var checkValue = "";    
                if(value.Value && value.Value.length){
                    checkValue = value.Value.join("");
                }
                if(!(value.Value && checkValue != "")){
                    delete editstudy.attrs[index];
                }
                if(value.vr === "DA" && value.Value && value.Value[0]){
                    var string = value.Value[0];
                    var yyyy = string.substring(0,4);
                    var MM = string.substring(4,6);
                    var dd = string.substring(6,8);
                    var timestampDate   = Date.parse(yyyy+"-"+MM+"-"+dd);
                    var date          = new Date(timestampDate);
                    $scope.dateplaceholder[index] = date;
                }
            });
        }
        $scope.editstudy  = editstudy;
        editstudy         = {};
        $scope.lastPressedCode = 0;
        $scope.removeAttr = function(attrcode){
            switch(arguments.length) {
                case 2:
                    if($scope.editstudy.attrs[arguments[0]].Value.length === 1){
                        delete  $scope.editstudy.attrs[arguments[0]];
                    }else{
                        $scope.editstudy.attrs[arguments[0]].Value.splice(arguments[1], 1);
                    }
                break;
                default:
                    delete  $scope.editstudy.attrs[arguments[0]];
                break;
            }
        };
        // console.log("$scope.editstudy",$scope.editstudy);
        $http.get('iod/study.iod.json',{ cache: true}).then(function (res) {
            // angular.forEach($scope.editstudy.attrs,function(m, i){
            //     if(!res.data[i] || res.data[i] === undefined){
            //         delete $scope.editstudy.attrs[i];
            //     }
            // });
            var dropdown                = StudiesService.getArrayFromIod(res);
            res.data = StudiesService.replaceKeyInJson(res.data, "items", "Value");
            $templateRequest('templates/edit_study.html').then(function(tpl) {
            $scope.dropdown             = dropdown;
            $scope.DCM4CHE              = DCM4CHE;
            $scope.addPatientAttribut   = "";
            $scope.opendropdown         = false;
            // console.log("tpl",tpl);
            var html                    = $compile(tpl)($scope);
            var header = "Create new Study";
            if(mode === "edit"){
                header = 'Edit study of patient <span>'+patient.attrs["00100010"].Value[0]["Alphabetic"]+'</span> with ID <span>'+patient.attrs["00100020"].Value[0]+'</span>';

            }
            // console.log("$scope.editstudy",$scope.editstudy);
            // console.log("html",html);
            var $vex = vex.dialog.open({
              message: header,
              input: html,
              className:"vex-theme-os edit-patient",
              overlayClosesOnClick: false,
              escapeButtonCloses: false,
              afterOpen: function($vexContent) {
                cfpLoadingBar.complete();
                setTimeout(function(){
                    if(mode === "create"){
                        $(".edit-patient .0020000D").attr("title","To generate it automatically leave it blank");
                        $(".edit-patient .0020000D").attr("placeholder","To generate it automatically leave it blank");
                    }
                    if(mode === "edit"){
                        $(".edit-patient .0020000D").attr("disabled","disabled");
                        $(".edit-patient span.0020000D").remove();
                    }
                    $(".editform .schema-form-fieldset > legend").append('<span class="glyphicon glyphicon-triangle-right"></span>');
                    $(".editform .schema-form-fieldset > legend").bind("click",function(){
                        $(this).siblings("sf-decorator").toggle();
                        var icon = $(this).find(".glyphicon");
                        if(icon.hasClass('glyphicon-triangle-right')){
                            icon.removeClass('glyphicon-triangle-right').addClass('glyphicon-triangle-bottom');
                        }else{
                            icon.removeClass('glyphicon-triangle-bottom').addClass('glyphicon-triangle-right');
                        }
                    });
                    //Click event handling
                    $scope.addAttribute = function(attrcode){
                        if($scope.editstudy.attrs[attrcode] != undefined){
                            if(res.data[attrcode].multi){
                                $timeout(function() {
                                    $scope.$apply(function(){
                                        // $scope.editstudy.attrs[attrcode]  = res.data[attrcode];
                                        $scope.editstudy.attrs[attrcode]["Value"].push("");
                                        $scope.addPatientAttribut           = "";
                                        $scope.opendropdown                 = false;
                                    });
                                });
                            }else{
                                DeviceService.msg($scope, {
                                        "title": "Warning",
                                        "text": "Attribute already exists!",
                                        "status": "warning"
                                });
                            }
                        }else{
                            $timeout(function() {
                                $scope.$apply(function(){
                                    $scope.editstudy.attrs[attrcode]  = res.data[attrcode];
                                });
                            });
                        }
                    };
                    $(".addPatientAttribut").bind("keydown",function(e){
                        $scope.opendropdown = true;
                        var code = (e.keyCode ? e.keyCode : e.which);
                        $scope.lastPressedCode = code;
                        if(code === 13){
                            var filter = $filter("filter");
                            var filtered = filter($scope.dropdown, $scope.addPatientAttribut);
                            if(filtered){
                                $scope.opendropdown = true;
                            }
                            if($(".dropdown_element.selected").length){
                                var attrcode = $(".dropdown_element.selected").attr("name"); 
                            }else{
                                var attrcode = filtered[0].code;
                            }
                            if($scope.editstudy.attrs[attrcode] != undefined){
                                if(res.data[attrcode].multi){
                                    $timeout(function() {
                                        $scope.$apply(function(){
                                            $scope.editstudy.attrs[attrcode]["Value"].push("");
                                            $scope.addPatientAttribut           = "";
                                            $scope.opendropdown                 = false;
                                        });
                                    });
                                }else{
                                    DeviceService.msg($scope, {
                                        "title": "Warning",
                                        "text": "Attribute already exists!",
                                        "status": "warning"
                                    });
                                }
                            }else{
                                $timeout(function() {
                                    $scope.$apply(function(){
                                        $scope.editstudy.attrs[attrcode]  = res.data[attrcode];
                                    });
                                });
                            }
                            setTimeout(function(){
                                $scope.lastPressedCode = 0;
                            },1000);
                        }
                        //Arrow down pressed
                        if(code === 40){
                            $scope.$apply(function(){
                                $scope.opendropdown = true;
                            });
                            if(!$(".dropdown_element.selected").length){
                                $(".dropdown_element").first().addClass('selected');
                            }else{
                                if($(".dropdown_element.selected").next().length){
                                    $(".dropdown_element.selected").removeClass('selected').next().addClass('selected');
                                }else{
                                    $(".dropdown_element.selected").removeClass('selected');
                                    $(".dropdown_element").first().addClass('selected');
                                }
                            }

                                if($(".dropdown_element.selected").position()){
                                    $('.dropdown').scrollTop($('.dropdown').scrollTop() + $(".dropdown_element.selected").position().top - $('.dropdown').height()/2 + $(".dropdown_element.selected").height()/2);
                                }
                        }
                        //Arrow up pressed
                        if(code === 38){
                            $scope.$apply(function(){
                                $scope.opendropdown = true;
                            });
                            if(!$(".dropdown_element.selected").length){
                                $(".dropdown_element").prev().addClass('selected');
                            }else{
                                if($(".dropdown_element.selected").index() === 0){
                                    $(".dropdown_element.selected").removeClass('selected');
                                    $(".dropdown_element").last().addClass('selected');
                                }else{
                                    $(".dropdown_element.selected").removeClass('selected').prev().addClass('selected');
                                }
                            }
                            $('.dropdown').scrollTop($('.dropdown').scrollTop() + $(".dropdown_element.selected").position().top - $('.dropdown').height()/2 + $(".dropdown_element.selected").height()/2);
                        }
                        if(code === 27){
                            $scope.$apply(function(){
                                $scope.opendropdown = false;
                            });
                        }
                    });
                    $(".editform .schema-form-fieldset > sf-decorator").hide();
                },1000);//TODO make it dynamic
              },
                onSubmit: function(e) {
                    //Prevent submit/close if ENTER was clicked
                    if($scope.lastPressedCode === 13){
                        e.preventDefault();
                    }else{
                        $vex.data().vex.callback();
                    }
                  },
                buttons: [
                    $.extend({}, vex.dialog.buttons.YES, {
                      text: 'Save'
                    }), $.extend({}, vex.dialog.buttons.NO, {
                      text: 'Cancel'
                    })
                ],
                callback: function(data) {
                    cfpLoadingBar.start();
                    if (data === false) {
                        cfpLoadingBar.complete();

                        StudiesService.clearPatientObject($scope.editstudy.attrs);
                        return console.log('Cancelled');
                    }else{
                        StudiesService.clearPatientObject($scope.editstudy.attrs);
                        StudiesService.convertStringToNumber($scope.editstudy.attrs);
                        StudiesService.convertDateToString($scope, "editstudy");

                        //Add patient attributs again
                        // angular.extend($scope.editstudy.attrs, patient.attrs);
                        // $scope.editstudy.attrs.concat(patient.attrs); 
                        var local = {};
                        if($scope.editstudy.attrs["00100020"]){
                            local["00100020"] = $scope.editstudy.attrs["00100020"];
                        }else{
                            local["00100020"] = patient.attrs["00100020"];
                        }
                        angular.forEach($scope.editstudy.attrs,function(m, i){
                            if(res.data[i]){
                                local[i] = m;
                            }
                        });
                        // if($scope.editstudy.attrs["0020000D"].Value[0]){
                        //     angular.forEach($scope.editstudy.attrs, function(m, i){
                        //         // console.log("res.data",res.data);
                        //         // console.log("i",i);
                        //         if((res.data && res.data[i] &&res.data[i].vr != "SQ") && m.Value && m.Value.length === 1 && m.Value[0] === ""){
                        //             delete $scope.editstudy.attrs[i];
                        //         }
                        //     });


                        //     // local["00081030"] = { "vr": "SH", "Value":[""]};
                        //     $http.put(
                        //         "../aets/"+$scope.aet+"/rs/patients/"+local["00100020"].Value[0] + "/studies/"+local["0020000D"].Value[0],
                        //         local
                        //     ).then(function successCallback(response) {
                        //         if(mode === "edit"){
                        //             //Update changes on the patient list
                        //             // angular.forEach(study.attrs, function(m, i){
                        //             //     if($scope.editstudy.attrs[i]){
                        //             //         study.attrs[i] = $scope.editstudy.attrs[i];
                        //             //     }
                        //             // });
                        //             // study.attrs = $scope.editstudy.attrs;
                        //             $scope.patients[patientkey].studies[studykey].attrs = $scope.editstudy.attrs;
                        //             //Force rerendering the directive attribute-list
                        //             var id = "#"+patient.attrs['00100020'].Value[0]+$scope.editstudy.attrs['0020000D'].Value[0];
                        //             id = id.replace(/\./g, '');
                        //             // var id = "#"+$scope.editstudy.attrs["0020000D"].Value;
                        //             var attribute = $compile('<attribute-list attrs="patients['+patientkey+'].studies['+studykey+'].attrs"></attribute-list>')($scope);
                        //             $(id).html(attribute);
                        //         }else{
                        //             if($scope.patientmode){
                        //                 $timeout(function() {
                        //                     angular.element("#querypatients").trigger('click');
                        //                 }, 0);
                        //                 // $scope.queryPatients(0);
                        //             }else{
                        //                 // $scope.queryStudies(0);
                        //                 $timeout(function() {
                        //                     angular.element("#querystudies").trigger('click');
                        //                 }, 0);
                        //             }
                        //         }
                        //         DeviceService.msg($scope, {
                        //             "title": "Info",
                        //             "text": "Study saved successfully!",
                        //             "status": "info"
                        //         });
                        //     }, function errorCallback(response) {
                        //         DeviceService.msg($scope, {
                        //             "title": "Error",
                        //             "text": "Error saving study!",
                        //             "status": "error"
                        //         });
                        //     });
                        // }else{
                            $http({
                                    method: 'POST',

                                    url:"../aets/"+$scope.aet+"/rs/studies",
                                    // url: "../aets/"+$scope.aet+"/rs/patients/",
                                    data:local
                                }).then(
                                    function successCallback(response) {
                                        console.log("response",response);
                                    },
                                    function errorCallback(response) {
                                        DeviceService.msg($scope, {
                                            "title": "Error",
                                            "text": "Error saving study!",
                                            "status": "error"
                                        });
                                    }
                                );
                            // DeviceService.msg($scope, {
                            //     "title": "Error",
                            //     "text": "Study Instance UID is required!",
                            //     "status": "error"
                            // });
                        // }
                    }
                    vex.close($vex.data().vex.id);
                }
            });
        });
        });
    };
    $scope.editStudy = function(patient, patientkey, studykey, study){
        modifyStudy(patient, "edit", patientkey, studykey, study);
    };
    $scope.createStudy= function(patient){
        // console.log("patient",patient);
        // local["00100020"] = $scope.editstudy.attrs["00100020"];
        // 00200010
        // patient.createButtons = false;
        var study = {
            "attrs":{
                "00200010": { "vr": "SH", "Value":[""]},
                "0020000D": { "vr": "UI", "Value":[""]},
                "00080050": { "vr": "SH", "Value":[""]}
            }
        };
        // modifyStudy(patient, "create");
        modifyStudy(patient, "create", "", "", study);
    };
    var modifyMWL = function(patient, mode, patientkey, mwlkey, mwl){
        $scope.testmodel = {};
        // console.log("patient",patient);
        // console.log("$scope.testmodel",$scope.testmodel);
        // $scope.categories = [{ 
        //                 title: 'Computers',
        //                 categories: [
        //                   {
        //                     title: 'Laptops',
        //                     categories: [
        //                       {
        //                         title: 'Ultrabooks'
        //                       },
        //                       {
        //                         title: 'Macbooks'            
        //                       }
        //                     ]
        //                   },

        //                   {
        //                     title: 'Desktops'
        //                   },

        //                   {
        //                     title: 'Tablets',
        //                     categories: [
        //                       { 
        //                         title: 'Apple'
        //                       },
        //                       {
        //                         title: 'Android'
        //                       }
        //                     ]        
        //                   }
        //                 ]
        //               },
        //               {
        //                 title: 'Printers'
        //               }

        //             ];

        cfpLoadingBar.start();
        var editmwl     = {};
        // console.log("patient",patient);
        // console.log("mwlkey",mwlkey);
        // console.log("mwl",mwl);
        angular.copy(mwl, editmwl);
        if(mode === "edit"){
            angular.forEach(editmwl.attrs,function(value, index) {
                var checkValue = "";    
                if(value.Value && value.Value.length){
                    checkValue = value.Value.join("");
                }
                if(!(value.Value && checkValue != "")){
                    delete editmwl.attrs[index];
                }
                if(value.vr === "DA" && value.Value && value.Value[0]){
                    var string = value.Value[0];
                    var yyyy = string.substring(0,4);
                    var MM = string.substring(4,6);
                    var dd = string.substring(6,8);
                    var timestampDate   = Date.parse(yyyy+"-"+MM+"-"+dd);
                    var date          = new Date(timestampDate);
                    $scope.dateplaceholder[index] = date;
                }
            });
        }
        $scope.editmwl  = editmwl;
        editmwl         = {};
        $scope.lastPressedCode = 0;
        // console.log("$scope.editmwl",$scope.editmwl);

        $scope.removeAttr = function(attrcode){
            switch(arguments.length) {
                case 2:
                    if(arguments[0].length > 1){
                        if($scope.editmwl.attrs[arguments[0][0]].Value[0][arguments[0][1]].Value.length === 1){
                            delete  $scope.editmwl.attrs[arguments[0][0]].Value[0][arguments[0][1]];
                        }else{
                            $scope.editmwl.attrs[arguments[0][0]].Value[0][arguments[0][1]].Value.splice(arguments[1], 1);
                        }
                    }else{
                        if($scope.editmwl.attrs[arguments[0]].Value.length === 1){
                            delete  $scope.editmwl.attrs[arguments[0]];
                        }else{
                            $scope.editmwl.attrs[arguments[0]].Value.splice(arguments[1], 1);
                        }
                    }
                break;
                default:
                    delete  $scope.editmwl.attrs[arguments[0]];
                break;
            }
        };
        // console.log("$scope.editmwl",$scope.editmwl);
        $http.get('iod/mwl.iod.json',{ cache: true}).then(function (res) {
            // $scope.items = res.data;
            // console.log("$scope.editmwl",$scope.editmwl);
            // $scope.items = $scope.editmwl.attrs;
            $scope.items = $filter("mwl")($scope.editmwl.attrs,$scope.iod);
            // console.log("$scope.items",$scope.items);
            // console.log("$scope.items",$scope.items);
            // angular.forEach($scope.editmwl.attrs,function(m, i){
            //     if(!res.data[i] || res.data[i] === undefined){
            //         delete $scope.editmwl.attrs[i];
            //     }
            // });
            // console.log("res",angular.copy(res));
            // var dropdown                = StudiesService.getArrayFromIodExtended(res);
            var dropdown                = StudiesService.getArrayFromIodMwl(res);
            // console.log("dropdown",dropdown);
            // console.log("before replace res.data",angular.copy(res.data));
            res.data = StudiesService.replaceKeyInJson(res.data, "items", "Value");
            // console.log("after replace res.data",angular.copy(res.data));
            $templateRequest('templates/edit_mwl.html').then(function(tpl) {
            $scope.dropdown             = dropdown;
            $scope.DCM4CHE              = DCM4CHE;
            $scope.addPatientAttribut   = "";
            $scope.opendropdown         = false;
            // console.log("after replaceres",angular.copy(res));
            var html                    = $compile(tpl)($scope);
            var header = "Create new mwl";
            if(mode === "edit"){
                header = 'Edit mwl of patient <span>'+patient.attrs["00100010"].Value[0]["Alphabetic"]+'</span> with ID <span>'+patient.attrs["00100020"].Value[0]+'</span>';
            }
            // $http.get('iod/patient.iod.json',{ cache: true}).then(function (patientres) {
            //     // var patientCodes = StudiesService.getArrayFromIodExtended(patientres);
            //     var patientCodes = dropdown;
            //     var patientCodesStringify = JSON.stringify(patientCodes);
            //     console.log("patientCodesStringify",patientCodesStringify);
            //     console.log("patientcodes",patientCodes);
            //     // $scope.isPatientAttr = function(code){
            //     //     console.log("patientCodesStringify.indexOf(code)=",patientCodesStringify.indexOf(code));
            //     //     console.log("is patientAttr code=",code);
            //     //     console.log("typeof code",typeof code);
            //     //     var codeJoined;
            //     //     if(typeof code === "string"){
            //     //         codeJoined = code;
            //     //     }else{
            //     //         codeJoined = code.join(':');
            //     //     }
            //     //     console.log("codeJoined",codeJoined);
            //     //     if(patientCodesStringify.indexOf(codeJoined) !== -1){
            //     //         console.log("return false");
            //     //         return false;
            //     //     }else{
            //     //         console.log("return true");
            //     //         return true;
            //     //     }
            //     // };
            // }); 
            var $vex = vex.dialog.open({
              message: header,
              input: html,
              className:"vex-theme-os edit-patient",
              overlayClosesOnClick: false,
              escapeButtonCloses: false,
              afterOpen: function($vexContent) {
                cfpLoadingBar.complete();
                setTimeout(function(){
                    if(mode === "create"){
                        $(".edit-patient .0020000D").attr("title","To generate it automatically leave it blank");
                        $(".edit-patient .0020000D").attr("placeholder","To generate it automatically leave it blank");
                    }
                    if(mode === "edit"){
                        $(".edit-patient .0020000D").attr("disabled","disabled");
                        $(".edit-patient span.0020000D").remove();
                    }
                    $(".editform .schema-form-fieldset > legend").append('<span class="glyphicon glyphicon-triangle-right"></span>');
                    $(".editform .schema-form-fieldset > legend").bind("click",function(){
                        $(this).siblings("sf-decorator").toggle();
                        var icon = $(this).find(".glyphicon");
                        if(icon.hasClass('glyphicon-triangle-right')){
                            icon.removeClass('glyphicon-triangle-right').addClass('glyphicon-triangle-bottom');
                        }else{
                            icon.removeClass('glyphicon-triangle-bottom').addClass('glyphicon-triangle-right');
                        }
                    });
                    //Click event handling
                    $scope.addAttribute = function(attrcode){
                        addAttribute(attrcode);
                    }
                    var addAttribute = function(attrcode){
                        if(attrcode.indexOf(':') > -1){
                                var codes =  attrcode.split(":"); 
                                if(codes[0] === "00400100"){
                                    if($scope.editmwl.attrs[codes[0]].Value[0][codes[1]] != undefined){
                                        if(res.data[codes[0]].Value[0][codes[1]].multi){
                                            $timeout(function() {
                                                $scope.$apply(function(){
                                                    // $scope.editmwl.attrs[attrcode]  = res.data[attrcode];
                                                    // console.log("res.data",res.data);
                                                    // console.log("$scope.editmwl",$scope.editmwl);
                                                    if(res.data[codes[0]].Value[0][codes[1]].vr === "SQ"){
                                                        // $scope.editmwl.attrs[codes[0]].Value[0][codes[1]]["Value"] = $scope.editmwl.attrs[codes[0]].Value[0][codes[1]]["Value"] || res.data[codes[0]].Value[0][codes[1]].Value;
                                                        // console.log("res.data[codes[0]].Value[0][codes[1]].Value",res.data[codes[0]].Value[0][codes[1]].Value);
                                                        $scope.editmwl.attrs[codes[0]].Value[0][codes[1]]["Value"].push(res.data[codes[0]].Value[0][codes[1]].Value[0]);
                                                    }else{
                                                        $scope.editmwl.attrs[codes[0]].Value[0][codes[1]]["Value"] = $scope.editmwl.attrs[codes[0]].Value[0][codes[1]]["Value"] || [];
                                                        $scope.editmwl.attrs[codes[0]].Value[0][codes[1]]["Value"].push("");
                                                    }
                                                    $scope.addPatientAttribut           = "";
                                                    $scope.opendropdown                 = false;
                                                });
                                            });
                                        }else{
                                            DeviceService.msg($scope, {
                                                    "title": "Warning",
                                                    "text": "Attribute already exists!",
                                                    "status": "warning"
                                            });
                                        }
                                    }else{
                                        $timeout(function() {
                                            $scope.$apply(function(){
                                                $scope.editmwl.attrs[codes[0]].Value[0][codes[1]]  = res.data[codes[0]].Value[0][codes[1]];
                                            });
                                        });
                                    }
                                }else{
                                    $log.error("error, code 00400100 not found on the 0 position");
                                }
                        }else{
                            if($scope.editmwl.attrs[attrcode] != undefined){
                                if(res.data[attrcode].multi){
                                    $timeout(function() {
                                        $scope.$apply(function(){
                                            // $scope.editmwl.attrs[attrcode]  = res.data[attrcode];
                                            $scope.editmwl.attrs[attrcode]["Value"].push("");
                                            $scope.addPatientAttribut           = "";
                                            $scope.opendropdown                 = false;
                                        });
                                    });
                                }else{
                                    DeviceService.msg($scope, {
                                            "title": "Warning",
                                            "text": "Attribute already exists!",
                                            "status": "warning"
                                    });
                                }
                            }else{
                                $timeout(function() {
                                    $scope.$apply(function(){
                                        $scope.editmwl.attrs[attrcode]  = res.data[attrcode];
                                    });
                                });
                            }
                        }
                        $timeout(function() {
                            $scope.$apply(function(){
                                $scope.items = $filter("mwl")($scope.editmwl.attrs,$scope.iod);
                            });
                        });

                    };
                    $(".addPatientAttribut").bind("keydown",function(e){
                        $scope.opendropdown = true;
                        var code = (e.keyCode ? e.keyCode : e.which);
                        $scope.lastPressedCode = code;
                        if(code === 13){
                            var filter = $filter("filter");
                            var filtered = filter($scope.dropdown, $scope.addPatientAttribut);
                            if(filtered){
                                $scope.opendropdown = true;
                            }
                            if($(".dropdown_element.selected").length){
                                var attrcode = $(".dropdown_element.selected").attr("name"); 
                            }else{
                                var attrcode = filtered[0].code;
                            }
                            // console.log("attrcode=",attrcode);
                            addAttribute(attrcode);
                            setTimeout(function(){
                                $scope.lastPressedCode = 0;
                            },1000);
                        }
                        //Arrow down pressed
                        if(code === 40){
                            $scope.$apply(function(){
                                $scope.opendropdown = true;
                            });
                            if(!$(".dropdown_element.selected").length){
                                $(".dropdown_element").first().addClass('selected');
                            }else{
                                if($(".dropdown_element.selected").next().length){
                                    $(".dropdown_element.selected").removeClass('selected').next().addClass('selected');
                                }else{
                                    $(".dropdown_element.selected").removeClass('selected');
                                    $(".dropdown_element").first().addClass('selected');
                                }
                            }

                                if($(".dropdown_element.selected").position()){
                                    $('.dropdown').scrollTop($('.dropdown').scrollTop() + $(".dropdown_element.selected").position().top - $('.dropdown').height()/2 + $(".dropdown_element.selected").height()/2);
                                }
                        }
                        //Arrow up pressed
                        if(code === 38){
                            $scope.$apply(function(){
                                $scope.opendropdown = true;
                            });
                            if(!$(".dropdown_element.selected").length){
                                $(".dropdown_element").prev().addClass('selected');
                            }else{
                                if($(".dropdown_element.selected").index() === 0){
                                    $(".dropdown_element.selected").removeClass('selected');
                                    $(".dropdown_element").last().addClass('selected');
                                }else{
                                    $(".dropdown_element.selected").removeClass('selected').prev().addClass('selected');
                                }
                            }
                            $('.dropdown').scrollTop($('.dropdown').scrollTop() + $(".dropdown_element.selected").position().top - $('.dropdown').height()/2 + $(".dropdown_element.selected").height()/2);
                        }
                        if(code === 27){
                            $scope.$apply(function(){
                                $scope.opendropdown = false;
                            });
                        }
                    });
                    $(".editform .schema-form-fieldset > sf-decorator").hide();
                },1000);//TODO make it dynamic
              },
                onSubmit: function(e) {
                    console.log("on submit");
                    //Prevent submit/close if ENTER was clicked
                    if($scope.lastPressedCode === 13){
                        e.preventDefault();
                    }else{
                        e.preventDefault();
                        // console.log("$vex.data called");
                        $scope.callBackFree = true;
                        $vex.data().vex.callback();
                    }
                  },
                buttons: [
                    $.extend({}, vex.dialog.buttons.YES, {
                      text: 'Save'
                    }), $.extend({}, vex.dialog.buttons.NO, {
                      text: 'Cancel'
                    })
                ],
                callback: function(data) {
                    if($scope.callBackFree){
                        $scope.callBackFree = false;
                        cfpLoadingBar.start();
                        console.log("1data",data);
                        if (data != "undefined" && data === false) {
                            cfpLoadingBar.complete();
                            StudiesService.clearPatientObject($scope.editmwl.attrs);
                            $scope.callBackFree = true;
                            return console.log('Cancelled');
                        }else{
                            StudiesService.clearPatientObject($scope.editmwl.attrs);
                            StudiesService.convertStringToNumber($scope.editmwl.attrs);
                            StudiesService.convertDateToString($scope, "editmwl");

                            //Add patient attributs again
                            // angular.extend($scope.editmwl.attrs, patient.attrs);
                            // $scope.editmwl.attrs.concat(patient.attrs); 
                            var local = {};
                            if($scope.editmwl.attrs["00100020"]){
                                local["00100020"] = $scope.editmwl.attrs["00100020"];
                            }else{
                                local["00100020"] = patient.attrs["00100020"];
                            }
                            angular.forEach($scope.editmwl.attrs,function(m, i){
                                if(res.data[i]){
                                    local[i] = m;
                                }
                            });
                            // if($scope.editmwl.attrs["0020000D"].Value[0]){
                                angular.forEach($scope.editmwl.attrs, function(m, i){
                                    // console.log("res.data",res.data);
                                    // console.log("i",i);
                                    if((res.data && res.data[i] &&res.data[i].vr != "SQ") && m.Value && m.Value.length === 1 && m.Value[0] === ""){
                                        delete $scope.editmwl.attrs[i];
                                    }
                                });


                                // local["00081030"] = { "vr": "SH", "Value":[""]};
                                // local["local["00100020"].Value[0]"] = { "vr": "SH", "Value":[""]};
                                // console.log("local",local);
                                console.log("local",local);
                                $http.post(
                                    "../aets/"+$scope.aet+"/rs/mwlitems",
                                    local
                                ).then(function successCallback(response) {
                                    console.log("in then function");
                                    if(mode === "edit"){
                                        //Update changes on the patient list
                                        // angular.forEach(mwl.attrs, function(m, i){
                                        //     if($scope.editmwl.attrs[i]){
                                        //         mwl.attrs[i] = $scope.editmwl.attrs[i];
                                        //     }
                                        // });
                                        // mwl.attrs = $scope.editmwl.attrs;
                                        $scope.patients[patientkey].mwls[mwlkey].attrs = $scope.editmwl.attrs;
                                        //Force rerendering the directive attribute-list
                                        var id = "#"+patient.attrs['00100020'].Value[0]+$scope.editmwl.attrs['0020000D'].Value[0];
                                        id = id.replace(/\./g, '');
                                        // var id = "#"+$scope.editmwl.attrs["0020000D"].Value;
                                        var attribute = $compile('<attribute-list attrs="patients['+patientkey+'].mwls['+mwlkey+'].attrs"></attribute-list>')($scope);
                                        $(id).html(attribute);
                                    }else{
                                            $timeout(function() {
                                                angular.element("#querymwl").trigger('click');
                                            }, 0);
                                        // if($scope.patientmode){
                                        //     // $scope.queryPatients(0);
                                        // }else{
                                        //     // $scope.queryStudies(0);
                                        //     $timeout(function() {
                                        //         angular.element("#querymwl").trigger('click');
                                        //     }, 0);
                                        // }
                                    }
                                    DeviceService.msg($scope, {
                                        "title": "Info",
                                        "text": "MWL saved successfully!",
                                        "status": "info"
                                    });
                                    $scope.callBackFree = true;
                                }, function errorCallback(response) {
                                    DeviceService.msg($scope, {
                                        "title": "Error",
                                        "text": "Error saving mwl!",
                                        "status": "error"
                                    });
                                    $scope.callBackFree = true;
                                });
                            // }else{
                            //     $http({
                            //             method: 'POST',

                            //             url:"../aets/"+$scope.aet+"/rs/patients/"+local["00100020"].Value[0] + "/studies",
                            //             // url: "../aets/"+$scope.aet+"/rs/patients/",
                            //             data:local,
                            //             headers: {
                            //                 'Content-Type': 'application/json',
                            //                 'Accept': 'text/plain'
                            //             }
                            //         }).then(
                            //             function successCallback(response) {
                            //                 console.log("response",response);
                            //             },
                            //             function errorCallback(response) {
                            //                 DeviceService.msg($scope, {
                            //                     "title": "Error",
                            //                     "text": "Error saving mwl!",
                            //                     "status": "error"
                            //                 });
                            //             }
                            //         );
                            //     // DeviceService.msg($scope, {
                            //     //     "title": "Error",
                            //     //     "text": "mwl Instance UID is required!",
                            //     //     "status": "error"
                            //     // });
                            // }
                        }
                        vex.close($vex.data().vex.id);
                    }
                }
            });
        });
        });
    };
    $scope.editMWL = function(patient, patientkey, mwlkey, mwl){
        modifyMWL(patient, "edit", patientkey, mwlkey, mwl);
    };
    $scope.createMWL = function(patient){
        // console.log("patient",patient);
        // local["00100020"] = $scope.editstudy.attrs["00100020"];
        // 00200010
        console.log("patient",patient);
        // patient.createButtons = false;
        console.log("patient2",angular.copy(patient));
        var mwl = {
            "attrs":{
                "00400100": {
                    "vr": "SQ",
                    "Value": [{
                      "00400001": { "vr": "AE","Value":[""]}
                    }]
                },
                "0020000D": { "vr": "UI", "Value":[""]},
                "00400009": { "vr": "SH", "Value":[""]},
                "00080050": { "vr": "SH", "Value":[""]},
                "00401001": { "vr": "SH", "Value":[""]}
            }
        };
        // modifyStudy(patient, "create");
        modifyMWL(patient, "create", "", "", mwl);
    };
    //Edit / Create Patient
    var modifyPatient = function(patient, mode, patientkey){
        cfpLoadingBar.start();
        var editpatient     = {};
        var oldPatientID;
        var oldIssuer;
        var oldUniversalEntityId;
        var oldUniversalEntityType;
        angular.copy(patient, editpatient);

        if(mode === "edit"){
            angular.forEach(editpatient.attrs,function(value, index) {
                var checkValue = "";    
                if(value.Value && value.Value.length){
                    checkValue = value.Value.join("");
                }
                if(!(value.Value && checkValue != "")){
                    delete editpatient.attrs[index];
                }
                if(index === "00100040" && editpatient.attrs[index] && editpatient.attrs[index].Value && editpatient.attrs[index].Value[0]){
                    editpatient.attrs[index].Value[0] = editpatient.attrs[index].Value[0].toUpperCase();
                }
                // console.log("value.vr",value.vr);
                    // console.log("value",value);
                if(value.vr === "DA" && value.Value && value.Value[0]){
                    var string = value.Value[0];
                    var yyyy = string.substring(0,4);
                    var MM = string.substring(4,6);
                    var dd = string.substring(6,8);
                    var timestampDate   = Date.parse(yyyy+"-"+MM+"-"+dd);
                    var date          = new Date(timestampDate);
                    $scope.dateplaceholder[index] = date;
                }
            });
        }

        $scope.editpatient  = editpatient;
        editpatient         = {};
        $scope.lastPressedCode = 0;
        if(mode === "edit"){
            if($scope.editpatient.attrs["00100020"] && $scope.editpatient.attrs["00100020"].Value && $scope.editpatient.attrs["00100020"].Value[0]){
                oldPatientID            = $scope.editpatient.attrs["00100020"].Value[0];
            }
            if($scope.editpatient.attrs["00100021"] && $scope.editpatient.attrs["00100021"].Value && $scope.editpatient.attrs["00100021"].Value[0]){
                oldIssuer               = $scope.editpatient.attrs["00100021"].Value[0];
            }
            if( 
                $scope.editpatient.attrs["00100024"] && 
                $scope.editpatient.attrs["00100024"].Value && 
                $scope.editpatient.attrs["00100024"].Value[0] && 
                $scope.editpatient.attrs["00100024"].Value[0]["00400032"] &&
                $scope.editpatient.attrs["00100024"].Value[0]["00400032"].Value &&
                $scope.editpatient.attrs["00100024"].Value[0]["00400032"].Value[0]
            ){
                oldUniversalEntityId    = $scope.editpatient.attrs["00100024"].Value[0]["00400032"].Value[0];
                console.log("set oldUniversalEntityId",oldUniversalEntityId);
            }
            if( 
                $scope.editpatient.attrs["00100024"] && 
                $scope.editpatient.attrs["00100024"].Value && 
                $scope.editpatient.attrs["00100024"].Value[0] && 
                $scope.editpatient.attrs["00100024"].Value[0]["00400033"] &&
                $scope.editpatient.attrs["00100024"].Value[0]["00400033"].Value &&
                $scope.editpatient.attrs["00100024"].Value[0]["00400033"].Value[0]
            ){
                oldUniversalEntityType  = $scope.editpatient.attrs["00100024"].Value[0]["00400033"].Value[0];
                console.log("set oldUniversalEntityType",oldUniversalEntityType);
            }
        }

        $scope.removeAttr = function(attrcode){
            switch(arguments.length) {
                case 2:
                    if($scope.editpatient.attrs[arguments[0]].Value.length === 1){
                        delete  $scope.editpatient.attrs[arguments[0]];
                    }else{
                        $scope.editpatient.attrs[arguments[0]].Value.splice(arguments[1], 1);
                    }
                break;
                default:
                    delete  $scope.editpatient.attrs[arguments[0]];
                break;
            }
        };
        $http.get('iod/patient.iod.json',{ cache: true}).then(function (res) {
            var dropdown                = StudiesService.getArrayFromIod(res);
            res.data = StudiesService.replaceKeyInJson(res.data, "items", "Value");
            $templateRequest('templates/edit_patient.html').then(function(tpl) {
            $scope.dropdown             = dropdown;
            $scope.DCM4CHE              = DCM4CHE;
            $scope.addPatientAttribut   = "";
            $scope.opendropdown         = false;
            //angular-datepicker
              // $scope.myDate = new Date();
              // $scope.minDate = new Date(
              //     $scope.myDate.getFullYear(),
              //     $scope.myDate.getMonth() - 2,
              //     $scope.myDate.getDate());
              // $scope.maxDate = new Date(
              //     $scope.myDate.getFullYear(),
              //     $scope.myDate.getMonth() + 2,
              //     $scope.myDate.getDate());
              // $scope.onlyWeekendsPredicate = function(date) {
              //   var day = date.getDay();
              //   return day === 0 || day === 6;
              // }
            // tpl = '<h4>Standard date-picker</h4><md-datepicker ng-model="myDate" md-placeholder="Enter date" ></md-datepicker>'+tpl;
            //
            var html                    = $compile(tpl)($scope);
            var header = "Create new patient";
            if(mode === "edit"){
                header = 'Edit patient';
            }
            var $vex = vex.dialog.open({
              message: header,
              input: html,
              className:"vex-theme-os edit-patient",
              overlayClosesOnClick: false,
              escapeButtonCloses: false,
              afterOpen: function($vexContent) {
                cfpLoadingBar.complete();
                setTimeout(function(){

                    //
        //             is-open="dateOpen[i]" 
        // uib-datepicker-popup="{{format}}"
        // datepicker-options="dateOptions"
        // ng-click="dateOpen(i,p.vr)" 
        // close-text="Close"
                    // console.log("$(.edit-patient .00100030)=",$(".edit-patient .00100030").attr("ng-model"));
                    // $(".edit-patient .00100030").after($compile(
                    //     '<pre>{{datepicker}}</pre>'+
                    //     '<input class="form-control" '+
                    //     'ng-model="editpatient.attrs[\'00100030\'].Value[0]" '+
                    //     'is-open="dateOpen[\'00100030\']" '+
                    //     'uib-datepicker-popup="yyyyMMdd"'+
                    //     'datepicker-options="dateOptions"'+
                    //     'ng-click="dateOpen(\'00100030\',\'DA\')"'+ 
                    //     'close-text="Close"/>'
                    // )($scope));
                    //
                    if(mode === "create"){
                        $(".edit-patient .00100020").attr("title","To generate it automatically leave it blank");
                        $(".edit-patient .00100020").attr("placeholder","To generate it automatically leave it blank");
                    }
                    $(".editform .schema-form-fieldset > legend").append('<span class="glyphicon glyphicon-triangle-right"></span>');
                    $(".editform .schema-form-fieldset > legend").bind("click",function(){
                        $(this).siblings("sf-decorator").toggle();
                        var icon = $(this).find(".glyphicon");
                        if(icon.hasClass('glyphicon-triangle-right')){
                            icon.removeClass('glyphicon-triangle-right').addClass('glyphicon-triangle-bottom');
                        }else{
                            icon.removeClass('glyphicon-triangle-bottom').addClass('glyphicon-triangle-right');
                        }
                    });
                    //Click event handling
                    $scope.addAttribute = function(attrcode){
                        if($scope.editpatient.attrs[attrcode] != undefined){
                            if(res.data[attrcode].multi){
                                $timeout(function() {
                                    $scope.$apply(function(){
                                        // $scope.editpatient.attrs[attrcode]  = res.data[attrcode];
                                        $scope.editpatient.attrs[attrcode]["Value"].push("");
                                        $scope.addPatientAttribut           = "";
                                        $scope.opendropdown                 = false;
                                    });
                                });
                            }else{
                                DeviceService.msg($scope, {
                                        "title": "Warning",
                                        "text": "Attribute already exists!",
                                        "status": "warning"
                                });
                            }
                        }else{
                            $timeout(function() {
                                $scope.$apply(function(){
                                    $scope.editpatient.attrs[attrcode]  = res.data[attrcode];
                                });
                            });
                        }
                    };
                    $(".addPatientAttribut").bind("keydown",function(e){
                        $scope.opendropdown = true;
                        var code = (e.keyCode ? e.keyCode : e.which);
                        $scope.lastPressedCode = code;
                        if(code === 13){
                            var filter = $filter("filter");
                            var filtered = filter($scope.dropdown, $scope.addPatientAttribut);
                            if(filtered){
                                $scope.opendropdown = true;
                            }
                            if($(".dropdown_element.selected").length){
                                var attrcode = $(".dropdown_element.selected").attr("name"); 
                            }else{
                                var attrcode = filtered[0].code;
                            }
                            if($scope.editpatient.attrs[attrcode] != undefined){
                                if(res.data[attrcode].multi){
                                    $timeout(function() {
                                        $scope.$apply(function(){
                                            $scope.editpatient.attrs[attrcode]["Value"].push("");
                                            $scope.addPatientAttribut           = "";
                                            $scope.opendropdown                 = false;
                                        });
                                    });
                                }else{
                                    DeviceService.msg($scope, {
                                        "title": "Warning",
                                        "text": "Attribute already exists!",
                                        "status": "warning"
                                    });
                                }
                            }else{
                                $timeout(function() {
                                    $scope.$apply(function(){
                                        $scope.editpatient.attrs[attrcode]  = res.data[attrcode];
                                    });
                                });
                            }
                            setTimeout(function(){
                                $scope.lastPressedCode = 0;
                            },1000);
                        }
                        //Arrow down pressed
                        if(code === 40){
                            $scope.$apply(function(){
                                $scope.opendropdown = true;
                            });
                            if(!$(".dropdown_element.selected").length){
                                $(".dropdown_element").first().addClass('selected');
                            }else{
                                if($(".dropdown_element.selected").next().length){
                                    $(".dropdown_element.selected").removeClass('selected').next().addClass('selected');
                                }else{
                                    $(".dropdown_element.selected").removeClass('selected');
                                    $(".dropdown_element").first().addClass('selected');
                                }
                            }

                                if($(".dropdown_element.selected").position()){
                                    $('.dropdown').scrollTop($('.dropdown').scrollTop() + $(".dropdown_element.selected").position().top - $('.dropdown').height()/2 + $(".dropdown_element.selected").height()/2);
                                }
                        }
                        //Arrow up pressed
                        if(code === 38){
                            $scope.$apply(function(){
                                $scope.opendropdown = true;
                            });
                            if(!$(".dropdown_element.selected").length){
                                $(".dropdown_element").prev().addClass('selected');
                            }else{
                                if($(".dropdown_element.selected").index() === 0){
                                    $(".dropdown_element.selected").removeClass('selected');
                                    $(".dropdown_element").last().addClass('selected');
                                }else{
                                    $(".dropdown_element.selected").removeClass('selected').prev().addClass('selected');
                                }
                            }
                            $('.dropdown').scrollTop($('.dropdown').scrollTop() + $(".dropdown_element.selected").position().top - $('.dropdown').height()/2 + $(".dropdown_element.selected").height()/2);
                        }
                        if(code === 27){
                            $scope.$apply(function(){
                                $scope.opendropdown = false;
                            });
                        }
                    });
                    $(".editform .schema-form-fieldset > sf-decorator").hide();
                },1000);//TODO make it dynamic
              },
                onSubmit: function(e) {
                    //Prevent submit/close if ENTER was clicked
                    // $(".datepicker .no-close-button").$setValidity('date', true);

                    if($scope.lastPressedCode === 13){
                        e.preventDefault();
                    }else{
                        // console.log("datepicker",$(".datepicker .no-close-button"));
                        // $(".datepicker .no-close-button").$setValidity('date', true);
                        $vex.data().vex.callback();
                    }
                  },
                buttons: [
                    $.extend({}, vex.dialog.buttons.YES, {
                      text: 'Save'
                    }), $.extend({}, vex.dialog.buttons.NO, {
                      text: 'Cancel'
                    })
                ],
                callback: function(data) {
                    // console.log("callback datepicker",$(".datepicker .no-close-button"));
                    cfpLoadingBar.start();
                    if (data === false) {
                        cfpLoadingBar.complete();
                        StudiesService.clearPatientObject($scope.editpatient.attrs);
                        return console.log('Cancelled');
                    }else{
                        StudiesService.clearPatientObject($scope.editpatient.attrs);
                        StudiesService.convertStringToNumber($scope.editpatient.attrs);
                        StudiesService.convertDateToString($scope, "editpatient");
                        if($scope.editpatient.attrs["00100020"] && $scope.editpatient.attrs["00100020"].Value[0]){
                            angular.forEach($scope.editpatient.attrs, function(m, i){
                                if(res.data && res.data[i] && res.data[i].vr != "SQ" && m.Value && m.Value.length === 1 && m.Value[0] === ""){
                                    delete $scope.editpatient.attrs[i];
                                }
                            });
                            // $scope.editpatient.attrs["00104000"] = { "vr": "LT", "Value":[""]};
                            oldPatientID = oldPatientID || $scope.editpatient.attrs["00100020"].Value[0];
                            // if($scope.editpatient.attrs["00100021"] && $scope.editpatient.attrs["00100021"].Value && $scope.editpatient.attrs["00100021"].Value[0]){
                            //     if(!oldIssuer || oldIssuer === undefined){
                            //         oldIssuer = $scope.editpatient.attrs["00100021"].Value[0];
                            //     }
                            // }
                            var issuer =                oldIssuer != undefined;
                            var universalEntityId =     oldUniversalEntityId != undefined;
                            var universalEntityType =   oldUniversalEntityType != undefined;

                            if(issuer){
                                oldPatientID += "^^^"+oldIssuer;
                            }
                            if(universalEntityId || universalEntityType){
                                // if(!oldUniversalEntityId || oldUniversalEntityId === undefined){
                                //     oldUniversalEntityId    = $scope.editpatient.attrs["00100024"].Value[0]["00400032"].Value[0];
                                // }
                                // if(!oldUniversalEntityType || oldUniversalEntityType === undefined){
                                //     oldUniversalEntityType  = $scope.editpatient.attrs["00100024"].Value[0]["00400033"].Value[0];
                                // }
                                if(!issuer){
                                    oldPatientID += "^^^";
                                }

                                if(universalEntityId && oldUniversalEntityId){
                                    oldPatientID += "&"+ oldUniversalEntityId;
                                }
                                if(universalEntityType && oldUniversalEntityType){
                                    oldPatientID += "&"+ oldUniversalEntityType;
                                }
                            }
                            // console.log("$scope.editpatient.attrs",$scope.editpatient.attrs);
                            $http.put(
                                "../aets/"+$scope.aet+"/rs/patients/"+oldPatientID,
                                $scope.editpatient.attrs
                            ).then(function successCallback(response) {
                                if(mode === "edit"){
                                    //Update changes on the patient list
                                    patient.attrs = $scope.editpatient.attrs;
                                    //Force rerendering the directive attribute-list
                                    var id = "#"+$scope.editpatient.attrs["00100020"].Value;
                                    var attribute = $compile('<attribute-list attrs="patients['+patientkey+'].attrs"></attribute-list>')($scope);
                                    $(id).html(attribute);
                                }else{
                                    if($scope.patientmode){
                                        $timeout(function() {
                                            angular.element("#querypatients").trigger('click');
                                        }, 0);
                                        // $scope.queryPatients(0);
                                    }else{
                                        // $scope.queryStudies(0);
                                        $timeout(function() {
                                            angular.element("#querystudies").trigger('click');
                                        }, 0);
                                    }
                                }
                                // $scope.dateplaceholder = {};
                                // console.log("data",data);
                                // console.log("datepicker",$(".datepicker .no-close-button"));
                                DeviceService.msg($scope, {
                                    "title": "Info",
                                    "text": "Patient saved successfully!",
                                    "status": "info"
                                });
                            }, function errorCallback(response) {
                                DeviceService.msg($scope, {
                                    "title": "Error",
                                    "text": "Error saving patient!",
                                    "status": "error"
                                });
                            });
                            ////
                        }else{
                            if(mode === "create"){
                                $http({
                                    method: 'POST',
                                    url: "../aets/"+$scope.aet+"/rs/patients/",
                                    data:$scope.editpatient.attrs,
                                    headers: {
                                        'Content-Type': 'application/json',
                                        'Accept': 'text/plain'
                                    }
                                }).then(
                                    function successCallback(response) {
                                        console.log("response",response);
                                    },
                                    function errorCallback(response) {
                                        DeviceService.msg($scope, {
                                            "title": "Error",
                                            "text": "Error saving patient!",
                                            "status": "error"
                                        });
                                    }
                                );
                            }else{
                                DeviceService.msg($scope, {
                                    "title": "Error",
                                    "text": "Patient ID is required!",
                                    "status": "error"
                                });
                            }
                             // $scope.dateplaceholder = {};
                        }
                    }
                    vex.close($vex.data().vex.id);
                }
            });
        });
        });
    };
    $scope.editPatient = function(patient, patientkey){
        modifyPatient(patient, "edit", patientkey);
    };
    $scope.createPatient = function(patient){
                            // $http.post(
                            //     "../aets/"+$scope.aet+"/rs/patients/"
                            // )


        var patient = {
            "attrs":{
                "00100010": { "vr": "PN", "Value":[""]},
                "00100020": { "vr": "LO", "Value":[""]},
                "00100021": { "vr": "LO", "Value":[""]},
                "00100030": { "vr": "DA", "Value":[""]},
                "00100040": { "vr": "CS", "Value":[""]}
            }
        };
        // var patient = {
        //     "attrs":{
        //         "00100030": { "vr": "DA", "Value":["19320112"]},
        //         "00100040": { "vr": "CS", "Value":["M"]}
        //     }
        // };

        modifyPatient(patient, "create");
    };

    $scope.clearForm = function(){
        angular.forEach($scope.filter,function(m,i){
            if(i != "orderby"){
                $scope.filter[i] = "";
            }
        });
        angular.element(".single_clear").hide();
        $scope.studyDate.fromObject = null;
        $scope.studyDate.toObject = null;
        $scope.studyDate.from = "";
        $scope.studyDate.to = "";
        $scope.studyTime.fromObject = null;
        $scope.studyTime.toObject = null;
        $scope.studyTime.from = "";
        $scope.studyTime.to = "";
        $scope["ScheduledProcedureStepSequence.ScheduledProcedureStepStartDate"].fromObject = null;
        $scope["ScheduledProcedureStepSequence.ScheduledProcedureStepStartDate"].toObject = null;
        $scope["ScheduledProcedureStepSequence.ScheduledProcedureStepStartDate"].from = "";
        $scope["ScheduledProcedureStepSequence.ScheduledProcedureStepStartDate"].to = "";
        $scope["ScheduledProcedureStepSequence.ScheduledProcedureStepStartTime"].fromObject = null;
        $scope["ScheduledProcedureStepSequence.ScheduledProcedureStepStartTime"].toObject = null;
        $scope["ScheduledProcedureStepSequence.ScheduledProcedureStepStartTime"].from = "";
        $scope["ScheduledProcedureStepSequence.ScheduledProcedureStepStartTime"].to = "";
    };
    $scope.selectModality = function(key){
        $scope.filter.ModalitiesInStudy = key;
        $scope.filter['ScheduledProcedureStepSequence.Modality'] = key;
        angular.element(".Modality").show();
        $scope.showModalitySelector=false;
    };
    $scope.checkKeyModality = function(keyEvent) {
        if (keyEvent.which === 13){
            $scope.showModalitySelector=false;
        }
    };
    $scope.studyDateFrom = {
        opened: false
    };
    $scope.studyDateTo = {
        opened: false
    };
    $scope.rejectedBefore = {
        opened:false
    };
    $scope.toggleAttributs = function(instance,art){
        if(art==="fileattributs"){
            instance.showAttributes = false;
            instance.showFileAttributes = !instance.showFileAttributes;
        }else{
            instance.showAttributes = !instance.showAttributes;
            instance.showFileAttributes = false;
        }
    };
    //Close modaity selctor when you click some where else but on the selector
    angular.element("html").bind("click",function(e){
        if(!(e.target.id === "Modality")){
            if(angular.element(e.target).closest('.modality_selector').length === 0 && angular.element(e.target).parent('.modality_selector').length === 0 && $scope.showModalitySelector){
                $scope.$apply(function(){
                    $scope.showModalitySelector = false;
                });
            }
        }
        if(e.target.id != "addPatientAttribut"){
            $scope.$apply(function(){
                $scope.opendropdown         = false;
            });
        }
        if(e.target.id != "clipboard" && e.target.id != "clipboardtoggle" && e.target.id != "clipboard_content"){
            $scope.$apply(function(){
                $scope.showClipboardContent = false;
            });
        }
        if(e.target.id != "showoptionlist" && e.target.id != "showoptionlistbutton"){
            $scope.$apply(function(){
                $scope.showoptionlist = false;
            });
        }
        // $scope.selected = {};
        //clear selections on object
        // console.log("$scope.keysdown",$scope.keysdown);
        // console.log("$scope.keysdown",Object.keys($scope.keysdown).length);
        // console.log("$scope.selected",$scope.selected);
        // console.log("$scope.selected",Object.keys($scope.selected).length);
        if(Object.keys($scope.keysdown).length === 0 && Object.keys($scope.selected).length > 0){
            StudiesService.clearSelection($scope.patients);
        }
    });

    $scope.addEffect = function(direction){
        var element = angular.element(".div-table");
            element.removeClass('fadeInRight').removeClass('fadeInLeft');
            setTimeout(function(){
                if(direction === "left"){
                    element.addClass('animated').addClass("fadeOutRight");
                }
                if(direction === "right"){
                    element.addClass('animated').addClass("fadeOutLeft");
                }
            },1);
            setTimeout(function(){
                element.removeClass('fadeOutRight').removeClass('fadeOutLeft');
                if(direction === "left"){
                    element.addClass("fadeInLeft").removeClass('animated');
                }
                if(direction === "right"){
                    element.addClass("fadeInRight").removeClass('animated');
                }
            },301);
    };
    $scope.dateOpen = {};
    $scope.studyDateFromOpen = function() {
        cfpLoadingBar.start();
        $scope.studyDateFrom.opened = true;
        var watchPicker = setInterval(function(){ 
                                //uib-datepicker-popup uib-close
            if(angular.element(".uib-datepicker-popup .uib-close").length > 0){
                clearInterval(watchPicker);
                cfpLoadingBar.complete();
            }
        }, 10);
    };

    $scope.opendateplaceholder = function(t, vr) {
        // console.log("t",t);
        // console.log("vr",vr);
        // console.log("$scope.dateOpen",$scope.dateOpen);
        // console.log("dateplaceholder[t]",$scope.dateplaceholder[t]);
        if(!$scope.dateOpen[t]){
            $scope.dateOpen[t] = true;
        }
        // if(vr === "DA"){
        // }
        // console.log("$scope.dateOpen",$scope.dateOpen);
        // cfpLoadingBar.start();
        // $scope.studyDateFrom.opened = true;
        // var watchPicker = setInterval(function(){ 
        //                         //uib-datepicker-popup uib-close
        //     if(angular.element(".uib-datepicker-popup .uib-close").length > 0){
        //         clearInterval(watchPicker);
        //         cfpLoadingBar.complete();

        //     }
        // }, 10);
    };

    $scope.studyDateToOpen = function() {
        cfpLoadingBar.start();
        $scope.studyDateTo.opened = true;
        var watchPicker = setInterval(function(){ 
            if(angular.element(".uib-datepicker-popup .uib-close").length > 0){
                clearInterval(watchPicker);
                cfpLoadingBar.complete();
            }
        }, 10);
    };
    $scope.clockpicker = {
          twelvehour: false,
          autoclose : true,
          align :'left',
          nativeOnMobile: true,
          afterDone: function() {
                    cfpLoadingBar.start();
                    StudiesService.updateTime($scope.studyTime, $scope);
          }
    };

    $scope.$watchCollection('studyDate', function(newValue, oldValue){
        cfpLoadingBar.start();
        if(newValue.fromObject != oldValue.fromObject){
            if($scope.studyDate.fromObject){
                angular.element(".StudyDateFrom").show();
            }else{
                angular.element(".StudyDateFrom").hide();
            }
            StudiesService.updateFromDate($scope.studyDate, $scope);
            // StudiesService.updateFromDate($scope.ScheduledProcedureStepSequence);
        }
        if(newValue.toObject != oldValue.toObject){
            cfpLoadingBar.start();
            if($scope.studyDate.toObject){
                angular.element(".StudyDateTo").show();
            }else{
                angular.element(".StudyDateTo").hide();
            }
            StudiesService.updateToDate($scope.studyDate, $scope);
            // StudiesService.updateToDate($scope.ScheduledProcedureStepSequence);
        }
        cfpLoadingBar.complete();
    });

    $scope.queryPatients = function(offset) {
        cfpLoadingBar.start();
        if (offset < 0) offset = 0;
        QidoService.queryPatients(
            rsURL(),
            createQueryParams(offset, $scope.limit+1, createPatientFilterParams())
        ).then(function (res) {
            $scope.morePatients = undefined;
            $scope.moreStudies = undefined;
            if(res.data != ""){
                $scope.patients = res.data.map(function (attrs, index) {
                    return {
                        moreStudies: false,
                        offset: offset + index,
                        attrs: attrs,
                        studies: null,
                        showAttributes: false
                    };
                });
                if ($scope.morePatients = ($scope.patients.length > $scope.limit)) {
                    $scope.patients.pop();
                }
            } else {
                $scope.patients = [];
                DeviceService.msg($scope, {
                    "title": "Info",
                    "text": "No matching Patients found!",
                    "status": "info"
                });
            }
            // var state = ($scope.allhidden) ? "hide" : "show";
            // setTimeout(function(){
            //     togglePatientsHelper(state);
            // }, 1000);
            cfpLoadingBar.complete();
        });
    };
    $scope.queryStudies = function(offset) {

        cfpLoadingBar.start();
        if (offset < 0 || offset === undefined) offset = 0;
        QidoService.queryStudies(
            rsURL(),
            createQueryParams(offset, $scope.limit+1, createStudyFilterParams())
        ).then(function (res) {
            $scope.patients = [];
 //           $scope.studies = [];
            $scope.morePatients = undefined;
            $scope.moreStudies = undefined;
            if(res.data != ""){
                var pat, study, patAttrs, tags = $scope.attributeFilters.Patient.dcmTag;
                res.data.forEach(function (studyAttrs, index) {
                    patAttrs = {};
                    extractAttrs(studyAttrs, tags, patAttrs);
                    if (!(pat && angular.equals(pat.attrs, patAttrs))) {
                        pat = {
                            attrs: patAttrs,
                            studies: [],
                            showAttributes: false
                        };
                        // $scope.$apply(function () {
                            $scope.patients.push(pat);
                        // });
                    }
                    study = {
                        patient: pat,
                        offset: offset + index,
                        moreSeries: false,
                        attrs: studyAttrs,
                        series: null,
                        showAttributes: false,
                        fromAllStudies:false
                    };
                    pat.studies.push(study);
 //                   $scope.studies.push(study); //sollte weg kommen
                });
                if ($scope.moreStudies = (res.data.length > $scope.limit)) {
                    pat.studies.pop();
                    if (pat.studies.length === 0)
                        $scope.patients.pop();
                    // $scope.studies.pop();
                }
            } else {
                DeviceService.msg($scope, {
                    "title": "Info",
                    "text": "No matching Studies found!",
                    "status": "info"
                });
            }
            // setTimeout(function(){
            //     togglePatientsHelper("hide");
            // }, 1000);
            cfpLoadingBar.complete();
        });
    };
    $scope.queryAllStudiesOfPatient = function(patient, offset) {
        cfpLoadingBar.start();
        if (offset < 0) offset = 0;
        QidoService.queryStudies(
            rsURL(),
            createQueryParams(offset, $scope.limit+1, {
                PatientID: valueOf(patient.attrs['00100020']),
                IssuerOfPatientID: valueOf(patient.attrs['00100021']),
                orderby: $scope.filter.orderby !== "StudyDate,StudyTime" ? "-StudyDate,-StudyTime" : $scope.filter.orderby
            })
        ).then(function (res) {
            if(res.data.length > 0){

                patient.studies = res.data.map(function (attrs, index) {
                    return {
                        patient: patient,
                        offset: offset + index,
                        moreSeries: false,
                        attrs: attrs,
                        series: null,
                        showAttributes: false,
                        fromAllStudies:true
                    };
                });
                if (patient.moreStudies = (patient.studies.length > $scope.limit)) {
                    patient.studies.pop();
                }
                StudiesService.trim($scope);
                console.log("patient",patient);
            }else{
                DeviceService.msg($scope, {
                    "title": "Info",
                    "text": "No matching Studies found!",
                    "status": "info"
                });
            }
            cfpLoadingBar.complete();
        });
    };
    $scope.querySeries = function(study, offset) {
         cfpLoadingBar.start();
        if (offset < 0) offset = 0;
        QidoService.querySeries(
            rsURL(),
            study.attrs['0020000D'].Value[0],
            createQueryParams(offset, $scope.limit+1, { orderby: 'SeriesNumber'})
        ).then(function (res) {
            if(res.data){
                if(res.data.length === 0){
                    DeviceService.msg($scope, {
                            "title": "Info",
                            "text": "No matching series found!",
                            "status": "info"
                    });
                }else{

                    study.series = res.data.map(function (attrs, index) {
                        return {
                                study: study,
                                offset: offset + index,
                                moreInstances: false,
                                attrs: attrs,
                                instances: null,
                                showAttributes: false
                        };
                    });
                    if (study.moreSeries = (study.series.length > $scope.limit)) {
                        study.series.pop();
                    }
                    StudiesService.trim($scope);
                }
                cfpLoadingBar.complete();
            }else{
                DeviceService.msg($scope, {
                        "title": "Info",
                        "text": "No matching series found!",
                        "status": "info"
                });
            }
        });
    };

    $scope.queryInstances = function (series, offset) {
         cfpLoadingBar.start();
        if (offset < 0) offset = 0;
        QidoService.queryInstances(
            rsURL(),
            series.attrs['0020000D'].Value[0],
            series.attrs['0020000E'].Value[0],
            createQueryParams(offset, $scope.limit+1, { orderby: 'InstanceNumber'})
        )
        .then(function (res) {
            if(res.data){
                series.instances = res.data.map(function(attrs, index) {
                    var numberOfFrames = valueOf(attrs['00280008']),
                        gspsQueryParams = createGSPSQueryParams(attrs),
                        video = isVideo(attrs);
                        cfpLoadingBar.complete();
                    return {
                        series: series,
                        offset: offset + index,
                        attrs: attrs,
                        showAttributes: false,
                        showFileAttributes:false,
                        wadoQueryParams: {
                            studyUID: attrs['0020000D'].Value[0],
                            seriesUID: attrs['0020000E'].Value[0],
                            objectUID: attrs['00080018'].Value[0]
                        },
                        video: video,
                        numberOfFrames: numberOfFrames,
                        gspsQueryParams: gspsQueryParams,
                        views: createArray(video || numberOfFrames || gspsQueryParams.length || 1),
                        view: 1
                    };
                });
            }else{
                series.instances = {};
            }
            if (series.moreInstances = (series.instances.length > $scope.limit)) {
                series.instances.pop();
            }
            StudiesService.trim($scope);
            cfpLoadingBar.complete();
        });
    };
    $scope.exportStudy = function(study) {
            var html = $compile('<select id="exporter" ng-model="exporterID" class="col-md-12"><option ng-repeat="exporter in exporters" title="{{exporter.description}}">{{exporter.id}}</option></select>')($scope);
            vex.dialog.open({
              message: 'Select Exporter',
              input: html,
              buttons: [
                $.extend({}, vex.dialog.buttons.YES, {
                  text: 'Export'
                }), $.extend({}, vex.dialog.buttons.NO, {
                  text: 'Cancel'
                })
              ],
              callback: function(data) {
                if (data === false) {
                  return console.log('Cancelled');
                }else{
                    $http.get(studyURL(study.attrs) + '/export/' + $scope.exporterID);
                }
              }
            });
    };
    $scope.exportSeries = function(series) {
            var html = $compile('<select id="exporter" ng-model="exporterID" class="col-md-12"><option ng-repeat="exporter in exporters" title="{{exporter.description}}">{{exporter.id}}</option></select>')($scope);
            vex.dialog.open({
              message: 'Select Exporter',
              input: html,
              buttons: [
                $.extend({}, vex.dialog.buttons.YES, {
                  text: 'Export'
                }), $.extend({}, vex.dialog.buttons.NO, {
                  text: 'Cancel'
                })
              ],
              callback: function(data) {
                if (data === false) {
                  return console.log('Cancelled');
                }else{
                    $http.get(seriesURL(series.attrs) + '/export/' + $scope.exporterID);
                }
              }
            });
    };
    $scope.exportInstance = function(instance) {
            var html = $compile('<select id="exporter" ng-model="exporterID" class="col-md-12"><option ng-repeat="exporter in exporters" title="{{exporter.description}}">{{exporter.id}}</option></select>')($scope);
            vex.dialog.open({
              message: 'Select Exporter',
              input: html,
              buttons: [
                $.extend({}, vex.dialog.buttons.YES, {
                  text: 'Export'
                }), $.extend({}, vex.dialog.buttons.NO, {
                  text: 'Cancel'
                })
              ],
              callback: function(data) {
                if (data === false) {
                  return console.log('Cancelled');
                }else{
                    $http.get(instanceURL(instance.attrs) + '/export/' + $scope.exporterID);
                }
              }
            });

    };
    $scope.deleteStudy = function(study){
        cfpLoadingBar.start();
        console.log("study",study);
        if(study.attrs['00201208'].Value[0] === 0){
            vex.dialog.confirm({
              message: 'Are you sure you want to delete this study?',
              callback: function(value) {
                if(value){
                    $http({
                        method: 'DELETE',
                        url:"../aets/"+$scope.aet+"/rs/studies/"+study.attrs["0020000D"].Value[0],
                    }).then(
                        function successCallback(response) {
                            DeviceService.msg($scope, {
                                "title": "Info",
                                "text": "Study deleted successfully!",
                                "status": "info"
                            });
                            console.log("response",response);
                            cfpLoadingBar.complete();
                        },
                        function errorCallback(response) {
                            DeviceService.msg($scope, {
                                "title": "Error",
                                "text": "Error deleting study!",
                                "status": "error"
                            });
                            cfpLoadingBar.complete();
                        }
                    );
                }else{
                    $log.log("deleting canceled");
                    cfpLoadingBar.complete();
                }
              }
            });
        }else{
            DeviceService.msg($scope, {
                "title": "Error",
                "text": "Study not empty!",
                "status": "error"
            });
            cfpLoadingBar.complete();
        }
    };
    $scope.deletePatient = function(patient,patients, patientkey){
        cfpLoadingBar.start();
        // console.log("study",study);
        if(patient.attrs['00201200'].Value[0] === 0){
            vex.dialog.confirm({
              message: 'Are you sure you want to delete this patient?',
              callback: function(value) {
                if(value){
                    $http({
                        method: 'DELETE',
                        url:"../aets/"+$scope.aet+"/rs/patients/"+patient.attrs["00100020"].Value[0],
                    }).then(
                        function successCallback(response) {
                            DeviceService.msg($scope, {
                                "title": "Info",
                                "text": "Patient deleted successfully!",
                                "status": "info"
                            });
                            console.log("patients",patients);
                            console.log("patientkey",patientkey);
                            $timeout(function() {
                                    patients.splice(patientkey,1);
                                    angular.element("#querypatients").trigger('click');
                            });
                            console.log("response",response);
                            cfpLoadingBar.complete();
                        },
                        function errorCallback(response) {
                            DeviceService.msg($scope, {
                                "title": "Error",
                                "text": "Error deleting patient!",
                                "status": "error"
                            });
                            // angular.element("#querypatients").trigger('click');
                            cfpLoadingBar.complete();
                        }
                    );
                }else{
                    console.log("deleting canceled");
                    cfpLoadingBar.complete();
                }
              }
            });
        }else{
            DeviceService.msg($scope, {
                "title": "Error",
                "text": "Patient not empty!",
                "status": "error"
            });
            cfpLoadingBar.complete();
        }
        // angular.element("#querypatients").trigger('click');
    };
    $(document).keydown(function(e){
        // console.log("e",e);
        $scope.pressedKey = e.keyCode
          // Do we already know it's down?
        if ($scope.keysdown[e.keyCode]) {
            // Ignore it
            return;
        }
        console.log("e.keyCode",e.keyCode);
         // Remember it's down
        $timeout(function() {
            $scope.$apply(function(){
                $scope.keysdown[e.keyCode] = true;
                console.log("$scope.keysdown",$scope.keysdown);
                if($scope.keysdown[17]===true && $scope.keysdown[67]===true){
                    console.log("ctrl c");
                    $scope.clipboard["selected"] = $scope.clipboard["selected"] || {};
                    angular.copy($scope.selected, $scope.clipboard.selected);
                    if($scope.clipboard.action && $scope.clipboard.action === "move"){
                        vex.dialog.confirm({
                            message: "Are you sure you want to change the action from move to copy?",
                            callback: function(m) {
                                if (m) {
                                    $scope.clipboard["action"] = "copy";
                                }
                            }
                        });
                    }else{
                        $scope.clipboard["action"] = "copy";
                    }
                    console.log("$scope.clipboard",$scope.clipboard);
                }
                if($scope.keysdown[17]===true && $scope.keysdown[86]===true){
                    console.log("ctrl v");
                }
                if($scope.keysdown[17]===true && $scope.keysdown[88]===true){
                    console.log("ctrl x");
                    $scope.clipboard["selected"] = $scope.clipboard["selected"] || {};
                    angular.copy($scope.selected, $scope.clipboard.selected);
                    if($scope.clipboard.action && $scope.clipboard.action === "copy"){
                        vex.dialog.confirm({
                            message: "Are you sure you want to change the action from copy to move?",
                            callback: function(m) {
                                if (m) {
                                    $scope.clipboard["action"] = "move";
                                }
                            }
                        });
                    }else{
                        $scope.clipboard["action"] = "move";
                    }
                    console.log("$scope.clipboard",$scope.clipboard);
                }
            });
        });
        
    
    });
    $(document).keyup(function(e){
        $timeout(function() {
            $scope.$apply(function(){
                $scope.pressedKey = null;
                delete $scope.keysdown[e.keyCode];
            });
        });
    });
    $scope.select = function(object, modus){
        /*
        {
          "StudyInstanceUID": "string",
          "ReferencedSeriesSequence": [
            {
              "SeriesInstanceUID": "string",
              "ReferencedSOPSequence": [
                {
                  "ReferencedSOPClassUID": "string",
                  "ReferencedSOPInstanceUID": "string"
                },
                                {
                  "ReferencedSOPClassUID": "string",
                  "ReferencedSOPInstanceUID": "string"
                }
              ]
            }
          ]
        }
*/
        
        console.log("modus",modus);
        console.log("object",object);
        console.log("$scope.pressedKey",$scope.pressedKey);
        console.log("$scope.keysdown",$scope.keysdown);
        console.log("$scope.keysdown.length",Object.keys($scope.keysdown).length);
        //0020000D object Instance UID
        if(Object.keys($scope.keysdown).length === 1 && $scope.keysdown[17] === true){
            $scope.showClipboardHeaders[modus] = true;
            object.selected = !object.selected;
            $scope.selected[object.attrs["0020000D"].Value[0]] = $scope.selected[object.attrs["0020000D"].Value[0]] || {};
            // $scope.selected[object.attrs["0020000D"].Value[0]]["modus"] = $scope.selected[object.attrs["0020000D"].Value[0]]["modus"] || modus;
            $scope.selected[object.attrs["0020000D"].Value[0]]["StudyInstanceUID"] = $scope.selected[object.attrs["0020000D"].Value[0]]["StudyInstanceUID"] || object.attrs["0020000D"].Value[0];
            if(modus === "study"){
                angular.forEach(object.series, function(m,k){
                    if(m.selected != undefined){
                        m.selected = !m.selected;
                    }else{
                        m.selected = object.selected;
                    }
                    angular.forEach(m.instances, function(j,i){
                        if(j.selected != undefined){
                            j.selected = !j.selected;
                        }else{
                            j.selected = object.selected;
                        }
                    });

                });
            }
            if(modus === "series"){
                angular.forEach(object.instances, function(j,i){
                    if(j.selected != undefined){
                        j.selected = !j.selected;
                    }else{
                        j.selected = object.selected;
                    }
                });
                $scope.selected[object.attrs["0020000D"].Value[0]]["ReferencedSeriesSequence"] = $scope.selected[object.attrs["0020000D"].Value[0]]["ReferencedSeriesSequence"] || []
                var SeriesInstanceUIDInArray = false;
                if($scope.selected[object.attrs["0020000D"].Value[0]]["ReferencedSeriesSequence"]){

                    angular.forEach($scope.selected[object.attrs["0020000D"].Value[0]]["ReferencedSeriesSequence"], function(s,l){
                        console.log("s",s);
                        console.log("l",l);
                        if(s.SeriesInstanceUID === object.attrs["0020000E"].Value[0]){
                            SeriesInstanceUIDInArray = true;
                        }
                    });
                }else{  
                    SeriesInstanceUIDInArray = false; 
                }
                if(!SeriesInstanceUIDInArray){
                    $scope.selected[object.attrs["0020000D"].Value[0]]["ReferencedSeriesSequence"].push({
                                                                                                    "SeriesInstanceUID": object.attrs["0020000E"].Value[0]
                                                                                                });

                }
            }
            if(modus === "instance"){
                
                $scope.selected[object.attrs["0020000D"].Value[0]]["ReferencedSeriesSequence"] = $scope.selected[object.attrs["0020000D"].Value[0]]["ReferencedSeriesSequence"] || []
                var SeriesInstanceUIDInArray = false;
                if($scope.selected[object.attrs["0020000D"].Value[0]]["ReferencedSeriesSequence"]){

                    angular.forEach($scope.selected[object.attrs["0020000D"].Value[0]]["ReferencedSeriesSequence"], function(s,l){
                        console.log("s",s);
                        console.log("l",l);
                        if(s.SeriesInstanceUID === object.attrs["0020000E"].Value[0]){
                            SeriesInstanceUIDInArray = true;
                        }
                    });
                }else{  
                    SeriesInstanceUIDInArray = false; 
                }
                if(!SeriesInstanceUIDInArray){
                    $scope.selected[object.attrs["0020000D"].Value[0]]["ReferencedSeriesSequence"].push({
                                                                                                    "SeriesInstanceUID": object.attrs["0020000E"].Value[0]
                                                                                                });

                }
                angular.forEach($scope.selected[object.attrs["0020000D"].Value[0]]["ReferencedSeriesSequence"],function(m,i){
                    if(m.SeriesInstanceUID === object.attrs["0020000E"].Value[0]){

                        $scope.selected[object.attrs["0020000D"].Value[0]]["ReferencedSeriesSequence"][i]["ReferencedSOPSequence"] = $scope.selected[object.attrs["0020000D"].Value[0]]["ReferencedSeriesSequence"][i]["ReferencedSOPSequence"] || [];
                        $scope.selected[object.attrs["0020000D"].Value[0]]["ReferencedSeriesSequence"][i]["ReferencedSOPSequence"].push(                                                                                                                    {
                                                                                                                      "ReferencedSOPClassUID": object.attrs["00080016"].Value[0],
                                                                                                                      "ReferencedSOPInstanceUID": object.attrs["00080018"].Value[0]
                                                                                                                    });
                    }
                });
            }
            // $scope.selected[modus] = $scope.selected[modus] || [];
            // $scope.selected[modus].push(object);
            console.log("$scope.selected",$scope.selected);
        }
    };
    $scope.rejectStudy = function(study) {
        if($scope.trashaktive){
            $http.get(studyURL(study.attrs) + '/reject/' + $scope.rjcode.codeValue + "^"+ $scope.rjcode.codingSchemeDesignator).then(function (res) {
                // $scope.queryStudies($scope.studies[0].offset);
                $scope.queryStudies($scope.patients[0].offset);
            });
        }else{
            var html = $compile('<select id="reject" ng-model="reject" name="reject" class="col-md-9"><option ng-repeat="rjn in rjnotes" title="{{rjn.codeMeaning}}" value="{{rjn.codeValue}}^{{rjn.codingSchemeDesignator}}">{{rjn.label}}</option></select>')($scope);
            vex.dialog.open({
              message: 'Select rejected type',
              input: html,
              buttons: [
                $.extend({}, vex.dialog.buttons.YES, {
                  text: 'Reject'
                }), $.extend({}, vex.dialog.buttons.NO, {
                  text: 'Cancel'
                })
              ],
              callback: function(data) {
                if (data === false) {
                    console.log("$scope.patients",$scope.patients);
                  return console.log('Cancelled');
                }else{
                    $http.get(studyURL(study.attrs) + '/reject/' + $scope.reject).then(function (res) {
                        // $scope.queryStudies($scope.studies[0].offset);
                        $scope.queryStudies($scope.patients[0].offset);
                    });
                }
              }
            });
        }
    };
    $scope.rejectSeries = function(series) {
        if($scope.trashaktive){
            $http.get(seriesURL(series.attrs) + '/reject/' + $scope.rjcode.codeValue + "^"+ $scope.rjcode.codingSchemeDesignator).then(function (res) {
                // $scope.queryStudies($scope.studies[0].offset);
                $scope.queryStudies($scope.patients[0].offset);
            });
        }else{
            var html = $compile('<select id="reject" ng-model="reject" name="reject" class="col-md-9"><option ng-repeat="rjn in rjnotes" title="{{rjn.codeMeaning}}" value="{{rjn.codeValue}}^{{rjn.codingSchemeDesignator}}">{{rjn.label}}</option></select>')($scope);
            vex.dialog.open({
              message: 'Select rejected type',
              input: html,
              buttons: [
                $.extend({}, vex.dialog.buttons.YES, {
                  text: 'Reject'
                }), $.extend({}, vex.dialog.buttons.NO, {
                  text: 'Cancel'
                })
              ],
              callback: function(data) {
                if (data === false) {
                  return console.log('Cancelled');
                }else{
                    $http.get(seriesURL(series.attrs) + '/reject/' + $scope.reject).then(function (res) {
                        $scope.querySeries(series.study, series.study.series[0].offset);
                    });
                }
              }
            });
        }
    };
    $scope.rejectInstance = function(instance) {
        if($scope.trashaktive){
            $http.get(instanceURL(instance.attrs) + '/reject/' + $scope.rjcode.codeValue + "^"+ $scope.rjcode.codingSchemeDesignator).then(function (res) {
                // $scope.queryStudies($scope.studies[0].offset);
                $scope.queryStudies($scope.patients[0].offset);
            });
        }else{
            var html = $compile('<select id="reject" ng-model="reject" name="reject" class="col-md-9"><option ng-repeat="rjn in rjnotes" title="{{rjn.codeMeaning}}" value="{{rjn.codeValue}}^{{rjn.codingSchemeDesignator}}">{{rjn.label}}</option></select>')($scope);
            vex.dialog.open({
              message: 'Select rejected type',
              input: html,
              buttons: [
                $.extend({}, vex.dialog.buttons.YES, {
                  text: 'Reject'
                }), $.extend({}, vex.dialog.buttons.NO, {
                  text: 'Cancel'
                })
              ],
              callback: function(data) {
                if (data === false) {
                  return console.log('Cancelled');
                }else{
                    $http.get(instanceURL(instance.attrs) + '/reject/' + $scope.reject).then(function (res) {
                        $scope.queryInstances(instance.series, instance.series.instances[0].offset);
                    });
                }
              }
            });
        }
    };
    $scope.rejectedBeforeOpen = function(){
        cfpLoadingBar.start();
        $scope.rejectedBefore.opened = true;
        var watchPicker = setInterval(function(){ 
            if(angular.element(".uib-datepicker-popup .uib-close").length > 0){
                clearInterval(watchPicker);
                cfpLoadingBar.complete();
            }
        }, 10);
    }
    $scope.deleteRejectedInstances = function() {
        var html = $compile(
            '<div class="form-group">'+
                '<label>Delete instances with rejected type</label>'+
                '<select id="reject" ng-model="reject" name="reject" class="form-control">'+
                    '<option ng-repeat="rjn in rjnotes" title="{{rjn.codeMeaning}}" value="{{rjn.codeValue}}^{{rjn.codingSchemeDesignator}}">{{rjn.label}}</option>'+
                '</select>'+
            '</div>'+
            '<div class="form-group">'+
                '<label>Maximum reject date of instances to delete</label>'+
                '<input ng-model="rejectedBefore.date" autocomplete="off" class="form-control" ng-click="rejectedBeforeOpen()" placeholder="Delete all instances before this date" is-open="rejectedBefore.opened" id="rejectedBefore" title="Delete all instances before this date" type="text" uib-datepicker-popup="{{format2}}" close-text="Close"/>'+
            '</div>'+
            '<div class="checkbox">'+
                '<label>'+
                    '<input type="checkbox" name="keepRejectionNote" ng-model="keepRejectionNote" />'+
                    'if checked, keep rejection note instances - only delete rejected instances'+
                '</label>'+
            '</div>')($scope);
        vex.dialog.open({
          message: 'Delete instances that are in trash',
          input: html,
          className:"vex-theme-os deleterejectedinstances",
          buttons: [
            $.extend({}, vex.dialog.buttons.YES, {
              text: 'Delete all',
              className: "btn-danger btn"
            }), $.extend({}, vex.dialog.buttons.NO, {
              text: 'Cancel'
            })
          ],
          callback: function(data) {
            cfpLoadingBar.start();
            if (data === false) {
              cfpLoadingBar.complete();
              return console.log('Cancelled');
            }else{
                $http.delete('../reject/' + $scope.reject,{params: StudiesService.getParams($scope)}).then(function (res) {
                    cfpLoadingBar.complete();
                });
            }
          }
        });
    };
    $scope.downloadURL = function (inst, transferSyntax) {
        var exQueryParams = { contentType: 'application/dicom' };
        if (transferSyntax)
            exQueryParams.transferSyntax = transferSyntax;
        return wadoURL(inst.wadoQueryParams, exQueryParams);
    };
    $scope.viewInstance = function (inst) {
        $window.open(renderURL(inst));
    };
    $scope.studyRowspan = function(study) {
        var span = study.showAttributes ? 2 : 1;
        return study.series
            ? study.series.reduce(
                function(sum, series) {
                    return sum + $scope.seriesRowspan(series);
                },
                span+1)
            : span;
    };
    $scope.seriesRowspan = function(series) {
        var span = series.showAttributes ? 2 : 1;
        return series.instances
            ? series.instances.reduce(
                function (sum, instance) {
                    return sum + $scope.instanceRowspan(instance);
                },
                span + 1)
            : span;
    };
    $scope.instanceRowspan = function(instance) {
        return instance.showAttributes ? 2 : 1;
    };
    function rsURL() {
        return "../aets/" + $scope.aet + "/rs";
    }
    function studyURL(attrs) {
        return rsURL() + "/studies/" + attrs['0020000D'].Value[0];
    }
    function seriesURL(attrs) {
        return studyURL(attrs) + "/series/" + attrs['0020000E'].Value[0];
    }
    function instanceURL(attrs) {
        return seriesURL(attrs) + "/instances/" + attrs['00080018'].Value[0];
    }
    function createPatientFilterParams() {
        return {
            PatientName: $scope.filter.PatientName,
            PatientID: $scope.filter.PatientID,
            IssuerOfPatientID: $scope.filter.IssuerOfPatientID,
            fuzzymatching: $scope.filter.fuzzymatching,
            orderby: $scope.filter.orderby !== "-PatientName" ? "PatientName" :  $scope.filter.orderby
        };
    }
    function createStudyFilterParams() {
        var filter = angular.extend({}, $scope.filter);
        appendFilter(filter, "StudyDate", $scope.studyDate, /-/g);
        appendFilter(filter, "ScheduledProcedureStepSequence.ScheduledProcedureStepStartDate", $scope["ScheduledProcedureStepSequence.ScheduledProcedureStepStartDate"], /-/g);
        appendFilter(filter, "StudyTime", $scope.studyTime, /:/g);
        appendFilter(filter, "ScheduledProcedureStepSequence.ScheduledProcedureStepStartTime", $scope["ScheduledProcedureStepSequence.ScheduledProcedureStepStartTime"], /-/g);
        // appendFilterMWL(filter, "ScheduledProcedureStepSequence", $scope.ScheduledProcedureStepSequence, /:/g);
        return filter;
    }
    function appendFilter(filter, key, range, regex) {
        var value = range.from.replace(regex, '');
        if (range.to !== range.from)
            value += '-' + range.to.replace(regex, '');
        if (value.length)
            filter[key] = value;
    }
    // function appendFilterMWL(filter, key, range, regex) {
    //     console.log("range",range);
    //     var value = range["ScheduledProcedureStepSequence.ScheduledProcedureStepStartDate"].replace(regex, '');
    //     // console.log("range.ScheduledProcedureStepEndDate",range.ScheduledProcedureStepEndDate);
    //     // console.log("range.ScheduledProcedureStepStartDate",range.ScheduledProcedureStepStartDate);
    //     if (range["ScheduledProcedureStepSequence.ScheduledProcedureStepStartDate"] !== range["ScheduledProcedureStepSequence.ScheduledProcedureStepStartDate"])
    //         value += '-' + range["ScheduledProcedureStepSequence.ScheduledProcedureStepStartDate"].replace(regex, '');
    //     if (value.length)
    //         filter[key] = value;
    // }
    function createQueryParams(offset, limit, filter) {
        var params = {
            includefield: 'all',
            offset: offset,
            limit: limit
        };
        angular.forEach(filter, function(value, key) {
            if (value)
                params[key] = value;
        }, params);
        return params;
    }
    function renderURL(inst) {
        if (inst.video)
            return wadoURL(inst.wadoQueryParams, { contentType: 'video/mpeg' });
        if (inst.numberOfFrames)
            return wadoURL(inst.wadoQueryParams, { contentType: 'image/jpeg', frameNumber: inst.view });
        if (inst.gspsQueryParams.length)
            return wadoURL(inst.gspsQueryParams[inst.view - 1]);
        return wadoURL(inst.wadoQueryParams);
    }
    function wadoURL() {
        var i, url = "../aets/" + $scope.aet + "/wado?requestType=WADO";
        for (i = 0; i < arguments.length; i++) {
            angular.forEach(arguments[i], function(value, key) {
                url += '&' + key + '=' + value;
            });
        };
        return url;
    }
    function extractAttrs(attrs, tags, extracted) {
        angular.forEach(attrs, function (value, tag) {
            if (binarySearch(tags, parseInt(tag, 16)) >= 0) {
                extracted[tag] = value;
            }
        });
    }
    function binarySearch(ar, el) {
        var m = 0;
        var n = ar.length - 1;
        while (m <= n) {
            var k = (n + m) >> 1;
            var cmp = el - ar[k];
            if (cmp > 0) {
                m = k + 1;
            } else if(cmp < 0) {
                n = k - 1;
            } else {
                return k;
            }
        }
        return -m - 1;
    }
    function createGSPSQueryParams(attrs) {
        var sopClass = valueOf(attrs['00080016']),
            refSeries = valuesOf(attrs['00081115']),
            queryParams = [];
        if (sopClass === '1.2.840.10008.5.1.4.1.1.11.1' && refSeries) {
            refSeries.forEach(function(seriesRef) {
                valuesOf(seriesRef['00081140']).forEach(function(objRef) {
                    queryParams.push({
                        studyUID: attrs['0020000D'].Value[0],
                        seriesUID: seriesRef['0020000E'].Value[0],
                        objectUID: objRef['00081155'].Value[0],
                        contentType: 'image/jpeg',
                        frameNumber: valueOf(objRef['00081160']) || 1,
                        presentationSeriesUID: attrs['0020000E'].Value[0],
                        presentationUID: attrs['00080018'].Value[0]
                    })
                })
            })
        }
        return queryParams;
    }
    function isVideo(attrs) {
        var sopClass = valueOf(attrs['00080016']);
        return [
            '1.2.840.10008.5.1.4.1.1.77.1.1.1',
            '1.2.840.10008.5.1.4.1.1.77.1.2.1',
            '1.2.840.10008.5.1.4.1.1.77.1.4.1']
            .indexOf(sopClass) != -1 ? 1 : 0;
    }
    function valuesOf(attr) {
        return attr && attr.Value;
    }
    function valueOf(attr) {
        return attr && attr.Value && attr.Value[0];
    }
    function createArray(n) {
        var a = [];
        for (var i = 1; i <= n; i++)
            a.push(i);
        return a;
    }
    function initAETs(retries) {
        $http.get("../aets").then(
            function (res) {
                $scope.aes = res.data;
                $scope.aet = res.data[0].title;
                $scope.aetmodel = res.data[0];
            },
            function (res) {
                if (retries)
                    initAETs(retries-1);
            });
    }
    function initAttributeFilter(entity, retries) {
        $http.get("../attribute-filter/" + entity).then(
            function (res) {
                $scope.attributeFilters[entity] = res.data;
            },
            function (res) {
                if (retries)
                    initAttributeFilter(entity, retries-1);
            });
    }
    function initExporters(retries) {
        $http.get("../export").then(
            function (res) {
                $scope.exporters = res.data;
                if(res.data && res.data[0] && res.data[0].id){
                    $scope.exporterID = res.data[0].id;
                }
            },
            function (res) {
                if (retries)
                    initExporters(retries-1);
            });
    }
    function initRjNotes(retries) {
        $http.get("../reject").then(
            function (res) {
                var rjnotes = res.data;
                rjnotes.sort(function (a, b) {
                    if (a.codeValue === "113039" && a.codingSchemeDesignator === "DCM")
                        return -1;
                    if (b.codeValue === "113039" && b.codingSchemeDesignator === "DCM")
                        return 1;
                    return 0;
                });
                $scope.rjnotes = rjnotes;
                $scope.reject = rjnotes[0].codeValue + "^" + rjnotes[0].codingSchemeDesignator;
            },
            function (res) {
                if (retries)
                    initRjNotes(retries-1);
            });
    }
    // $(".div-table > .repeat0 > .thead .tr_row").bind("click",".div-table",function(){
    //     console.log("in hover", $(".div-table > .header1 > .tr_row"));
    //     $(".div-table > .header1 > .tr_row").css({
    //         background:"blue"
    //     });
    // });
    $scope.queryMWL = function(offset){
        if (offset < 0 || offset === undefined) offset = 0;
        cfpLoadingBar.start();
        QidoService.queryMwl(
            rsURL(),
            createQueryParams(offset, $scope.limit+1, createStudyFilterParams())
        ).then(function successCallback(res) {
                $scope.patients = [];
     //           $scope.studies = [];
                $scope.morePatients = undefined;
                $scope.moreMWL = undefined;
                if(res.data != ""){
                    var pat, mwl, patAttrs, tags = $scope.attributeFilters.Patient.dcmTag;
                    res.data.forEach(function (studyAttrs, index) {
                        patAttrs = {};
                        extractAttrs(studyAttrs, tags, patAttrs);
                        if (!(pat && angular.equals(pat.attrs, patAttrs))) {
                            pat = {
                                attrs: patAttrs,
                                mwls: [],
                                showAttributes: false
                            };
                            // $scope.$apply(function () {
                                $scope.patients.push(pat);
                                // $scope.mwl.push(pat);
                            // });
                        }
                        mwl = {
                            patient: pat,
                            offset: offset + index,
                            moreSeries: false,
                            attrs: studyAttrs,
                            series: null,
                            showAttributes: false,
                            fromAllStudies:false
                        };
                        pat.mwls.push(mwl);
                    });
                    if ($scope.moreMWL = (res.data.length > $scope.limit)) {
                        pat.mwls.pop();
                        if (pat.mwls.length === 0)
                            $scope.patients.pop();
                        // $scope.studies.pop();
                    }
                } else {
                    DeviceService.msg($scope, {
                        "title": "Info",
                        "text": "No matching Studies found!",
                        "status": "info"
                    });
                }
                // console.log("$scope.patients",$scope.patients);
                cfpLoadingBar.complete();
            },
            function errorCallback(response) {
                // DeviceService.msg($scope, {
                //     "title": "Error",
                //     "text": "Error saving study!",
                //     "status": "error"
                // });
            }
        );
    };

    $scope.conditionWarning = function($event, condition, msg){
        if(condition){
            $scope.disabled[$event.currentTarget.id] = true;
            DeviceService.msg($scope, {
                "title": "Warning",
                "text": msg,
                "status": "warning"
            });
            setTimeout(function() {
                $scope.disabled[$event.currentTarget.id] = false;
            }, 100);
        }
    };
    initAETs(1);
    initAttributeFilter("Patient", 1);
    initExporters(1);
    initRjNotes(1);
});
