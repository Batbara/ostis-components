/* --- src/bookSearch-common.js --- */
var BookSearch = {};

function extend(child, parent) {
    var F = function () {
    };
    F.prototype = parent.prototype;
    child.prototype = new F();
    child.prototype.constructor = child;
    child.superclass = parent.prototype;
}


/* --- src/bookSearch-paintPanel.js --- */
/**
 * Paint panel.
 */

BookSearch.PaintPanel = function (containerId) {
    this.containerId = containerId;
};

BookSearch.PaintPanel.prototype = {

    init: function () {
        this._initMarkup(this.containerId);
    },

    _initMarkup: function (containerId) {
        var container = $('#' + containerId);

        var charNumber = 1;

         var self = this;
        container.append('<div class="sc-no-default-cmd">Поиск книги</div>');
        container.append('<input type="button" value="Добавить поле" id="add-field-1">');
        container.append('<input type = "button" value= "Добавить информацию" id = "add-info-1"> ');
        container.append('<input type = "button" value = " Сгенерировать шаблон" id= "create-pattern">');
        container.append('<br>');

        $('#newButton').click(function () {
            self._showMainMenuNode();
        });

        $('#add-field-1').click(function () {
            self._addNewParam(containerId, charNumber);
        });

        $('#add-info-1').click(function () {
            self._addNewInfo(containerId, charNumber);
        });

        $('#create-pattern').click(function () {
            self._createNewPattern(1);
        });

        $('#create-pattern').prop('disabled', true);

    },

    /* она работает!!!!*/
    _addNewParam: function(divId, numerOfFields){

        var container = $('#' + divId);
        var new_param_field_addr, name_addr, age_addr, gender_addr, type_addr, fem_addr, male_addr;
        SCWeb.core.Server.resolveScAddr(['nrel_character_gender', 'nrel_character_name', 'nrel_main_idtf', 'nrel_character_type', 'nrel_character_age', 'concept_female_char', 'concept_male_char', 'concept_person', 'concept_dog', 'concept_cat' ], function(keynodes){
            gender_addr = keynodes['nrel_character_gender'];
            name_addr = keynodes['nrel_main_idtf'];
            type_addr = keynodes['nrel_character_type'];
            age_addr = keynodes['nrel_character_age'];
            fem_addr = keynodes['concept_female_char'];
            male_addr = keynodes['concept_male_char'];  
            person_addr = keynodes['concept_person'];
            dog_addr = keynodes['concept_dog'];
            cat_addr = keynodes['concept_cat'];         

            
            var all_addr = [gender_addr, name_addr, type_addr, age_addr, fem_addr, male_addr];
            SCWeb.core.Server.resolveIdentifiers(all_addr, function(keynodes){
                var character_params = [gender_addr, name_addr, type_addr, age_addr];
                var character_params_name = [];
                var strProm = "";
                for (var i = 0; i <= character_params.length - 1; i++) {
                    character_params_name[i] = keynodes[character_params[i]];
                    strProm = strProm + ((i+1)+"."+" "+character_params_name[i]+"\n");
                }
                var param_to_create_addr;
                var attr = prompt(strProm);
                switch(attr){
                    case '1': param_to_create_addr = character_params[0];
                        container.append("<select id =\"gender_id\"><option value=\""+ male_addr+"\">Мужской</option><option value=\""+ fem_addr+"\">Женский</option></select>");
                        break;
                    case '2': param_to_create_addr = character_params[1];
                        var name_of_nrel = keynodes[param_to_create_addr];
                        container.append("<input type = \"text\" placeholder = \""+name_of_nrel+"\" id = \"name_id\">"); 
                        break;
                    case '3': param_to_create_addr = character_params[2];
                        container.append("<select placeholder = \"Выберите вид персонажа\" id = \"type_id\"><option value = \""+person_addr+"\">Человек</option><option value = \""+dog_addr+"\">Пес</option><option value=\""+cat_addr+"\">Кот</option></select>");
                        break;
                    case '4': param_to_create_addr = character_params[3];
                    var name_of_nrel = keynodes[param_to_create_addr];
                    container.append("<input type = \"text\" placeholder = \""+name_of_nrel+"\" id = \"age_id\">");
                        break;
                }
                 
            });     
        });
        if ($("#create-pattern").attr('disabled')) {
            $('#create-pattern').prop('disabled', false);
        } 
    },

    /*добавление нового персонажа*/
    _addNewInfo: function(containerId, charNumber){
        var container = $('#' + containerId);
        $("#name_id").remove();
        $("#gender_id").remove();
        $("#type_id").remove();
        charNumber++;
        console.log(charNumber);


    },
    /*формирование шаблона
    еще не доделано*/
    _createNewPattern: function(numerOfFields){
        // create node
        var concept_book_addr, fem_addr, male_addr, person_addr, dog_addr, cat_addr;
        SCWeb.core.Server.resolveScAddr(['concept_book','concept_female_char', 'concept_male_char', 'concept_person', 'concept_dog', 'concept_cat' ], function(keynodes){
            concept_book_addr = keynodes['concept_book'];
            fem_addr = keynodes['concept_female_char'];
            male_addr = keynodes['concept_male_char'];
            person_addr = keynodes['concept_person'];
            dog_addr = keynodes['concept_dog'];
            cat_addr = keynodes['concept_cat'];

            var temp_char = 'new_char_' + numerOfFields;
            new Promise (function(resolve){
            // create book node
                window.sctpClient.create_node(sc_type_node).done(function(generatedNode){
                // create link with system_idtf
                    window.sctpClient.create_link().done(function(generatedLink){
                    window.sctpClient.set_link_content(generatedLink, temp_char);
                    window.sctpClient.create_arc(sc_type_arc_common | sc_type_const, generatedNode, generatedLink).done(function(generatedCommonArc){
                        window.sctpClient.create_arc(sc_type_arc_pos_const_perm, scKeynodes.nrel_system_identifier, generatedCommonArc).done(function(){
                            console.log('generated ', generatedNode, temp_char);
                            resolve(generatedNode);
                        });
                    });
                });
            });
        }).then((response) => {
            if($("#name_id").val() != null){
                console.log($("#name_id").val());
                window.sctpClient.create_link().done(function(generatedTitleLink){
                    window.sctpClient.set_link_content(generatedTitleLink, $("#name_id").val());
                    window.sctpClient.create_arc(sc_type_arc_common | sc_type_const, response, generatedTitleLink).done(function(generatedCommonArc){
                         window.sctpClient.create_arc(sc_type_arc_pos_const_perm, scKeynodes.nrel_main_idtf, generatedCommonArc);
                    });
                    window.sctpClient.create_arc(sc_type_arc_pos_const_perm, scKeynodes.lang_ru, generatedTitleLink)
                });
            // -------------------------------------
            }
            if($( "#type_id option:selected" ).text() != null){
                console.log($( "#type_id option:selected" ).text());
                var charType = "";
                switch($( "#type_id option:selected" ).text()){
                    case 'Человек': charType = person_addr;
                        break;
                    case 'Пес': charType = dog_addr;
                        break;
                    case 'Кот' : charType = cat_addr;
                        break; 
                }
                window.sctpClient.create_arc(sc_type_arc_pos_const_perm, charType, response);
            }
            if($( "#gender_id option:selected" ).text() != null){
                console.log($( "#gender_id option:selected" ).text() != null);
                var charGender = "";
                switch($( "#type_id option:selected" ).text()){
                    case 'Мужской': charGender = male_addr;
                        break;
                    case 'Женский': charGender = fem_addr;
                        break;
                }
                window.sctpClient.create_arc(sc_type_arc_pos_const_perm, charGender, response);
            }
            // функция для возраста
            
        }/*подозреваю, что здесь отправка персонажа или агенту или поисковику*/);
        numerOfFields++;
        });
    }
};

