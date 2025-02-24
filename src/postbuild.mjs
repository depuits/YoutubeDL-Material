import fs from 'fs-extra';
import path from 'path';
import xliffToJSON from 'xliff-to-json';

async function recFindByExt(base,ext,files,result)
{
    files = files || (await fs.readdir(base))
    result = result || []

    for (const file of files) {
        var newbase = path.join(base,file)
        if ( (await fs.stat(newbase)).isDirectory() )
        {
            result = await recFindByExt(newbase,ext,await fs.readdir(newbase),result)
        }
        else
        {
            if ( file.substr(-1*(ext.length+1)) == '.' + ext )
            {
                result.push(newbase)
            }
        }
    }
    return result
}

// outputs array of supported locales
async function createLocalizationJSON() {
    xliffToJSON.convert('src/assets/i18n');
    const files = await recFindByExt(path.join('src', 'assets', 'i18n'), 'json');
    const locales = [];

    for (let i = 0; i < files.length; i++) {
        const file = path.basename(files[i]);
        const file_parts = file.split('.');
        locales.push(file_parts[1]);
    }

    fs.unlinkSync('src/assets/i18n/messages.en.json');
    fs.writeJSONSync('src/assets/i18n/supported_locales.json', {supported_locales: locales});
}

createLocalizationJSON();