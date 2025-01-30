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
const signReplace = {
    '･･･':'…',
    '..':'‥',
    '-':'ー',
    '~':'〜',
};
let tokenizer = null;

function replaceSigns(str) {
    const keys = Object.keys(signReplace);
    // Create a regex pattern matching all keys
    const pattern = new RegExp(keys.join('|'), 'g');

    return str.replace(pattern, (match) => {
        return signReplace[match] || match;
    });
}

function checkConjugation(token, nextToken) {
    if (
        ['連用形','連用テ接続','連用タ接続'].includes(token.conjugated_form)
        && nextToken
        && nextToken.word_type == 'KNOWN' 
    ) {
        return true;
    }
    if (token.conjugated_form == '未然形') {
        //Verneinung, Passiv, Kausativ
        if (nextToken && [
            "ない", "ぬ", "ん", "せる", "させる", "れる",
            "られる", "う", "よう", "な", "ざる", "ず"
        ].includes(nextToken.basic_form)) {
            return true;
        }
        // irrealis stands on it's own (stylistic)
    }
    return false;
}

function analyzeText(entry) {
    if(!tokenizer) {
        return;
    }

    entry.analizedText = [];
    const tokens = tokenizer.tokenize(replaceSigns(entry.fullText));
    console.log(tokens);

    let conjugation = null;
    tokens.forEach((token, index) => {
        let analized = null;

        if (conjugation) {
            // we are continuing a conjugation
            analized = conjugation;
            conjugation = null;
            analized.text += token.surface_form;

            switch(token.basic_form) {
                case 'て':
                    if(tokens[index+1] && tokens[index+1].pos == '動詞' && tokens[index+1].pos_detail_1 == '非自立') {
                        // next token is a helper verb
                        analized.details.push('て-form');
                        conjugation = analized;
                        return;
                    }
                    analized.details.push('imperative');
                    break;
                case 'ます':
                    analized.details.push('polite');
                    break;
                case 'ない':
                case 'ぬ':
                case 'ん':
                case 'ざる':
                case 'ず':
                    analized.details.push('negative');
                    break;
                default:
                    analized.details.push('+ ' + token.basic_form);
            }

            // we are still continuing the conjugation
            if (checkConjugation(token, tokens[index+1])) {
                conjugation = analized;
                return;
            }

            // the conjugation has ended
            entry.analizedText.push(analized);
            return
        }

        // prepare ablank text obj
        analized = {
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
            // we are starting a conjugation
            if (checkConjugation(token, tokens[index + 1])) {
                conjugation = analized;
                return;
            }
        }

        // add analyzed text to entry  
        entry.analizedText.push(analized);
    });

    // if we have an unfished conjugation, add it to the analyzed text
    if(conjugation) {
        entry.analizedText.push(conjugation);
    }

    // connect OCR annotations with tokens from kuromoji
    if(Object.hasOwn(entry, 'annotation')) {
        let annotationIndex = 0;
        let textIndex = 0;
        entry.annotation.forEach((annotation) => {
            delete annotation.tokens;
            annotation.text = replaceSigns(annotation.text);
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