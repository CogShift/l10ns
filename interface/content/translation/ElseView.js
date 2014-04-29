
if(typeof define !== 'function') {
  var define = require('amdefine')(module);
}

define(function(require) {
  var View = inServer ? require('../../lib/View') : require('View')
    , template = inServer ? content_appTmpls : require('contentTmpls')
    , _ = require('underscore');

  return View.extend({

    /**
     * Initializer
     *
     * @return {void}
     * @api public
     */

    initialize : function(model) {
      this.model = model;
      if(inClient) {
        this._bindMethods();
      }
    },

    /**
     * Bind methods
     *
     * @return {void}
     * @api public
     */

    _bindMethods : function() {
      _.bindAll(this,
        'render',
        '_updateRow'
      );
    },

    /**
     * Bind model
     *
     * @return {void}
     * @api private
     */

    bindModel : function() {
      this.model.on('change:row', this._updateRow);
    },

    /**
     * On operator change
     *
     * @delegate
     */

    _updateRow : function() {
      this.el.dataset.row = this.model.get('row');
    },

    /**
     * Render view
     *
     * @return {void}
     * @api public
     */

    render : function() {
      return this.template(this.model.toJSON());
    },

    /**
     * Template
     *
     * @type {String}
     */

    template : template['ConditionElse']
  });
});