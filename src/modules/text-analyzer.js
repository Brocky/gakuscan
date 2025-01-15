const detailTranslation = {
    名詞: 'noun',
    代名詞: 'pronoun',
    固有名詞: 'proper noun',
    人名: 'personal name',
    接尾: 'suffix',
    サ変接続: 'suru-verb',
    接頭詞: 'prefix',

    連体化: 'bound to noun',
    動詞: 'verb',
    接続詞: 'conjunction',

    一般: 'general',
    自立: 'independent',
    非自立: 'dependent',
    基本形: 'basic form',

    助詞: 'particle',
    係助詞: 'binding particle',
    格助詞: 'case-marking particle',
    終助詞: 'sentence ending',
    接続助詞: 'conjunction particle',

    連用形: 'continuative form',
    助動詞: 'auxiliary verb',
    連語: 'compound word',
    記号: 'sign',
    句点: 'period',
    読点: 'comma',
    括弧開: 'opening bracket',
    括弧閉: 'closing bracket',

    形容詞: 'adjective',
    連体詞: 'adnominal adjective',
    感動詞: 'interjection',
    副詞: 'adverb',
    副詞可能: 'adverbial noun',
    副助詞: 'adverbial particle',
    助詞類接続: 'particle-like',
    フィラー: 'filler',
}
let tokenizer = null;

function analyzeText(entry) {
    if(!tokenizer) {
        return;
    }

    entry.analizedText = [];
    const tokens = tokenizer.tokenize(entry.fullText);

    tokens.forEach((token) => {
        let analized = {
            text: token.surface_form,
            details: []
        }

        // add details if known
        if (token.word_type == 'KNOWN') {
            analized.basic_form = token.basic_form; //dictionary form

            ['pos','pos_detail_1','pos_detail_2','pos_detail_3'].forEach((key) => {
                let detail = token[key];
                if (detail == '*') {
                    return;
                }
                
                // try to translate details and add to list
                if(Object.hasOwn(detailTranslation, detail)) {
                    analized.details.push(detailTranslation[detail]);
                } else {
                    analized.details.push(detail);
                }
            });
        }

        entry.analizedText.push(analized);
    });

    // connect OCR annotations with tokens from kuromoji
    if(Object.hasOwn(entry, 'annotation')) {
        let annotationIndex = 0;
        let textIndex = 0;
        entry.annotation.forEach((annotation) => {
            delete annotation.tokens;
            let tokens = entry.analizedText.slice(textIndex);
            for (let i = 0; i < tokens.length; i++) {
                if (tokens[i].text == annotation.text) {

                    if(!Object.hasOwn(tokens[i], 'annotations')) {
                        tokens[i].annotations = [];
                    }
                    if(!Object.hasOwn(annotation, 'tokens')) {
                        annotation.tokens = [];
                    }
                    tokens[i].annotations.push(annotationIndex);
                    annotation.tokens.push(textIndex+i);
                    textIndex = textIndex+i+1;
                    
                    break;
                }
            }
            annotationIndex++;
        });
    }
}

function setTokenizer(newTokenizer) {
    tokenizer = newTokenizer;
}

export {analyzeText, setTokenizer};