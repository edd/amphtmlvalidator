# AMP HTML Validator

A fairly simplistic command line validator for [AMP HTML pages](https://github.com/ampproject/amphtml). The AMP JS library provides a browser-based validator, accessible by appending ```#development=1``` to the page address, but this tool can be useful for testing purposes.

It is not currently feature complete, and does not test all requirements of the [AMP HTML spec](https://github.com/ampproject/amphtml/blob/master/spec/amp-html-format.md).

## Todo
Validate:
* Style tag count
* Based on HTML 5 element list, rather than an element whitelist
* Prohibited tag usage (e.g. link hrefs must not contain javascript)
* ...

Also, tests.

## Usage

### Basic Usage
 ```node index.js [your_url_here]```
 
Fetch & validate a URL. There is also a convenience script to test [ampproject.org/how-it-works]
```npm run example```


## Uses
* [command-line-args](https://github.com/75lb/command-line-args)
* [html-tags](https://github.com/sindresorhus/html-tags)
* [js-dom](https://github.com/tmpvar/jsdom)
* [ramda](http://ramdajs.com/0.18.0/index.html)
* [superagent](https://github.com/visionmedia/superagent)
* [tap](https://github.com/isaacs/node-tap)
