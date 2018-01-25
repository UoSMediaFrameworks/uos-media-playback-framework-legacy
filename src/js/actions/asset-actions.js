
//note must be set in gulp .sh config.
const ServiceURL = process.env.ASSET_PROCESSING_SERVICE

const Endpoints = {
    imageTagging: ServiceURL + "/image/tags/"
}

var AssetActions = {
    
    getSuggestedTags(mediaObject, callback) {
        switch(mediaObject.type) {
            case "image":
                fetchSuggestedImageTags(mediaObject, callback); 
                break;
            default: 
                callback([]); 
                break;
        };
        //todo could implement video tags through AWS and text through a NLP service? need to look at adding timecode to video tags
        return
    },   


}

//functions that should not be user callable
function fetchSuggestedImageTags(mediaObject, callback) {
    console.log(Endpoints.imageTagging + encodeURIComponent(mediaObject.url))
    fetch(Endpoints.imageTagging + encodeURIComponent(mediaObject.url))
    .then(response => {return response.json()})
        .then(json => {
            var tags = [];
            json[0].forEach(fullTag => {
                tags.push(fullTag.tag); //NB: fulltag includes confidence/mid etc but we don't have anywhere to put this yet.
            });
            callback(tags);
        })
    .catch(function (err) {console.log("Error fetching from image processing service", err)})
    return
}

module.exports = AssetActions;