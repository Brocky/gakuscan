import { fromGCloudVision } from "./entry-logfactory.js";

function getScanner(apiKey) {
    return {
        _apiKey: apiKey,
        scan: async (image) => {
            var b64image   = image.selection.dataURL.split(';base64,')[1];
            const response = await fetch(
                'https://eu-vision.googleapis.com/v1p4beta1/images:annotate?key=' + apiKey,
                {
                    method:'POST',
                    body: JSON.stringify({
                        "requests": [{
                            image: {content: b64image},
                            features: [{type: 'TEXT_DETECTION'}],
                            imageContext: {
                                languageHints: ['ja']
                            }
                        }]
                    })
                }
            );

            if(!response.ok) {
                throw new Error(response.text);
            }

            const result = await response.json();
            return fromGCloudVision(result.responses[0], image);
        }
    }
}

export {getScanner};