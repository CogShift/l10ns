
if(typeof define !== 'function') {
  var define = require('amdefine')(module);
}

define(function(require) {
  var View = inServer ? require('../../libraries/View') : require('View')
    , template = inServer ? content_appTemplates : require('contentTemplates')
    , _ = require('underscore');

  if(inClient) {
    var minTimer = require('minTimer')
      , SinusWave = require('../../libraries/client/SinusWave');
  }

  return View.extend({

    /**
     * Initializer
     *
     * @return {void}
     * @api public
     */

    initialize: function(model) {
      this.model = model;
      if(inClient) {
        this._lastSave = Date.now();
        this._bindMethods();
      }
    },

    /**
     * Bind view
     *
     * @return {void}
     * @api private
     */

    bindDOM: function() {
      this._setElements();
      this._addDesktopInteractions();
    },

    /**
     * Bind methods
     *
     * @return {void}
     * @api private
     */

    _bindMethods: function() {
      _.bindAll(
        this,
        '_save',
        '_syncValue',
        '_delayedResize',
        '_resizeTextArea',
        '_addPluralFormatedText',
        '_addSelectFormatedText',
        '_addChoiceFormatedText',
        '_addSelectordinalFormatedText',
        '_addNumberFormatedText',
        '_addCurrencyFormatedText',
        '_addVariableFormatedText'
      );
    },

    /**
     * Resize textarea
     *
     * @api private
     * @handler
     */

    _resizeTextArea: function(event) {
      if(typeof event !== 'undefined' && event.keyCode === 8) {
        this.$textAreaMirror.val('');
      }
      else if(typeof event !== 'undefined' && event.keyCode === 13) {
        this.$textAreaMirror.val(this.$textArea.val() + '\nsuffix');
      }
      else {
        this.$textAreaMirror.val(this.$textArea.val() + 'suffix');
      }
      var height = this.$textAreaMirror[0].scrollHeight -
        parseInt(this.$textAreaMirror.css('padding-top').replace('px', ''), 10) -
        parseInt(this.$textAreaMirror.css('padding-bottom').replace('px', ''), 10);
      this.$textArea.css('height', height + 'px');
    },

    /**
     * Delay resize
     *
     * @api private
     * @handler
     */

    _delayedResize: function() {
      _.defer(this._resizeTextArea);
    },

    /**
     * Syn value with model
     *
     * @return {void}
     * @api private
     * @handler
     */

    _syncValue: function() {
      this.model.set('value', this.$textArea.val());
    },

    /**
     * Add desktop listeners
     *
     * @return {void}
     * @api private
     */

    _addDesktopInteractions: function() {
      this.$('[disabled]').removeAttr('disabled');
      this.$el.on('click', '.save', this._save);
      this.$textArea.on('change', this._resizeTextArea);
      this.$textArea.on('change', this._syncValue);
      this.$textArea.on('cut', this._resizeTextArea);
      this.$textArea.on('paste', this._resizeTextArea);
      this.$textArea.on('drop', this._resizeTextArea);
      this.$textArea.on('keydown', this._resizeTextArea);
      this.$addPluralButton.on('mousedown', this._addPluralFormatedText);
      this.$addSelectButton.on('mousedown', this._addSelectFormatedText);
      this.$addChoiceButton.on('mousedown', this._addChoiceFormatedText);
      this.$addSelectordinalButton.on('mousedown', this._addSelectordinalFormatedText);
      this.$addNumberButton.on('mousedown', this._addNumberFormatedText);
      this.$addCurrencyButton.on('mousedown', this._addCurrencyFormatedText);
      this.$variable.on('mousedown', this._addVariableFormatedText);
      this.$save.on('mouseup', this._save);
      this._resizeTextArea();
    },

    /**
     * Replace selected text in textarea with text
     *
     * @param {String} text
     * @return {void}
     * @api private
     */

    _replaceTextSelectionWithText: function(text) {
      var _this = this
        , string = this.$textArea.val()
        , start = this.$textArea[0].selectionStart
        , end = this.$textArea[0].selectionEnd
        , startString = string.substring(0, start)
        , endString = string.substring(end, string.length);

      this.$textArea.val(startString + text + endString);
      this._syncValue();
      this._resizeTextArea();

      setTimeout(function() {
        if(_this.$textArea[0].createTextRange) {
          var range = _this.$textArea[0].createTextRange();
          range.move('character', end);
          range.select();
        }
        else {
          if(_this.$textArea[0].selectionStart) {
            _this.$textArea[0].focus();
            _this.$textArea[0].setSelectionRange(start, text.length + start);
          }
          else {
            _this.$textArea[0].focus();
          }
        }
      }, 0);
    },

    /**
     * Add variable formated text to textarea
     *
     * @return {void}
     * @api private
     */

    _addVariableFormatedText: function(event) {
      var string = this.$textArea.val()
        , start = this.$textArea[0].selectionStart
        , end = this.$textArea[0].selectionEnd
        , startString = string.charAt(start - 1)
        , variable = event.currentTarget.getAttribute('data-value')
        , text;

      if(startString === '{') {
        text = event.currentTarget.getAttribute('data-value');
      }
      else {
        text = '{' + event.currentTarget.getAttribute('data-value') + '}';
      }

      this._replaceTextSelectionWithText(text);
    },

    /**
     * Add plural formated text to textarea
     *
     * @return {void}
     * @api private
     */

    _addPluralFormatedText: function() {
      var variable = 'variable';
      if(this.model.get('variables').length === 1) {
        variable = this.model.get('variables')[0];
      }
      var text = '{' + variable + ', plural,';
      var keywords =  Object.keys(this.model.get('pluralRules'));
      for(var index = 0; index < keywords.length; index++) {
        text +=  ' ' + keywords[index] + ' {message-' + keywords[index] + '}';
      }
      text += '}';
      this._replaceTextSelectionWithText(text);
    },

    /**
     * Add select formated text to textarea
     *
     * @return {void}
     * @api private
     */

    _addSelectFormatedText: function() {
      var variable = 'variable';
      if(this.model.get('variables').length === 1) {
        variable = this.model.get('variables')[0];
      }
      var text = '{' + variable + ', select , other {message-other}}';
      this._replaceTextSelectionWithText(text);
    },

    /**
     * Add select formated text to textarea
     *
     * @return {void}
     * @api private
     */

    _addChoiceFormatedText: function() {
      var variable = 'variable';
      if(this.model.get('variables').length === 1) {
        variable = this.model.get('variables')[0];
      }
      var text = '{' + variable + ', choice, 1<message1|5#message2}';
      this._replaceTextSelectionWithText(text);
    },

    /**
     * Add select ordinal formated text to textarea
     *
     * @return {void}
     * @api private
     */

    _addSelectordinalFormatedText: function() {
      var variable = 'variable';
      if(this.model.get('variables').length === 1) {
        variable = this.model.get('variables')[0];
      }
      var text = '{' + variable + ', selectordinal,';
      var keywords =  Object.keys(this.model.get('ordinalRules'));
      for(var index = 0; index < keywords.length; index++) {
        text +=  ' ' + keywords[index] + ' {message-' + keywords[index] + '}';
      }
      text += '}';
      this._replaceTextSelectionWithText(text);
    },

    /**
     * Add number formated text to textarea
     *
     * @return {void}
     * @api private
     */

    _addNumberFormatedText: function() {
      var variable = 'variable';
      if(this.model.get('variables').length === 1) {
        variable = this.model.get('variables')[0];
      }
      var text = '{' + variable + ', number, integer}'
      this._replaceTextSelectionWithText(text);
    },

    /**
     * Add number formated text to textarea
     *
     * @return {void}
     * @api private
     */

    _addCurrencyFormatedText: function() {
      var variable = 'variable';
      if(this.model.get('variables').length === 1) {
        variable = this.model.get('variables')[0];
      }
      var text = '{' + variable + ', currency, local, symbol}'
      this._replaceTextSelectionWithText(text);
    },

    /**
     * Set elements
     *
     * @return {void}
     * @api private
     */

    _setElements: function() {
      this.$region = $('[data-region=localization]');
      this.$textArea = this.$('.localization-textarea-real');
      this.$textAreaMirror = this.$('.localization-textarea-mirror');
      this.$textAreaHeightHelper = this.$('.localization-textarea-height-helper');
      this.$addPluralButton = this.$('.localization-action-plural');
      this.$addSelectButton = this.$('.localization-action-select');
      this.$addChoiceButton = this.$('.localization-action-choice');
      this.$addSelectordinalButton = this.$('.localization-action-selectordinal');
      this.$addNumberButton = this.$('.localization-action-number');
      this.$addCurrencyButton = this.$('.localization-action-currency');
      this.$messageText = this.$('.localization-message-text');
      this.$buttons = this.$('.localization-buttons');
      this.$save = this.$('.localization-save');
      this.$loadingCanvas = this.$('.localization-loading-canvas');
      this.$variable = this.$('.localization-variable');
    },

    /**
     * Save
     *
     * @delegate
     */

    _save: function(event) {
      var _this = this;

      if(Date.now() - this._lastSave < 1000) {
        return;
      }

      this._lastSave = Date.now();

      var sinusWave = new SinusWave;
      sinusWave.setCanvas(this.$loadingCanvas[0]);
      sinusWave.start();
      minTimer.start(1000);
      this.$buttons.removeClass('is-revealed').addClass('is-hidden');

      event.preventDefault();
      this.model.save(null, {
        success: function(model, response, options) {
          minTimer.end(function() {
            sinusWave.stop();
            _this.$buttons.removeClass('is-hidden').addClass('is-revealed');
            _this.$messageText.removeClass('has-error').html(_this.model.get('message'));
          });
        },
        error: function(model, response, options) {
          minTimer.end(function() {
            sinusWave.stop();
            _this.$buttons.removeClass('is-hidden').addClass('is-revealed');
            _this.$messageText.addClass('has-error').html(response);
          });
        }
      });
    },

    /**
     * To HTML
     *
     * @return {void}
     * @api public
     */

    toHTML: function() {
      var _this = this
        , html = ''
        , values = ''
        , json = this.model.toJSON();

      json.values = values;

      html += template['Localization'](json);

      return html;
    },

    /**
     * On finish rendering callback
     *
     * @return {void}
     * @handler
     * @api public
     */

    onFinishRendering: function() {
      var _this = this;

      this.$region.show();

      setTimeout(function() {
        _this.$region.removeClass('is-hidden').addClass('is-revealed');
      }, 300);
    },

    /**
     * Determine whether to render or not
     *
     * @return {String}
     * @api public
     * @autocalled
     */

    should: function(path) {
      return 'update';
    }
  });
});
