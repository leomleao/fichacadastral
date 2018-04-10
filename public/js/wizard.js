//== Class definition
var WizardDemo = function () {
    //== Base elements
    var wizardEl = $('#m_wizard');
    var formEl = $('#m_form');
    var validator;
    var wizard;
    var form;
    var formData = {};
    
    //== Private functions
    var initWizard = function () {
        //== Initialize form wizard
        wizard = wizardEl.mWizard({
            startStep: 1
        });

         $('#regimeEspecial').repeater({            
            initEmpty: true,
           
            defaultValues: {
                'text-input': 'foo'
            },
             
            show: function () {
                $(this).slideDown();
            },

            hide: function (deleteElement) {                
                $(this).slideUp(deleteElement);                 
            }   
        });

                // phone number format
        $("#cnpj").inputmask("mask", {
            "mask": "99.999.999/9999-99"
        });

        $("#cep").inputmask("mask", {
            "mask": "99.999-999"
        });

        // == Validation before going to next page
        wizard.on('beforeNext', function(wizard) {
            // if (validator.form() !== true) {
            //     return false;  // don't go to the next step
            // }
            form = formEl.serializeArray();
            populateDataObj(form, populateRevForm);
        })

        //== Change event
        wizard.on('change', function(wizard) {
            mApp.scrollTop();
        });
    }

    var initValidation = function() {
        validator = formEl.validate({
            //== Validate only visible fields
            ignore: ":hidden",

            //== Validation rules
            rules: {
                //=== Identificacao               
                cnpj: {
                    required: true,
                    cnpj: true
                },

                ie: {
                    required: ""                    
                },

                nome: {
                    required: true 
                },

                fantasia: {
                    required: false
                },

                //=== Endereco         

                cep: {
                    required: true
                },

                municipio: {
                    required: true
                },

                uf: {
                    required: true
                },

                logradouro: {
                    required: true
                },

                numero: {
                    required: true
                },

                //=== Informacoes fiscais         

                aplicacao: {
                    required: true
                },

                icms: {
                    required: true
                },

                emailXML: {
                    required: true
                },

                im: {
                    required: false                    
                },

                suframa: {
                    required: false                    
                },


                //=== Contato Financeiro

                nomeFinanceiro : {
                    required: true
                },
                telFinanceiro : {
                    required: true
                },
                emailFinanceiro : {
                    required: true
                },

               
                //=== Revisao
                accept: {
                    required: true
                }
            },

            //== Validation messages
            messages: {
                accept: {
                    required: "Você deve concordar com nossos termos e condições!"
                } 
            },
            
            //== Display error  
            invalidHandler: function(event, validator) {     
                mApp.scrollTop();

                swal({
                    "title": "", 
                    "text": "Formulário não completo. Por favor, preencha todos os campos obrigatórios.", 
                    "type": "error",
                    "confirmButtonClass": "btn btn-secondary m-btn m-btn--wide"
                });
            },

            //== Submit valid form
            submitHandler: function (form) {
                
            }
        });   
    }

    var initSubmit = function() {
        var btn = formEl.find('[data-wizard-action="submit"]');

        btn.on('click', function(e) {
            e.preventDefault();

            if (validator.form()) {
                //== See: src\js\framework\base\app.js
                mApp.progress(btn);
                //mApp.block(formEl); 

                //== See: http://malsup.com/jquery/form/#ajaxSubmit
                formEl.ajaxSubmit({
                    success: function() {
                        mApp.unprogress(btn);
                        //mApp.unblock(formEl);

                        swal({
                            "title": "", 
                            "text": "Sua ficha cadastral foi enviada com sucesso!", 
                            "type": "success",
                            "confirmButtonClass": "btn btn-secondary m-btn m-btn--wide"
                        });
                    }
                });
            }
        });
    }

    function populateForm (data, callback) {
       $("#nome").val(data.nome);
       $("#fantasia").val(data.fantasia);
       $("#logradouro").val(data.logradouro);
       $("#numero").val(data.numero);
       $("#municipio").val(data.municipio);
       $("#uf").val(data.uf);
       $("#cep").val(data.cep);

       if (typeof callback === 'function'){
            callback(data);
        }
    }

    function populateRevForm(data) {
        Object.keys(data).forEach(function(key) {
            if( key == "icms" && data[key] == 0 ){
                $( "#rev-" + key ).text("Não contribuinte.");
            } else if ( key == "icms" && data[key] == 1 ){
                $( "#rev-" + key ).text("Contribuinte de ICMS.");

            }else if ( $( "#rev-" + key ).length ) { 
                $( "#rev-" + key ).text(data[key]);             
            }
        });
    }

    function populateDataObj(data, callback = false) {  

        if(isArray(data)){
            for (var i = form.length - 1; i >= 0; i--) {
                formData[form[i].name] = form[i].value;
            }            
        } else if (typeof data === "object"){
            Object.keys(data).forEach(function(key) {
                formData[key] = data[key];
            });
        }    

        console.info(typeof callback);

        if (typeof callback === 'function'){
            callback(formData);
        }

        
    }

    function isArray(obj) {
        return Array.isArray(obj);
    }

    var initWatch = function() {

        var cnpjField = formEl.find('#cnpj');

            cnpjField.on('change', function(e) {
                var url = 'http://www.receitaws.com.br/v1/cnpj/' ;
                console.info(cnpjField.inputmask('unmaskedvalue'));

                $.ajax({
                    url: 'check/' + cnpjField.inputmask('unmaskedvalue'),
                    success: function(result){
                      populateForm(result, populateDataObj); 
                      console.info(result);
                    }
                });
            });

        var ie           = formEl.find('#ie');
        var fieldICMS    = formEl.find('input[type=radio][name=icms]');
        var noICMSField  = formEl.find('input[type=radio][name=icms][value=0]');
        var yesICMSField = formEl.find('input[type=radio][name=icms][value=1]');
        var helper       = formEl.find('#helper-icms');

            ie.on('change', function(e) {                
                if (ie.val() == '') {

                    yesICMSField.prop('checked', false);
                    noICMSField.prop('checked', true);
                    fieldICMS.attr('disabled', 'true');
                    helper.text("Caso seja contribuinte, preencha o campo IE.");
                    yesICMSField.next().addClass('without-after-element');


                } else {
                    fieldICMS.attr('disabled', false);                                      
                    helper.text("");
                    yesICMSField.next().removeClass('without-after-element');
                    
                }
                
            });



        var uf           = formEl.find('#uf');
        var fieldSUFRAMA = formEl.find('#fieldSUFRAMA');

            uf.on('change', function(e) {
                if (uf.val() == 'AM' || uf.val() == 'RR' || uf.val() == 'AP' || uf.val() == 'AC' || uf.val() == 'RO') {
                    fieldSUFRAMA.removeAttr('hidden');
                } else {
                    fieldSUFRAMA.attr('hidden', 'true');
                }
                
            });
                
    }

    return {
        // public functions
        init: function() {
            wizardEl = $('#m_wizard');
            formEl = $('#m_form');

            initWizard(); 
            // initValidation();
            initSubmit();
            initWatch();
        }
    };
}();

jQuery(document).ready(function() {    
    WizardDemo.init();
});