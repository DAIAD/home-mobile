$.extend( $.validator.messages, {
         required: "This field is required",
         password: "Password is required",
         fourChars :"First input is required",
         fourNums :"Second input is required",
         remote: "Por favor, rellena este campo.",
         email: "Please enter a valid email address",
         username: "Please enter a valid email address",
         pass_word : "Password is required",
         url: "Please enter a valid URL.",
         date: "Please enter a valid date.",
         dateISO: "Please enter a valid date (ISO).",
         number: "Please enter a valid number.",
         digits: "Please enter only digits",
         equalTo: "Please enter the same password",
         maxlength: $.validator.format( "Please enter no more than {0} characters." ),
         minlength: $.validator.format( "Please enter at least {0} characters." ),
         rangelength: jQuery.validator.format("Please enter a value between {0} and {1} characters long."),
         range: jQuery.validator.format("Please enter a value between {0} and {1}."),
         max: jQuery.validator.format("Please enter a value less than or equal to {0}."),
         min: jQuery.validator.format("Please enter a value greater than or equal to {0}.")

         } );
