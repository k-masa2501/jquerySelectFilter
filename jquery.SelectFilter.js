/*! SelectFilter v0.1 | (c) masanori kitajima | https://github.com/k-masa2501/jquerySelectFilter */
(function( $ ) {

  var methods = {
    init: function(o_this, arg){

      var obj = null;
      var selection = null;
      var div_control = null;
      var ul_filter = null;
      var input_text = null;
      var radio_id = null;
      var option = null;

      option = methods._get_options(arg);

      for(var i=0,len=o_this.length;i < len;i++){

        obj = $(o_this[i]);

        selection = new Array();
        div_control = $("<div class='div_control' tabIndex='0' style='display: none;'></div>");
        ul_filter = $("<ul></ul>");
        input_text = $("<input type='text' name='"+ obj.attr('name') +"'>");
        radio_id = obj.attr('id') + '-radio-id';

        $('body').append(div_control);
        obj.before(input_text);
        div_control.append(ul_filter);

        $.each(obj.children(),function(i,v){
          selection.push([$(v).text(),$(v).val()]);
        });

        obj.data('selection', selection);
        obj.data('div_control', div_control);
        obj.data('ul_filter', ul_filter);
        obj.data('input_text', input_text);
        obj.data('radio_id', radio_id);
        obj.data('delay', option.delay);

        obj.hide();

        methods._add_event_lisner(obj);

        methods._set_value(obj, obj.val());

      }
    },
    destroy: function(o_this){

      var div_control = null;
      var input_text = null;
      var radio_id = null;
      var obj = null;

      for(var i=0,len=o_this.length;i < len;i++) {

        obj = $(o_this[i]);

        div_control = obj.data('div_control');
        input_text = obj.data('input_text');
        radio_id = obj.data('radio_id');

        input_text.off();
        div_control.off();
        $(document).off("click", '.' + radio_id);
        obj.off();

        div_control.remove();
        input_text.remove();

        obj.removeData('selection');
        obj.removeData('div_control');
        obj.removeData('ul_filter');
        obj.removeData('input_text');
        obj.removeData('delay');
        obj.removeData('radio_id');

        div_control = null;
        input_text = null;
        radio_id = null;
        obj.init = null;

        obj.show();
      }
    },
    _set_value: function (obj, val){
      var id = val != null ? val:'';
      var input_text = obj.data('input_text');
      var selection = obj.data('selection');

      input_text.val('');
      obj.attr('data-text', '');
      obj.val('');

      $.each(selection,function(i,v){
        if (String(id) == String(v[1])){
          input_text.val(v[0]);
          obj.attr('data-text', v[0]);
          obj.val(v[1]);
          return false;
        }
      });
    },
    _add_event_lisner: function(obj){
      var div_control = obj.data('div_control');
      var input_text = obj.data('input_text');
      var radio_id = obj.data('radio_id');

      input_text.mousedown(function(){
        methods._mousedown(obj);
      });

      input_text.focusout(function(){
        methods._focusout(obj);
      });

      input_text.keyup(function() {
        methods._keyup(obj);
      });

      input_text.on('input propertychange',function(){
        methods._keyup(obj);
      });

      div_control.focusout(function(){
        methods._focusout(obj);
      });

      div_control.mouseenter(function(){
        methods._mouseenter(this);
      });

      div_control.mouseleave(function(){
        methods._mouseleave(this);
      });

      $(document).on('click', '.'+radio_id, function(){
        methods._click_radio(this, obj);
      });

    },
    _mousedown: function(obj){
      methods._search(obj);
      methods._show(obj);
    },
    _focusout: function (obj){
      var div_control = obj.data('div_control');
      var input_text = obj.data('input_text');

      if ('1' != div_control.attr('data-onmouse')){
        input_text.val(obj.attr('data-text'));
        div_control.hide();
      }
    },
    _click_radio: function(radio, obj){
      var text = $(radio).attr('data-text');
      var input_text = obj.data('input_text');

      input_text.val(text);
      obj.attr('data-text', text);
      obj.val($(radio).val());
    },
    _mouseenter: function(o){
      $(o).attr('data-onmouse','1');      
    },
    _mouseleave: function(o){
      $(o).attr('data-onmouse','0');      
    },
    _keyup: function(obj){
      var delay = obj.data('delay');
      var div_control = obj.data('div_control');
      methods._search_delay((function(){
        methods._search(obj);
        if ('none' == div_control.css('display')) methods._show(obj);
      }),delay);
    },
    _search: function(obj){
      var ul_filter = obj.data('ul_filter');
      var input_text = obj.data('input_text');
      var selection = obj.data('selection');
      var radio_id = obj.data('radio_id');

      var regexp = methods._set_regexp(input_text.val());
      var tmp = '';

      for (var i=0,len=selection.length; i < len; i++){
        if (regexp.test(selection[i][0])){
          tmp = tmp + "<li><input type='radio' class='"+ radio_id +"' name='"+ radio_id +
              "' data-text='"+ selection[i][0] +"' value='"+ selection[i][1] +"'>"+ selection[i][0] +"</li>";
        }
      }

      ul_filter[0].innerHTML = tmp;
      if ('' != tmp){
        $.each(ul_filter.find("input[type='radio']"), function(i,v){
          $(v).attr('checked', 'checked');
          obj.attr('data-text', $(v).attr('data-text'));
          obj.val($(v).val());
          return false;
        });
      }else{
        ul_filter[0].innerHTML = '<li>not exist.</li>';
      }
    },
    _set_regexp: function (val){
      var regexp = '';
      if ("" == val){
        regexp = new RegExp('.+');
      }else{
        val = val.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
        val = val.replace(/\s|[[:blank:]]/g, ".*");
        regexp = new RegExp('.*' + val + '.*', 'i');
      }
      return regexp;      
    },
    _search_delay: function(callback, ms){
      return (function(callback, ms){
        clearTimeout (methods.timer);
        methods.timer = setTimeout(callback, ms);
      })(callback, ms);
    },
    _show: function(obj){
      var div_control = obj.data('div_control');
      var input_text = obj.data('input_text');
      var left = input_text.offset().left;
      var top = input_text.outerHeight()+input_text.offset().top;
      div_control.css('min-width',String(input_text.outerWidth())+'px');
      div_control.css('left', String(left)+'px');
      div_control.css('top', String(top)+'px');
      div_control.show();
    },
    _get_options: function(arg){

      var delay = 300;

      if (arg != null && typeof arg == 'object'){
        if ('delay' in arg && isFinite(arg.delay)) delay = arg.delay;
      }
      return {delay: delay};
    },
    timer: 0
  };


  $.fn.SelectFilter = function(method) {

      methods[method](this, arguments[1]);

  };

})( jQuery );