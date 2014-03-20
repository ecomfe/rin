/**
 * @file ui-component tpl parser
 */

var fs          = require('fs');
var path        = require('path');
var etpl        = require('etpl');
var htmlparser  = require('htmlparser2');

// @todo 
// htmlparser2 不稳定 
// 暂时保留 lib/htmlparser 稳定后 删除

/**
 * 标签模板
 * @type {string}
 */
var tagsTpl = fs.readFileSync(path.resolve(__dirname, 'tags.html'), 'utf-8');

// 去tagsTpl \n\r  etpl 支持前先人肉吧
tagsTpl = tagsTpl.replace(/\r?\n/g, '');

/**
 * etplEngine
 * @type {Object}
 */
var etplEngine  = etpl;


/**
 * 对象属性拷贝
 * 
 * @inner
 * @param {Object} target 目标对象
 * @param {Object} source 源对象
 * @return {Object} 返回目标对象
 */
function extend(target, source) {

    for (var key in source) {
        if (source.hasOwnProperty(key)) {
            target[key] = source[key];
        }
    }

    return target;
}

/**
 * 字符串转对象 MAP
 * 
 * @inner
 * @param {string} str 以, 分割的字符串
 * @return {Object} 返回目标对象
 */
function makTagMap(str) {

    var obj = {}, items = str.split(',');

    for (var i = 0; i < items.length; i++) {
        obj[items[i]] = true;
    }

    return obj;

}

/**
 * Empty Elements - HTML 4.01
 * @type {Object}
 */
var emptyTags = makTagMap('' 
    + 'area,base,basefont,br,col,frame,hr,img,'
    + 'input,isindex,link,meta,param,embed');

/**
 * 判断是否是特殊标签
 * 
 * @inner
 * @param {string} tag 目标对象
 * @return {boolean} 判断结果
 */   
function isXTag(tag) {

    return /[A-z]+-[A-z]/.test(tag);

}

/**
 * 处理特殊标签
 *
 * @inner
 * @param  {string} pos   'start|end'
 * @param  {string} tag   标签名
 * @param  {Object} attrs 属性
 * @param  {boolean} unary 是否补结束位
 * @return {string}       结果
 */
function parseXTag(pos, tag, attrs, unary) {

    var xtagRender = etplEngine.getRenderer(tag);

    // 默认attr
    var _attrs = {
        disabled: false
        // @todo 待扩展
    };

    extend(_attrs, attrs);

    var data = {
        pos: pos,
        attrs: _attrs,
        unary: unary
    };

    return xtagRender(data);

}

/**
 * 处理正常标签
 *
 * @inner
 * @param  {string} pos   'start|end'
 * @param  {string} tag   标签名
 * @param  {Object} attrs 属性
 * @param  {boolean} unary 是否补结束位
 * @return {string}       结果
 */
function parseTag(pos, tag, attrs, unary) {

    if (isXTag(tag)) {

        return parseXTag(pos, tag, attrs, unary);

    }

    var results = '';

    if (pos === 'start') {

        results += ''
            + '<' 
            + tag;

        for (var key in attrs) {
            results += ' '
                + key
                + '="'
                + attrs[key]
                + '"';
        }

        results += ''
            + (unary ? ' /' : '') 
            + '>';

    }
    else if (pos === 'end') {

        results += '</' + tag + '>';

    }
    
    return results;

}

/**
 * 编译模板
 * 
 * @param  {string} source 模板
 * @return {string}        结果
 */
function parseTpl(source) {

    etplEngine.compile(tagsTpl);

    var results = '';

    var parser = new htmlparser.Parser({
        onopentag: function (tag, attrs) {
            results += parseTag('start', tag, attrs, !!emptyTags[tag]);
        },
        ontext: function (text) {
            results += text;
        },
        onclosetag: function (tag) {
            results += !!emptyTags[tag] ? '' : parseTag('end', tag);
        },
        oncomment: function (text) {
            results += '<!--' + text + '-->';
        }
    });

    parser.write(source);
    parser.end();

    return results;

}

/**
 * 扩展标签
 * 
 * @param {string} tpl 标签模板
 */
function addTagTpl(tpl) {

    etplEngine = new etpl.Engine();

    tagsTpl += tpl;
}

// exports
exports.etpl    = etplEngine;
exports.add     = addTagTpl;
exports.compile = exports.parse = parseTpl;

