/*
 Mobile App Form Validations and Submit Handlers!
 */
/*Insert amphiro b1 pairing code - rulea are for the first input 4 characters and for the second input a number range from 1 to 4*/
$('#pairForm').validate(
                        {
                            rules: {
                                    fourChars: {
                                                required: true,
                                                minlength: 4,
                                                maxlength:4
                                    },
                                    fourNums: {
                                                required: true,
                                                minlength: 1,
                                                maxlength:4,
                                                number:true
                                    }
                            },
                            errorElement: "p",
                            errorPlacement: function (error, element) {
                                error.addClass('error_forms_text').insertBefore(element);
                            },
                            success: function(label) {
                                var elm = $('input[name="'+ label.attr("for")+'"]');
                                elm.css({'border-color':'#2D3580','border-width':'1px'});
                            },
                            submitHandler: function (form) {
                        
                                app.showLoadingSpinner($('#startPairing'));
                        
                                var data = app.serializeFormJSON($(form)),
                                    key = data.fourChars + data.fourNums ;
                        
                                app.checkCode(key);
                        
                                return false;
                            }
                        
                        }
                        );

/*Household members form validation*/
 $('#memberForm').validate(
                           {
                           rules: {
                                    member_name:{
                                                required: true
                                    },
                                    member_age:{
                                                number: true,
                                                required: true,
                                                maxlength: 2,
                                    }
                           },
                           errorElement: 'p',
                           errorPlacement: function (error, element) {
                                error.addClass('error_forms_text').insertBefore(element);
                           },
                           success: function(label) {
                                var elm = $('input[name="'+ label.attr("for")+'"]');
                                elm.css({'border-color':'#2D3580','border-width':'1px'});
                           },
                           submitHandler: function (form) {
                            var data = app.serializeFormJSON($(form)),
                                photo_uri = app.getPhotoUrl( $('#memberPhoto').attr('src') ),
                                gender = $('input[name="member_gender"]:checked').val();
                           
                            var mb = new profileManager({
                                                        "name" : data.member_name,
                                                        "gender" : gender,
                                                        "age" : data.member_age,
                                                        "photo" : photo_uri,
                                                        "active":1
                                                        });
                            mb.new_member();
                           
                            return false;
                            }
                           
                           }
                           );

/*login form  validation - rules are email and password*/
$('#loginForm').validate(
                         {
                            rules: {
                                    username: {
                                                required: true,
                                                minlength: 6
                                    },
                                    pass_word: {
                                                required: true,
                                                minlength: 8
                                    }
                            },
                            errorElement: "p",
                            errorPlacement: function (error, element) {
                                error.addClass('error_forms_text').insertBefore( element );
                            },
                            success: function(label) {
                                $('input[id="'+ label.attr("for")+'"]').css({'border-color':'#2D3580','border-width':'1px'});
                            },
                            submitHandler: function (form) {
                         
                                app.showLoadingSpinner($('#submitlog1'));
                         
                                app.login(
                                          app.serializeFormJSON($(form))
                                          );
                                return false;
                            }
                         }
                         );

/*Reset password form - inputs : password , repassword*/
$('#form_reset_pin').validate(
                              {
                                rules: {
                                        pin_reset :{
                                                    required: true
                                        },
                                        pass_reset:{
                                                    required: true,
                                                    minlength: 8
                                        },
                                        repass_reset:{
                                                        equalTo: "#pass_reset"
                                        }
                                },
                                errorElement: "p",
                                errorPlacement: function (error, element) {
                                    error.addClass('error_forms_text').insertBefore(element);
                                },
                                success: function(label) {
                                    $('input[id="'+ label.attr("for")+'"]').css({'border-color':'#2D3580','border-width':'1px'});
                                },
                                submitHandler: function (form) {
                              
                                    app.showLoadingSpinner($('#reset_pin_Pass'));
                              
                                    app.redeempass(
                                               app.serializeFormJSON($(form))
                                               );
                              
                                    return false;
                                }
                              
                              }
                              );

/*Reset password providing email address*/
$('#form_reset').validate(
                          {
                            rules: {
                                    email_reset: {
                                                    required: true
                                    }
                            },
                            errorElement: "p",
                            errorPlacement: function (error, element) {
                                error.addClass('error_forms_text').insertBefore(element);
                            },
                            success: function(label) {
                                $('input[id="'+ label.attr("for")+'"]').css({'border-color':'#2D3580','border-width':'1px'});
                            },
                            submitHandler: function (form) {
                          
                                app.showLoadingSpinner($('#resetPwd')); 
                          
                                var data = app.serializeFormJSON($(form));
                          
                                app.resetpass(data.email_reset);
                          
                                return false;
                            }
                          });

