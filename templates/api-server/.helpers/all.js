// Module constructor provides dependency injection from the generator instead of relying on require's cache here to ensure
// the same instance of Handlebars gets the helpers installed and Lodash is definitiely available
// regardless of where remote templates reside: in another Node project or a plain directory, which may have different or no modules available.
module.exports = (Handlebars, _) =>{

  const parseRef = (refs) => {
    if (Array.isArray(refs) && refs.length > 0) {
      const ref = refs[0].split('/')
      return ref[3]
    }

    return ''
  }

  const tsType = (type, schema) => {
    switch (type) {
      case 'integer':
        return 'number';
      case 'array':
        return `Array<${tsType(schema.items.type, schema.items)}>`;
      case 'object':
        if (schema['x-original-ref']) {
          return parseRef(schema['x-original-ref']);
        }

        // if there's no original ref, then gotta recurse down
        return type;
      default:
        return type;
    }
  }

  /**
   * Compares two values.
   */
  Handlebars.registerHelper('equal', (lvalue, rvalue, options) => {
    if (arguments.length < 3)
      throw new Error('Handlebars Helper equal needs 2 parameters');
    if (lvalue!=rvalue) {
      return options.inverse(this);
    }
    return options.fn(this);
  });

  /**
   * Compares two values with context.
   */
  Handlebars.registerHelper('equalContext', (context, lvalue, rvalue, options) => {
    if (arguments.length < 3)
      throw new Error('Handlebars Helper equal needs 2 parameters');
    if (lvalue!=rvalue) {
      return options.inverse(context);
    }
    return options.fn(context);
  });

  /**
   * Checks if a string ends with a provided value.
   */
  Handlebars.registerHelper('endsWith', (lvalue, rvalue, options) => {
    if (arguments.length < 3)
      throw new Error('Handlebars Helper equal needs 2 parameters');
    if (lvalue.lastIndexOf(rvalue) !== lvalue.length-1 || lvalue.length-1 < 0) {
      return options.inverse(this);
    }
    return options.fn(this);
  });

  /**
   * Checks if a method is a valid HTTP method.
   */
  Handlebars.registerHelper('validMethod', (method, options) => {
    const authorized_methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'COPY', 'HEAD', 'OPTIONS', 'LINK', 'UNLIK', 'PURGE', 'LOCK', 'UNLOCK', 'PROPFIND'];

    if (arguments.length < 3)
      throw new Error('Handlebars Helper validMethod needs 1 parameter');
    if (authorized_methods.indexOf(method.toUpperCase()) === -1) {
      return options.inverse(this);
    }

    return options.fn(this);
  });

  /**
   * Checks if a collection of responses contains no error responses.
   */
  Handlebars.registerHelper('ifNoErrorResponses', (responses, options) => {
    const codes = responses ? Object.keys(responses) : [];
    if (codes.find(code => Number(code) >= 400)) return options.inverse(this);

    return options.fn(this);
  });

  /**
   * Checks if a collection of responses contains no success responses.
   */
  Handlebars.registerHelper('ifNoSuccessResponses', (responses, options) => {
    const codes = responses ? Object.keys(responses) : [];
    if (codes.find(code => Number(code) >= 200 && Number(code) < 300)) return options.inverse(this);

    return options.fn(this);
  });

  /**
   * Checks if a string matches a RegExp.
   */
  Handlebars.registerHelper('match', (lvalue, rvalue, options) => {
    if (arguments.length < 3)
      throw new Error('Handlebars Helper match needs 2 parameters');
    if (!lvalue.match(rvalue)) {
      return options.inverse(this);
    }

    return options.fn(this);
  });

  /**
   * Provides different ways to compare two values (i.e. equal, greater than, different, etc.)
   */
  Handlebars.registerHelper('compare', (lvalue, rvalue, options) => {
    if (arguments.length < 3) throw new Error('Handlebars Helper "compare" needs 2 parameters');

    const operator = options.hash.operator || '==';
    const operators = {
      '==':       (l,r) => { return l == r; },
      '===':      (l,r) => { return l === r; },
      '!=':       (l,r) => { return l != r; },
      '<':        (l,r) => { return l < r; },
      '>':        (l,r) => { return l > r; },
      '<=':       (l,r) => { return l <= r; },
      '>=':       (l,r) => { return l >= r; },
      typeof:     (l,r) => { return typeof l == r; }
    };

    if (!operators[operator]) throw new Error(`Handlebars Helper 'compare' doesn't know the operator ${operator}`);

    const result = operators[operator](lvalue,rvalue);

    if (result) {
      return options.fn(this);
    }

    return options.inverse(this);
  });

  /**
   * Capitalizes a string.
   */
  Handlebars.registerHelper('capitalize', (str) => {
    return _.capitalize(str);
  });

  Handlebars.registerHelper('stringify', (obj) => {
    return JSON.stringify(obj)
  });

  /**
   * Capitalizes the first char of a string
   */
  Handlebars.registerHelper('capOnly', (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  });

  /**
   * Converts a string to its camel-cased version.
   */
  Handlebars.registerHelper('camelCase', (str) => {
    return _.camelCase(str);
  });

  /**
   * Converts a multi-line string to a single line.
   */
  Handlebars.registerHelper('inline', (str) => {
    return str ? str.replace(/\n/g, '') : '';
  });

  /**
   * Formats a description string for documentation
   */
  Handlebars.registerHelper('docComment', (str) => {
    return str ? str.replace(/\n/g, "\n* ") : '';
  });

  /**
   * Adds a Params prefix to the operation id.
   */
  Handlebars.registerHelper('paramOperation', (str) => {
    str = _.camelCase(str.replace(/ /g, '_')) + 'Params';
    return str.charAt(0).toUpperCase() + str.slice(1);
  });

  Handlebars.registerHelper('funcOperation', (str) => {
    return _.camelCase(str.replace(/ /g, '_'));
  });

  Handlebars.registerHelper('formatOperation', (str) => {
    str = _.camelCase(str.replace(/ /g, '_'));
    return str.charAt(0).toUpperCase() + str.slice(1);
  });

  /**
   * Consolidates allOf items, removing duplicates
   */
  Handlebars.registerHelper('combineAllOf', (items) => {
    if (Array.isArray(items)) {
      const properties = {}
      items.forEach((item) => {
        if (item.properties) {
          Object.keys(item.properties).forEach((prop) => {
            properties[prop] = item.properties[prop]
            if (Array.isArray(item.required) && item.required.includes(prop)) {
              properties[prop].required = true
            }
          })
        }
      })

      items.properties = properties
      return items
    }

    return items
  });

  /**
   * Adds a Params prefix to the operation id.
   */
  Handlebars.registerHelper('resOperation', (str) => {
    str = _.camelCase(str.replace(/ /g, '_')) + 'Response';
    return str.charAt(0).toUpperCase() + str.slice(1);
  });

  /**
   * Converts a value to a string literal if it cannot be
   * used as a variable name
   */
  Handlebars.registerHelper('formatVar', (str) => {
    // @todo add a better checker, preferrably regex-based
    // to cover other cases
    if (str.includes('-')) {
      return `'${str}'`
    }

    return str
  });

  Handlebars.registerHelper('isLoneObj', (context, options) => {
     if(context.type === 'object' && !Array.isArray(context['x-original-ref'])) {
       return options.fn(context);
     }

     return options.inverse(context);
  })

  /**
   * Transforms an openapi type to a typescript one
   */
  Handlebars.registerHelper('tsType', tsType);

  /**
   * Transforms x-original-ref to a type
   */
  Handlebars.registerHelper('parseRef', parseRef)
}

