/* Quick and dirty fetch of the current allowed tags. Used to produce valid-tags. 
 * TODO: Move validation to use a tag blacklist based on the HTML 5 spec, as per
 * the AMP spec suggestion.
 */

var request = require('superagent');
var doc = 'https://raw.githubusercontent.com/ampproject/amphtml/master/spec/amp-tag-addendum.md';

function parseTags(err, res) {
    var tagList = res.text.match(/`<([\w-]*)>`/igm);
    var tagArray = JSON.stringify(tagList.map(function (tag) {
        return tag.replace(/[<>`]/g, '');
    }));

    console.log(tagArray);
}

request(doc).end(parseTags);
