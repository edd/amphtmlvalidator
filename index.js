var tap = require('tap');
var jsdom = require('jsdom');
var R = require('ramda');
var tagWhitelist = require('./data/valid-tags.json');
var commandLineArgs = require('command-line-args');

var cli = commandLineArgs([
    { name: 'url', alias: 'u', type: String, defaultOption: true }
]);

// TODO: Move to a tag blacklist based on html-tags
function isValidElement(tagName) {
    return !R.contains(tagName)(tagWhitelist);
}

function validateDocumentStructure(doc) {
 //   tap.ok(doc['doctype'], '<!doctype html>', 'Doctype should be correct, got: ' + res.document['doctype'] );

    tap.ok(doc.head, 'Document must have a head');
    tap.ok(doc.body, 'Document must have a body');
    
    return doc;
}

function validateMetaTags(doc) {
    var charsetMetaTag = doc.head.childNodes[1];

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
    
    var ampScriptTag = doc.querySelector('head script[src^="https://cdn.ampproject.org"]'); 
    tap.equal(ampScriptTag.getAttribute('src'), 'https://cdn.ampproject.org/v0.js',
        'Must contain a reference to the AMP JS library');
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
