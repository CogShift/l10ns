
/**
 * Module dependencies
 */

var _ = require('underscore')
  , fs = require('fs')
  , path = require('path');

/**
 * Add terminal colors
 */

require('terminal-colors');

/**
 * The Page object builds up the whole html for your website.
 * You can specify boilerplate, layout, module and components to
 * customize the html you want.
 *
 * @constructor Page
 * @return {Page}
 */

function page(url) {
  if(typeof url !== 'string'
  || !_.isArray(url)) {
    throw new TypeError('first parameter must be string or array of strings');
  }

  this._url = url;
  this._title = '';
  this._description = '';
  this._style = '';
  this._main = '';
  this._outputRouter = '';
  this._moduleHtml = {};
  this._documentTmpls = documentTmpls;
  this._layoutTmpls = layoutTmpls;
  this.boilerplate = cf.boilerplate;

  return this;
}

/**
 * Set document
 *
 * @param {String} name
 * @param {Object} opts
 * @return {Page}
 * @api public
 */

page.prototype.document = function(name, opts) {
  if(typeof this._documentTmpls[name] === 'undefined') {
    throw new TypeError('document ' + name + ' does not exist');
  }

  this._documentTmpl = this._documentTmpls[name];

  // Set document properties
  if(opts.title) {
    this._title = opts.title;
  }
  if(opts.description) {
    this._description = opts.description;
  }
  if(opts.style && typeof opts.style === 'string' ) {
    this._style = opts.style;
  }
  if(opts.main && typeof opts.main === 'string') {
    this._main = opts.main;
  }
  if(opts.outputRouter && typeof opts.outputRouter === 'string') {
    this._outputRouter = opts.outputRouter;
    if(GLOBAL._outputRouters
    && _.isArray(GLOBAL._outputRouters)) {
      if(GLOBAL._outputRouters.indexOf(opts.outputRouter) !== -1) {
        GLOBAL._outputRouters.push(opts.outputRouter);
      }
    }
    else {
      GLOBAL._outputRouters = [opts.outputRouter];
    }
  }

  return this;
};

/**
 * Set layout
 *
 * @param {String} name
 * @return {Page}
 * @api public
 */

page.prototype.layout = function(name) {
  if(typeof this._layoutTmpls[name] === 'undefined') {
    throw new TypeError(name + ' layout doesn\'t exists');
  }

  this._layoutTmpl = this._layoutTmpls[name];

  return this;
};

/**
 * Define (modules) views and models
 *
 * @param {Object} modules
 * @return {void}
 * @api public
 */

page.prototype.modules = function(modules) {
  var n = 0; size = _.size(modules);
  for(var container in modules) {
    if(!modules[container].fetch) {
      throw new TypeError('module must have fetch method');
    }

    var model = new modules[i].model;

    model.fetch({
      success : function() {
        _this._moduleHtml[container] =
        modules[container].view.template(model.attributes);
        n++;
        if(n === size) {
          _this._serve();
        }
      },
      error : this.fail
    });
  }
};

/**
 * If something fails it will be forwarded to this callback
 *
 * @callback
 */

page.prototype.fail = function(callback) {
  this.fail = callback;
};

/**
 * Serve the page
 *
 * @return {void}
 * @api private
 */

page.prototype._serve = function() {
  var html = this._documentTmpl({
    title : this._title,
    description : this._description,
    styles : this._styles,
    scripts : this._scripts,
    layout : this._layoutTmpl(_this._moduleHtml)
  });

  app.get(this._url, function(req, res) {
    res.send(html);
  });
};

/**
 * Export constructor
 */

module.exports = page;

/**
 * Read template
 *
 * @exit if built files doesn't exist
 * @return {void}
 */

module.exports.readTmpls = function() {
  if(!fs.existsSync(path.join(__dirname, cf.DOCUMENT_TEMPLATES + '.js'))) {
    console.log('[:(]'.red + ' Have you built your document templates yet?');
    process.exit();
  }
  if(!fs.existsSync(path.join(__dirname, cf.LAYOUT_TEMPLATES + '.js'))) {
    console.log('[:(]'.red + ' Have you built your layout templates yet?');
    process.exit();
  }

  GLOBAL.documentTmpls = requirejs('./' + cf.DOCUMENT_TEMPLATES);
  GLOBAL.layoutTmpls = requirejs('./' + cf.LAYOUT_TEMPLATES);
};

/**
 * Write router files
 *
 * @return {void}
 */

module.exports.writeRouters = function() {
};
