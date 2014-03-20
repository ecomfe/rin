/**
 * @file test
 */

var fs 		= require('fs');
var path 	= require('path');
var rin 	= require('../main');


var testPath = path.resolve(__dirname, 'test.html');

var before = fs.readFileSync(testPath, 'utf-8'); 

var after = rin.parse(before);

console.log( ['', 'before:', before, '', 'after:', after].join('\n') );