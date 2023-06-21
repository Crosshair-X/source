from openpyxl import load_workbook
import json

lastRow = 250

workbook = load_workbook(filename="translations.xlsx", data_only=True)

sheet = workbook.active


languages = ['en','de','zh-CN','pt','es','ru', 'cs-CZ', 'sv', 'tr']

for languageIndex in range (0, len(languages)):
    currentLanguage = {"translation": {}}

    for i in range (2,lastRow + 1):
        currentLanguage["translation"][sheet["A" + str(i)].value] = sheet[chr(ord('B') + languageIndex) + str(i)].value
        
    languageStr = json.dumps(currentLanguage, indent=4,ensure_ascii=False).encode('utf8')

    f = open("../../src/translations/" + languages[languageIndex] + ".json", "wb")
    f.write(languageStr)
    f.close()
