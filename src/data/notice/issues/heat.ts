import type { IssueOption } from "../types";

export const heatIssue: IssueOption = {
  id: "heat",
  label: "🔥 Heat not working / not warm enough",
  notices: {
    A: {
      en: `I live at [ADDRESS].\nCondition: heat not working / not warm enough.\nStart date: [START DATE].\nToday: [TODAY]. Temperature: [TEMP]°F at [TIME].\nPlease provide the repair date and time.\n\n`,
      es: `Hola,\n\nVivo en [ADDRESS].\nLa calefacción no funciona / no está lo suficientemente caliente.\nEsto comenzó el [START DATE].\nHoy es [TODAY]. La temperatura es [TEMP]°F a las [TIME].\nPor favor dígame cuándo arreglarán la calefacción.\n\nGracias,\n`,
      hi: `नमस्ते,\n\nमैं [ADDRESS] में रहता/रहती हूँ।\nहीट काम नहीं कर रही है / पर्याप्त गर्म नहीं है।\nयह [START DATE] को शुरू हुआ।\nआज [TODAY] है। [TIME] पर तापमान [TEMP]°F है।\nकृपया बताएं कि आप हीट कब ठीक करेंगे।\n\nधन्यवाद,\n`,
      pl: `Dzień dobry,\n\nMieszkam pod adresem [ADDRESS].\nOgrzewanie nie działa / nie grzeje wystarczająco.\nProblem zaczął się [START DATE].\nDziś jest [TODAY]. Temperatura to [TEMP]°F o [TIME].\nProszę powiedzieć, kiedy zostanie naprawione ogrzewanie.\n\nDziękuję,\n`,
    },
    B: {
      en: `First message date: [DATE OF FIRST MESSAGE].\nCondition today: heat still not working.\nPlease provide the repair date and time.\n\n`,
      es: `Hola,\n\nLe escribí el [DATE OF FIRST MESSAGE] sobre la calefacción.\nAún no está arreglada.\nPor favor dígame la fecha y hora de la reparación.\n\nGracias,\n`,
      hi: `नमस्ते,\n\nमैंने [DATE OF FIRST MESSAGE] को हीट के बारे में लिखा था।\nयह अभी भी ठीक नहीं हुआ है।\nकृपया मरम्मत की तारीख और समय बताएं।\n\nधन्यवाद,\n`,
      pl: `Dzień dobry,\n\nPisałem/am do Państwa [DATE OF FIRST MESSAGE] w sprawie ogrzewania.\nNadal nie jest naprawione.\nProszę podać datę i godzinę naprawy.\n\nDziękuję,\n`,
    },
    C: {
      en: `Start date: [START DATE].\nCondition today: heat still not working.\nPlease provide the repair date today.\nIf it is not scheduled soon, I will contact the City (311) for an inspection.\n\n`,
      es: `Hola,\n\nEl problema de la calefacción comenzó el [START DATE] y aún no está arreglado.\nNecesito una fecha de reparación hoy.\nSi no se arregla pronto, contactaré a la Ciudad (311) para una inspección.\n\nGracias,\n`,
      hi: `नमस्ते,\n\nहीट की समस्या [START DATE] को शुरू हुई और अब भी ठीक नहीं हुई है।\nमुझे आज मरम्मत की तारीख चाहिए।\nयदि जल्द ठीक नहीं हुआ, तो मैं City (311) से निरीक्षण के लिए संपर्क करूंगा/करूंगी।\n\nधन्यवाद,\n`,
      pl: `Dzień dobry,\n\nProblem z ogrzewaniem zaczął się [START DATE] i nadal nie jest naprawiony.\nPotrzebuję dziś daty naprawy.\nJeśli nie zostanie szybko naprawione, skontaktuję się z miastem (311) w sprawie inspekcji.\n\nDziękuję,\n`,
    },
  },
  simple: {
    en: `I live at [ADDRESS].\nCondition: heat not working.\nStart date: [START DATE].\nPlease provide the repair date.\n\n`,
  },
};
