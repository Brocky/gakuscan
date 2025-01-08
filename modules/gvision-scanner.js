function getScanner(apiKey) {
    return {
        _apiKey: apiKey,
        scan: async (imageDataURL) => {
            var b64image   = imageDataURL.split(';base64,')[1];
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

            const result   = await response.json();
            let annotation = [];

            result.responses[0].fullTextAnnotation.pages.forEach(page => {
                page.blocks.forEach(block => {
                    block.paragraphs.forEach(paragraph => {
                        paragraph.words.forEach(word => {
                            let text = "";
                            word.symbols.forEach(symbol => {
                                text += symbol.text;
                            })
                            annotation.push({
                                text,
                                bounds: word.boundingBox.vertices
                            });
                        });
                    });
                });
            });

            return {
                fullText: result.responses[0].fullTextAnnotation.text,
                annotation,
                img: imageDataURL
            }
        }
    }
}

export {getScanner};