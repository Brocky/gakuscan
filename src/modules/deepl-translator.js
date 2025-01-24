function getTranslator(apiKey) {
    return {
        _apiKey: apiKey,
        translate: async function(text, target_lang = 'EN') {
            const response = await fetch(
                'https://api-free.deepl.com/v2/translate',
                {
                    method:'POST',
                    headers: {
                        "Authorization": `DeepL-Auth-Key ${this._apiKey}`
                    },
                    body: JSON.stringify({
                        "text":[text],
                        target_lang,
                        source_lang: 'JA'
                    })
                }
            );

            if(!response.ok) {
                throw new Error(response.text);
            }

            const result = await response.json();

            console.log(result);
        }
    }
}

export {getTranslator};