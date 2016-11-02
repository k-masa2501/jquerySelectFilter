/*! SelectFilter v0.1 | (c) masanori kitajima | https://github.com/k-masa2501/jquerySelectFilter */
(function( $ ) {

  var methods = {
    _get_options: function(arg){
      
      var delay = 300;

      if (arg != null && typeof arg == 'object'){
        if ('delay' in arg && isFinite(arg.delay)) delay = arg.delay;
      }
      return {delay: delay};
    },
    init: function(o_this, arg){

      var obj = null;
      var selection = null;
      var div_filter = null;
      var ul_filter = null;
      var input_text = null;
      var radio_id = null;
      var option = null;

      option = methods._get_options(arg);

      for(var i=0;i < o_this.length;i++){

        obj = $(o_this[i]);

        selection = new Array();
        div_filter = $("<div class='div_filter' tabIndex='0' style='display: none;'></div>");
        ul_filter = $("<ul></ul>");
        input_text = $("<input type='text' name='"+ obj.attr('name') +"' class='"+ obj.attr('class') +"'>");
        radio_id = obj.attr('id') + '-radio-id';

        $('body').append(div_filter);
        obj.after(input_text);
        div_filter.append(ul_filter);

        $.each(obj.children(),function(i,v){
          selection.push([$(v).val(),$(v).text()]);
        });

        obj.data('selection', selection);
        obj.data('div_filter', div_filter);
        obj.data('ul_filter', ul_filter);
        obj.data('input_text', input_text);
        obj.data('radio_id', radio_id);
        obj.data('delay', option.delay);

        obj.hide();

        methods._add_event_lisner(obj);

        methods._set_value(obj.val(), obj);

      }
    },
    _add_event_lisner: function(obj){
      var div_filter = obj.data('div_filter');
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

      div_filter.focusout(function(){
        methods._focusout(obj);
      });

      div_filter.mouseenter(function(){
        methods._mouseenter(this);
      });

      div_filter.mouseleave(function(){
        methods._mouseleave(this);
      });

      $(document).on('click', '.'+radio_id, function(){
        methods._click_radio(this, obj);
      });

      $(document).on('SelectFilter.destroy',  function(e, arg){
        methods._destroy(obj);
      });

      $(document).on('SelectFilter.set_value',  function(e, arg){
        methods._set_value(arg, obj);
      });
    },
    _mousedown: function(obj){
      methods._search(obj);
      methods._show(obj);
    },
    _focusout: function (obj){
      var div_filter = obj.data('div_filter');
      var input_text = obj.data('input_text');

      if ('1' != div_filter.attr('data-onmouse')){
        input_text.val(obj.attr('data-text'));
        div_filter.hide();
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
      var div_filter = obj.data('div_filter');
      methods._search_delay((function(){
        methods._search(obj);
        if ('none' == div_filter.css('display')) methods._show(obj);
      }),delay);
    },
    _destroy: function(obj){
      var div_filter = obj.data('div_filter');
      var input_text = obj.data('input_text');
      var radio_id = obj.data('radio_id');

      input_text.off();
      div_filter.off();
      $(document).off("click", '.'+radio_id);
      $(document).off("SelectFilter.destroy");
      $(document).off("SelectFilter.set_value");
      obj.off();

      div_filter.remove();
      input_text.remove();

      obj.removeData('selection');
      obj.removeData('div_filter');
      obj.removeData('ul_filter');
      obj.removeData('input_text');
      obj.removeData('delay');
      obj.removeData('radio_id');

      div_filter = null;
      input_text = null;
      radio_id = null;
      obj.init = null;

      obj.show();      
    },
    _set_value: function (val, obj){
      var id = val != null ? val:'';
      var input_text = obj.data('input_text');
      var selection = obj.data('selection');

      input_text.val('');
      obj.attr('data-text', '');
      obj.val('');

      $.each(selection,function(i,v){
        if (String(id) == String(v[0])){
          input_text.val(v[1]);
          obj.attr('data-text', v[1]);
          obj.val(v[0]);
          return false;
        }
      });
    },
    _search: function(obj){
      var ul_filter = obj.data('ul_filter');
      var input_text = obj.data('input_text');
      var selection = obj.data('selection');
      var radio_id = obj.data('radio_id');

      var regexp = methods._set_regexp(input_text.val());
      var tmp = '';

      for (var i=0; i < selection.length; i++){
        if (regexp.test(selection[i][1])){
          tmp = tmp + "<li><input type='radio' class='"+ radio_id +"' name='"+ radio_id +
              "' data-text='"+ selection[i][1] +"' value='"+ selection[i][0] +"'>"+ selection[i][1] +"</li>";
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
      var div_filter = obj.data('div_filter');
      var input_text = obj.data('input_text');
      var left = input_text.offset().left;
      var top = input_text.outerHeight()+input_text.offset().top;
      div_filter.css('min-width',String(input_text.outerWidth())+'px');
      div_filter.css('left', String(left)+'px');
      div_filter.css('top', String(top)+'px');
      div_filter.show();
    },
    timer: 0
  };


  $.fn.SelectFilter = function(method) {

    if ('init' == method){
      methods[method](this, arguments[1]);
    }else{
      $(this).trigger('SelectFilter.'+method, arguments[1]);
    }

  };

})( jQuery );