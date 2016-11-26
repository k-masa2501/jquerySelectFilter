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
      var div_ulList = null;

      var option = methods._get_options(arg);

      for(var i=0,len=o_this.length;i < len;i++){

        obj = $(o_this[i]);

        selection = new Array();
        div_control = $("<div class='div_control' tabIndex='0' style='display: none;'></div>");
        div_ulList = $("<div class='div_ulList'></div>");
        ul_filter = $("<ul></ul>");
        input_text = $("<input type='text' name='"+ obj.attr('name') +"'>");
        radio_id = obj.attr('id') + '-radio-id';

        $('body').append(div_control);
        obj.before(input_text);
        div_control.html(div_ulList);
        div_ulList.html(ul_filter);

        input_text.css('width',String(option.width)+'px');
        div_control.css('width',String(input_text.outerWidth())+'px');

        $.each(obj.children(),function(i,v){
          selection.push([$(v).text(),$(v).val()]);
        });

        obj.data('selection', selection);
        obj.data('div_control', div_control);
        obj.data('ul_filter', ul_filter);
        obj.data('input_text', input_text);
        obj.data('radio_id', radio_id);
        obj.data('option', option);

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
        obj.removeData('option');
        obj.removeData('radio_id');

        div_control = null;
        input_text = null;
        radio_id = null;
        obj.init = null;

        obj.show();
      }
    },
    _set_value: function (obj, _val){
      var val = _val != null ? _val:'';
      var input_text = obj.data('input_text');
      var selection = obj.data('selection');

      input_text.val('');
      obj.attr('data-text', '');
      obj.val('');

      $.each(selection,function(i,v){
        if (String(val) == String(v[1])){
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

      input_text.mousedown($.proxy(function(){
        methods._mousedown(this);
      },obj));

      input_text.focusout($.proxy(function(){
        methods._focusout(this);
      },obj));

      input_text.on('input propertychange',$.proxy(function(){
        methods._keyup(this);
      },obj));

      div_control.focusout($.proxy(function(){
        methods._focusout(this);
      },obj));

      div_control.mouseenter(function(){
        methods._mouseenter(this);
      });

      div_control.mouseleave(function(){
        methods._mouseleave(this);
      });

      $(document).on('click', '.'+radio_id, $.proxy(function(e){
        methods._click_radio(e, this);
      },obj));

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
    _click_radio: function(event, obj){

      var radio = $(event.currentTarget);
      var text = $(radio).attr('data-text');
      var input_text = obj.data('input_text');
      var option = obj.data('option');

      input_text.val(text);
      obj.attr('data-text', text);
      obj.val($(radio).val());

      methods._delay_proc((function(){
        var div_control = obj.data('div_control');
        div_control.hide();
      }),option.delay);
      
    },
    _mouseenter: function(o){
      $(o).attr('data-onmouse','1');      
    },
    _mouseleave: function(o){
      $(o).attr('data-onmouse','0');      
    },
    _keyup: function(obj){
      var option = obj.data('option');

      methods._delay_proc((function(obj){
        var div_control = obj.data('div_control');
        methods._search(obj);
        if ('none' == div_control.css('display')) methods._show(obj);
      })(obj),option.delay);
    },
    _search: function(obj){
      var ul_filter = obj.data('ul_filter');
      var input_text = obj.data('input_text');
      var selection = obj.data('selection');
      var radio_id = obj.data('radio_id');
      var selected = obj.attr('data-text');
      var checked = '';

      var regexp = methods._set_regexp(input_text.val());
      var tmp = '';

      for (var i=0,len=selection.length; i < len; i++){
        if (regexp.test(selection[i][0])){
          if (selected == selection[i][0]) {checked='checked';}else{checked=''}
          tmp = tmp + "<li><button class='"+ radio_id +"' name='"+ radio_id + "'";
          tmp += "data-text='"+ selection[i][0] +"' value='"+ selection[i][1] +"'" + checked + ">"+ selection[i][0];
          tmp += "</button></li>";
        }
      }

      if ('' != tmp){
        ul_filter[0].innerHTML = tmp;
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
    _delay_proc: function(callback, ms){
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
      div_control.css('left', String(left)+'px');
      div_control.css('top', String(top)+'px');
      div_control.show();
    },
    _get_options: function(arg){

      var delay = 300;
      var width = 200;

      if (arg != null && typeof arg == 'object'){
        if ('delay' in arg && isFinite(arg.delay)) delay = arg.delay;
        if ('width' in arg && isFinite(arg.width)) width = arg.width;

      }
      return {
        delay: delay,
        width: width
      };
    },
    timer: 0
  };

  $.fn.SelectFilter = function(method) {
      methods[method](this, arguments[1]);
  };

})( jQuery );