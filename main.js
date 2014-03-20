/**
 * @file component parser
 */

var fs          = require('fs');
var path        = require('path');
var etpl        = require('etpl');
var HTMLParser  = require('./lib/htmlparser');


var tagsTpl     = fs.readFileSync( 
    path.resolve(__dirname, 'tags.html')
    , 
    'utf-8'
);

// 去tagsTpl \n\r  etpl 支持前先人肉吧
tagsTpl = tagsTpl.replace(/\r?\n/g, '');

var etplEngine  = etpl;

function isXTag(tag) {

    return /[A-z]+-[A-z]/.test( tag );

}


function parseXTag(pos, tag, attrs, unary) {

    var xtagRender = etplEngine.getRenderer(tag);

    // 基本attr
    var mapAttrs = {
        disabled: 0
    };

    if (attrs) {

        for (var i = 0; i < attrs.length; i++) {
            mapAttrs[attrs[i].name] = attrs[i];
        }
    
    }

    var data = {
        pos: pos,
        attrs: mapAttrs,
        unary: unary
    };

    return xtagRender( data );

}

function parseTag(pos, tag, attrs, unary) {

    if ( isXTag(tag) ) {

        return parseXTag(pos, tag, attrs, unary);

    }

    var results = '';

    if( pos === 'start' ) {

        results += ''
            + '<' 
            + tag;

        for (var i = 0; i < attrs.length; i++) {
            results += ' '
                + attrs[i].name 
                + '="' 
                + attrs[i].escaped 
                + '"';
        }

        results += ''
            + (unary ? '/' : '') 
            + '>';

    }
    else if( pos === 'end' ) {

        results += '</' + tag + '>';

    }
    
    return results;

}

function parseTpl(source) {

    etplEngine.compile(tagsTpl);

    var results = '';

    HTMLParser.HTMLParser( 

        source, 
        
        {
            start: function (tag, attrs, unary) {

                results += parseTag('start', tag, attrs, unary);

            },
            end: function (tag) {

                results += parseTag('end', tag);

            },
            chars: function (text) {

                results += text;

            },
            comment: function (text) {

                results += '<!--' + text + '-->';

            }
        }

    );

    return results;

}


function addTpl(tpl) {

    etplEngine = new etpl.Engine();

    tagsTpl += tpl;
}

// exports
exports.etpl    = etplEngine;
exports.add     = addTpl;
exports.parse   = parseTpl;

