var tap = require('tap');
var jsdom = require('jsdom');
var R = require('ramda');
var tagWhitelist = require('./data/valid-tags.json');
var tagBuiltins = require('./data/builtins');
var commandLineArgs = require('command-line-args');

var cli = commandLineArgs([
    { name: 'url', alias: 'u', type: String, defaultOption: true }
]);

// TODO: Move to a tag blacklist based on html-tags
function isValidElement(tagName) {
    return !R.contains(tagName)(tagWhitelist);
}

function isAmpTag(tagName) {
	return tagName.match(/amp-([\w-]*)/) && ! R.contains(tagName)(tagBuiltins);
}

function hasValidAmpProperty(h) {
	return ('' === h.getAttribute('amp') || 
			'' === h.getAttribute('data-amp') ||
			'' === h.getAttribute('⚡'));
}

function hasCorrespondingScriptTag(doc, tagName) {
	var script = doc.querySelector('head script[custom-element="' + tagName + '"]');

	tap.ok(script, 'HEAD must contain script tag for custom element ' + tagName);
	
	if (!script) { return; }
    tap.equal(script.getAttribute('async'), '',
        tagName + ' script tag must be async');

}

function validateDocumentStructure(doc) {
    tap.equal(doc.doctype.name, 'html', 'Doctype should be html');

    tap.ok(doc.head, 'Document must have a head');
    tap.ok(doc.body, 'Document must have a body');

	tap.ok(hasValidAmpProperty(doc.documentElement),
		'HTML element must have amp property');
    return doc;
}

function validateMetaTags(doc) {
    var charsetMetaTag = doc.querySelector('head > *');

    tap.equal(charsetMetaTag.tagName, 'META',
        'Expected first child of HEAD tag to be a meta tag');
    tap.equal(charsetMetaTag.getAttribute('charset'), 'utf-8',
        'Expected first child of HEAD to set charset="utf-8"');
    
    var viewportMetaTag = doc.querySelector('head meta[name="viewport"]'); 

    tap.ok(viewportMetaTag,
        'Document must contain a viewport meta tag');
    tap.equal(viewportMetaTag.getAttribute('content'),
        'width=device-width,initial-scale=1,minimum-scale=1,maximum-scale=1,user-scalable=no,minimal-ui',
        'Must have the standard viewport meta tag content');

    return doc;
}

function validateHeadContents(doc) {
    tap.ok(doc.querySelector('head link[rel="canonical"]'),
        'Document must contain a canonical link');
    
    tap.ok(doc.querySelector('head link[rel="canonical"]'),
        'Document must contain a canonical link');
    
    var ampScriptTag = doc.querySelector('head script[src^="https://cdn.ampproject.org/v0.js"]'); 
    tap.equal(ampScriptTag.getAttribute('async'), '',
        'AMP JS library script tag must be async');

    var noscriptTag = doc.querySelector('head style + noscript');
    tap.ok(noscriptTag, 
        'HEAD must contain a noscript tag');
    tap.equal(noscriptTag.innerHTML, '<style>body {opacity: 1}</style>',
        'HEAD must contain a noscript tag that sets opacity');
    
    return doc;
}

function validateMarkup(doc) {
    var elements = [].slice.call(doc.querySelectorAll('*'));
    var tags = R.uniq(R.map(R.toLower, R.pluck('tagName')(elements)));
    var invalidTags = R.filter(isValidElement)(tags);
    
    tap.deepEqual(invalidTags, [], 'All tags should be valid');
   

	var ampTags = R.filter(isAmpTag)(tags);
	var customElementsHaveScripts = R.curry(hasCorrespondingScriptTag)(doc);
	R.map(customElementsHaveScripts, ampTags);
    
	return doc;
}

function validate(err, res) {
    var validation = R.pipe(
        validateMetaTags,
        validateDocumentStructure,
        validateHeadContents,
        validateMarkup
    );

    validation(res.document);
}

var options = cli.parse();
jsdom.env(options.url, {features: {FetchExternalResources: false}}, validate);
