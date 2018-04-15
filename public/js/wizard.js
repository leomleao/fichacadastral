//== Class definition
var WizardDemo = function () {

    Dropzone.autoDiscover = false;

    //== Base elements
    var wizardEl = $('#m_wizard');
    var formEl = $('#m_form');
    var validator;
    var wizard;
    var form;
    var formData = {};
    var uuid = $("#uuid").val(); //value of uuid sent to form from backend
    
    //== Private functions
    var initWizard = function () {
        //== Initialize form wizard
        wizard = wizardEl.mWizard({
            startStep: 1
        });


        // this toggle the button to either add or not additional information of tributes
        $( "#regime-especial" ).click(function() {
            if($( "#status").text() == "SIM!"){
                $( "#status").text("NAO!");
            } else {
                $( "#status").text("SIM!");                
            }

            // slider of the addtional data, with the dropzone field
            $( ".regime-especial" ).slideToggle( "slow", function() {                
            });
        });


        // field to upload files
        var dropZone = new Dropzone(".dropzone", {
            url: "/uploadFile/" + uuid,
            addRemoveLinks: true,
            maxFiles: 10,
            maxFilesize: 3, // MB
            dictCancelUpload: "Cancelar",
            autoProcessQueue: false, //auto upload on file drop
            parallelUploads: 2,
            ignoreHiddenFiles: true,
            acceptedFiles: "image/*,.pdf,.doc,.docx",
            renameFilename: function (filename) {
                return uuid + '_#_' + filename;
            },
            init: function () {
                //upload are not grouped, this call happens with each file
                this.on("success", function(file) {
                   dropZone.options.autoProcessQueue = true; //afer button upload has been pressed start to automatically upload next files
                   addNodeUploadedFile(file.name); // add a field in the rev form with the file, this only happens on success uploads
                });
            }
                
        });

        //button to uplaod files
        $('#upload').click(function(){           
            dropZone.processQueue();
        });

        
        // cnpj mask
        $("#cnpj").inputmask("mask", {
            "mask": "99.999.999/9999-99"
        });

        //postal-code mask
        $("#cep").inputmask("mask", {
            "mask": "99.999-999"
        });

        //phone mask
        $("#telFinanceiro").inputmask("mask", {
            mask: ["(99) 9999-9999", "(99) 99999-9999", ], //use either one
            keepStatic: true
        });

        // == Validation before going to next page
        wizard.on('beforeNext', function(wizard) {
            if (validator.form() !== true) {
                return false;  // don't go to the next step
            }

            var im          = formEl.find('#im');
            var complemento = formEl.find('#complemento');
            var bairro      = formEl.find('#bairro');
            var ie          = formEl.find('#ie');
            var suframa     = formEl.find('#suframa');

            if (ie.val() == '') {
                toggleRevField('ie', 'hide');
            } else {
                toggleRevField('ie', 'show');
            }

            if (im.val() == '') {
                toggleRevField('im', 'hide');
            } else {
                toggleRevField('im', 'show');
            } 

            if (suframa.val() == '') {
                toggleRevField('suframa', 'hide');
            } else {
                toggleRevField('suframa', 'show');
            }            


            if (complemento.val() == '') {
                toggleRevField('complemento', 'hide');
            } else {
                toggleRevField('complemento', 'show');
            }   

            if (bairro.val() == '') {
                toggleRevField('bairro', 'hide');
            } else {
                toggleRevField('bairro', 'show');
            }
            
            form = formEl.serializeArray(); //get actual typed data
            populateDataObj(form, populateRevForm); //populate the object which is being sent to the backend and soon after the revision form
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
                    cnpj: true //custom created cnpj rule, check js folder
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

                bairro: {
                    required: false
                },

                complemento: {
                    required: false
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
                    required: "Por favor, confirme os dados antes de enviar."
                } 
            },
      
            
            //== Display error  
            invalidHandler: function(event, validator) {
                var errors = validator.numberOfInvalids();
                var element = validator.errorList[0].element;
                    if (errors) {   

                        $('html, body').animate({ scrollTop: $('input[name="' + element.name + '"]').offset().top - (screen.height / 2) }, 500);                
                        element.focus();
                    }
                
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
                console.info(formData);
                console.info("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA");
                console.info(JSON.stringify(formData));

                $.ajax({
                    url: 'form',
                    type: "POST",
                    data: JSON.stringify(formData),
                    dataType: "JSON",            
                    contentType: "application/json",        
                    success: function(response){
                        console.info(response);
                        mApp.unprogress(btn);
                        //mApp.unblock(formEl);
                        swal({
                            html: response.message, 
                            type: 'success',
                            confirmButtonClass: 'btn btn-secondary m-btn m-btn--wide'
                        });
                    }, error: function(response){
                        console.info(response);
                        mApp.unprogress(btn);

                        var options = {
                            title: "", 
                            html: response.message, 
                            type: "error",
                            confirmButtonClass: "btn btn-secondary m-btn m-btn--wide"
                        }
                     //mApp.unblock(formEl);

                        swal(options);
                    },

                });
            }
        });
    }

    function populateForm (data, callback) {

        // ##TODO can be reworked to check with backend too, and add all received fields
       $("#nome").val(data.nome);
       $("#fantasia").val(data.fantasia);
       $("#logradouro").val(data.logradouro);
       $("#numero").val(data.numero);
       $("#municipio").val(data.municipio);
       $("#uf").val(data.uf);
       $("#cep").val(data.cep);
       $("#bairro").val(data.bairro);
       $("#complemento").val(data.complemento);

       if (typeof callback === 'function'){
            callback(data);
        }
    }

    function addNodeUploadedFile (filename) {
        var newLine = $('#regime-especial-file').clone();
        newLine.removeAttr( "id" ); //next clones won't be duplicated.

        newLine.children().text(filename);
        newLine.show().appendTo($('#regime-especial-file').parent());
    }

    //function to hide the rev field.
    function toggleRevField(key, option) {
        var label   = $( "#rev-" + key ).parent().prev();
        var divSpan = $( "#rev-" + key ).parent();

        if (option == "hide"){
            label.hide();
            divSpan.hide();
        } else {
            label.show();
            divSpan.show();
        }
    }

    function populateRevForm(data) {
            if (formEl.find('input[type=radio][name=icms]').attr('disabled') == 'disabled') {
                $( "#rev-icms").text("Não contribuinte.");
            }
        Object.keys(data).forEach(function(key) {
       
            if( key == "icms" && data[key] == 0 ){
                $( "#rev-" + key ).text("Não contribuinte.");

            } else if ( key == "icms" && data[key] == 1 ){
                $( "#rev-" + key ).text("Contribuinte de ICMS.");

            } else if ( key == "aplicacao" && data[key] == 'consumo' ){
                $( "#rev-" + key ).text("Consumo");

            } else if ( key == "aplicacao" && data[key] == 'revenda' ){
                $( "#rev-" + key ).text("Revenda");

            } else if ( key == "aplicacao" && data[key] == 'industrializacao' ){
                $( "#rev-" + key ).text("Industrialização.");

            } else if( key == "atividade_principal"){
                console.info(data[key][0]);
                $( "#rev-" + key ).text(data[key][0]['code'] + " - " + data[key][0]['text']);

            } else if ( $( "#rev-" + key ).length ) { 
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
                toggleRevField('ie', 'hide');


            } else {
                fieldICMS.attr('disabled', false);                                      
                helper.text("");
                yesICMSField.next().removeClass('without-after-element');
                toggleRevField('ie', 'show');


                
            }
            
        });






        var uf           = formEl.find('#uf');
        var fieldSUFRAMA = formEl.find('#fieldSUFRAMA');

            uf.on('change', function(e) {
                if (uf.val() == 'AM' || uf.val() == 'RR' || uf.val() == 'AP' || uf.val() == 'AC' || uf.val() == 'RO') {
                    // fieldSUFRAMA.removeAttr('hidden');
                    fieldSUFRAMA.fadeIn( "slow", function() {
                    // Animation complete.
                    });
                } else {
                    fieldSUFRAMA.fadeOut( "slow", function() {
                    // Animation complete.
                    });
                }
                
            });
                
    }

    return {
        // public functions
        init: function() {
            wizardEl = $('#m_wizard');
            formEl = $('#m_form');

            initWizard(); 
            initValidation();
            initSubmit();
            initWatch();
        }
    };
}();

jQuery(document).ready(function() {    
    WizardDemo.init();
});