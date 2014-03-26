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
var tagsTpl = '';

/**
 * etplEngine
 * @type {Object}
 */
var etplEngine  = etpl;

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
 * 标签属性toString
 * @param  {Object} attrs 标签对象
 * @return {string}       转换结果
 */
function attrsStringify(attrs) {

    var output = [];

    for (var key in attrs) {
        if (attrs[key]) {
            output.push(key + '="' + attrs[key] + '"');
        } 
        else if (attrs[key] === '') {
            output.push(key);
        }
    }

    return output.length > 0 ? ' ' + output.join(' ') : '';

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
function parseHtmlTag(pos, tag, attrs, unary) {

    var results = '';

    if (pos === 'start') {

        results += ''
            + '<' 
            + tag;

        results += ''
            + attrsStringify(attrs);

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

    // 找不到 xtag 按普通标签处理
    if (!xtagRender) {
        return parseHtmlTag(pos, tag, attrs, unary);
    }

    var data = {
        pos: pos,
        attrs: attrs,
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
    else {

        return parseHtmlTag(pos, tag, attrs, unary);

    }

}

/**
 * 编译模板
 * 
 * @param  {string} source 模板
 * @return {string}        结果
 */
function parseTpl(source) {

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
 * 替换标签
 * 
 * @param {string} tpl 标签模板
 */
function replaceTagTpl(tpl) {

    tagsTpl = tpl;

    etplEngine = new etpl.Engine();

    etplEngine.compile(tagsTpl);

}

/**
 * 扩展标签
 * 
 * @param {string} tpl 标签模板
 */
function addTagTpl(tpl) {

    replaceTagTpl(tagsTpl + tpl);
    
}

/**
 * 自带标签
 * @type {string}
 */
var defaultTpl = fs.readFileSync(path.resolve(__dirname, 'tags.html'), 'utf-8');

// defaultTpl \n\r  etpl 支持前先人肉吧
defaultTpl = defaultTpl.replace(/\r?\n/g, '');

// init
replaceTagTpl(defaultTpl);

// exports
exports.etpl    = etplEngine;
exports.replace = replaceTagTpl;
exports.add     = addTagTpl;
exports.compile = exports.parse = parseTpl;

