var imprt = require('rework-import');
var rework = require('rework');
var inherit = require('rework-inherit');

/**
 * Quickly replaces module stuff in the source before reworking it
 */
function prepare(source) {
    var structure = source
      .replace(/\bextends\s+([^;]+?)(?:\s+from\s+([^;]+?))?\s*\{/g, function(match, selector, module){
        return '{ inherits: ' + (module ? '.' + module : '@this') + ' ' + selector + ';';
    }).replace(/\bextends\s+([^;]+?)(?:\s+from\s+([^;]+?))?\s*;/g, function(match, selector, module){
        return 'inherits: ' + (module ? '.' + module : '@this') + ' ' + selector + ';';
    }).replace(/@import\s+([^;]+?)\s+from\s+([^;]+)\s*;/g, function(match, selector, module){
        return selector + ' { inherits: .' + module + ' ' + selector + '; }';
    }).replace(/\bimport\s+([^;]+?)\s+from\s+([^;]+)\s*;/g, function(match, selector, module){
        return 'import: .' + module + ' ' + selector + ';';
    }).split(/@module\s+(\w+);/);

    var global = structure.shift();
    var name, modules = {};

    while (structure.length) {
        name = structure.shift();
        modules[name] = rework(structure.shift())
            .use(function(css, rework){
                css.rules.forEach(function(rule){
                    if (rule.type != 'rule') return;

                    for (var i = 0; i < rule.selectors.length; i++) {
                        if (rule.selectors[i].indexOf('@this') !== -1) continue;
                        rule.selectors[i] = '@this ' + rule.selectors[i];
                    }
                });
                return css;
            }).toString();
    }

    for (name in modules) {
        global += modules[name].replace(/@this/g, '.'+name) + '\n';
    }

    return global;
}

/**
 * Reads unprocessed source, prepares it, imports stuff and returns rework object
 */
function MOOCSS(source, options) {
    return rework(prepare(source), options)
        .use(imprt({ transform: prepare }))
        .use(function(css, rework){
            var inserts = [];
            var sum = 1;

            css.rules.forEach(function(rule, idx){
                if (rule.type != 'rule') return;

                rule.declarations = rule.declarations.filter(function(declaration){
                    if (declaration.property === 'import') {
                        var match = declaration.value.match(/^(\.\w+)\s+(.+)/);
                        var selectors = rule.selectors.map(function(selector){
                            return selector + ' ' + match[2];
                        });

                        inserts.push({
                            index: idx,
                            rule: {
                                type: 'rule',
                                selectors: selectors,
                                declarations: [{
                                    type: 'declaration',
                                    property: 'inherits',
                                    value: declaration.value
                                }]
                            }
                        });

                        return false;
                    }

                    return true;
                });
            });

            inserts.forEach(function(insert){
                css.rules.splice(insert.index + (sum++), 0, insert.rule);
            });

            return css;
        })
        .use(inherit());
}

exports = module.exports = MOOCSS;