/*Change password form validation*/
$('#form_change_pass').validate(
                                {
                                rules: {
                                        pass_change: {
                                                        required: true,
                                                        minlength: 8
                                        },
                                        repass_change: {
                                                        equalTo: "#pass_change"
                                        }
                                },
                                errorElement: "p",
                                errorPlacement: function (error, element) {
                                    error.addClass('error_forms_text').insertBefore(element);
                                },
                                success: function(label) {
                                    var elm = $('input[id="'+ label.attr("for")+'"]');
                                    elm.css({'border-color':'#2D3580','border-width':'1px'});
                                },
                                submitHandler: function (form) {
                                
                                    app.showLoadingSpinner($('#changePass_button'));
                                
                                    app.changepass(
                                                    app.serializeFormJSON($(form))
                                                   );
                                
                                    return false;
                                
                                }
                                
                                }
                                );

/*User registration - Whitelist*/
$('#form1').validate(
                     {
                        rules: {
                                email: {
                                        required: true,
                                        minlength: 6
                                },
                                password: {
                                            required: true,
                                            minlength: 8
                                },
                                repassword:{
                                            equalTo: "#password"
                                }
                     },
                     errorElement: "p",
                     errorPlacement: function (error, element) {
                        error.addClass('error_forms_text').insertBefore(element);
                     },
                     success: function(label) {
                        $('input[id="'+ label.attr("for")+'"]').css({'border-color':'#2D3580','border-width':'1px'});
                     },
                     submitHandler: function (form) {
                     
                        app.getLocale();
                     
                        var data = app.serializeFormJSON($(form)),
                            locale;
                     
                        if(AppModel.user.locale) {
                            locale = (AppModel.user.locale).split('-')[0];
                        } else {
                            locale = 'en';
                        }
                     
                        app.showLoadingSpinner($('#submitregister'));
                     
                        app.registeruser(
                                     {
                                     "username":data.email,
                                     "password":data.password,
                                     "firstname":"User",
                                     "lastname":"User",
                                     "gender":"MALE",
                                     "birthdate":"1905-12-31",
                                     "country":"Greece",
                                     "zip":"10672",
                                     "timezone":"Europe/Greece",
                                     "locale" : locale
                                     }
                                     );
                     
                        return false;
                     
                     }
                     
                     }
                     );


/*User registration - Whitelist*/
/*
$('#device_form').validate(
                           {
                           rules: {
                                    "cost-water": {
                                                    required: true,
                                                    maxlength: 2,
                                                    number: true
                                    },
                                    "heating-efficiency": {
                                                    required: true,
                                                    maxlength: 8,
                                                    number: true,
                                                    digits: true
                                    },
                                    "cost-energy":{
                                                    required: true,
                                                    maxlength: 2,
                                                    number: true
                                    },
                                    "share-of-solar":{
                                                    required: true,
                                                    maxlength: 2,
                                                    number: true,
                                                    digits: true
                                    }
                           },
                           errorElement: "p",
                           errorPlacement: function (error, element) {
                            error.addClass('error_forms_text').insertBefore(element);
                           },
                           success: function(label) {
                            $('input[id="'+ label.attr("for")+'"]').css({'border-color':'#2D3580','border-width':'1px'});
                           },
                           submitHandler: function (form) {
                           var amphiro = getObjects(AppModel.user.profile.devices, 'deviceKey', AppModel.selectedDeviceWithID);
                           var data = app.serializeFormJSON($(form));
                       
                           alert(JSON.stringify(data));

                           $.each(data,function(key,value){
                                  alert(key);
                                  alert(value);
                                  properties = getObjects(amphiro[0].properties, 'key', key);
                                  //update new settings
                                  properties[0].value = value;
                                  
                                  });
                           
                           alert(JSON.stringify(amphiro[0]));
                           
                            $('.doneSettings').hide();
                            $('.undoSettings').hide();
                            $('.devSettings').show();
                           
                           
                           
                            var prop = new deviceProperty(amphiro[0]);
                            prop.settings();

                            //app.doneDeviceSettings(e);
                     
                           }
                     
                       
                           }
                     );
*/