/* --- src/bookSearch-component.js --- */
BookSearch.DrawComponent = {
    ext_lang: 'booksearch_view',
    formats: ['format_book_search'],
    struct_support: true,
    factory: function (sandbox) {
        return new BookSearch.DrawWindow(sandbox);
    }
};

BookSearch.DrawWindow = function (sandbox) {
    this.sandbox = sandbox;
    this.paintPanel = new BookSearch.PaintPanel(this.sandbox.container);
    this.paintPanel.init();
    this.recieveData = function (data) {
        console.log("in recieve data" + data);
    };

    var scElements = {};

    function drawAllElements() {
        var dfd = new jQuery.Deferred();
       // for (var addr in scElements) {
            jQuery.each(scElements, function(j, val){
                var obj = scElements[j];
                if (!obj || obj.translated) return;
// check if object is an arc
                if (obj.data.type & sc_type_arc_pos_const_perm) {
                    var begin = obj.data.begin;
                    var end = obj.data.end;
                    // logic for component update should go here
                }

        });
        SCWeb.ui.Locker.hide();
        dfd.resolve();
        return dfd.promise();
    }

// resolve keynodes
    var self = this;
    this.needUpdate = false;
    this.requestUpdate = function () {
        var updateVisual = function () {
// check if object is an arc
            var dfd1 = drawAllElements();
            dfd1.done(function (r) {
                return;
            });


/// @todo: Don't update if there are no new elements
            window.clearTimeout(self.structTimeout);
            delete self.structTimeout;
            if (self.needUpdate)
                self.requestUpdate();
            return dfd1.promise();
        };
        self.needUpdate = true;
        if (!self.structTimeout) {
            self.needUpdate = false;
            SCWeb.ui.Locker.show();
            self.structTimeout = window.setTimeout(updateVisual, 1000);
        }
    }
    
    this.eventStructUpdate = function (added, element, arc) {
        window.sctpClient.get_arc(arc).done(function (r) {
            var addr = r[1];
            window.sctpClient.get_element_type(addr).done(function (t) {
                var type = t;
                var obj = new Object();
                obj.data = new Object();
                obj.data.type = type;
                obj.data.addr = addr;
                if (type & sc_type_arc_mask) {
                    window.sctpClient.get_arc(addr).done(function (a) {
                        obj.data.begin = a[0];
                        obj.data.end = a[1];
                        scElements[addr] = obj;
                        self.requestUpdate();
                    });
                }
            });
        });
    };
// delegate event handlers
    this.sandbox.eventDataAppend = $.proxy(this.receiveData, this);
    this.sandbox.eventStructUpdate = $.proxy(this.eventStructUpdate, this);
    this.sandbox.updateContent();
};
SCWeb.core.ComponentManager.appendComponentInitialize(BookSearch.DrawComponent);

