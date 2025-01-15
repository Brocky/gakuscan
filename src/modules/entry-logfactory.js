function fromGCloudVision(response, image, tokenizer) {
    let annotation = [];

    response.fullTextAnnotation.pages.forEach(page => {
        page.blocks.forEach(block => {
            block.paragraphs.forEach(paragraph => {
                paragraph.words.forEach(word => {
                    let text = "";
                    word.symbols.forEach(symbol => {
                        text += symbol.text;
                    })
                    const bounds = {
                        x: word.boundingBox.vertices[0].x / image.selection.width,
                        y: word.boundingBox.vertices[0].y / image.selection.height,
                        w: (word.boundingBox.vertices[1].x - word.boundingBox.vertices[0].x) / image.selection.width,
                        h: (word.boundingBox.vertices[2].y - word.boundingBox.vertices[0].y) / image.selection.height
                    }

                    annotation.push({
                        text,
                        boundVerticies: word.boundingBox.vertices,
                        bounds
                    });
                });
            });
        });
    });

    return {
        fullText: response.fullTextAnnotation.text,
        annotation,
        image
    }
}

export {fromGCloudVision};