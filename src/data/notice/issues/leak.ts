import type { IssueOption } from "../types";

export const leakIssue: IssueOption = {
  id: "leak",
  label: "💧 Water leak / ceiling leak / water damage",
  notices: {
    A: {
      en: `I live at [ADDRESS].\nCondition: water leak / water coming in at [LOCATION].\nStart date: [START DATE].\nPlease provide the repair date and time.\nI am attaching photos/videos.\n\n`,
      es: `Hola,\n\nVivo en [ADDRESS].\nHay una fuga de agua / entra agua en [LOCATION].\nEsto comenzó el [START DATE].\nPor favor dígame cuándo lo arreglarán.\nAdjunto fotos/videos.\n\nGracias,\n`,
      hi: `नमस्ते,\n\nमैं [ADDRESS] में रहता/रहती हूँ।\n[LOCATION] पर पानी का रिसाव / पानी आ रहा है।\nयह [START DATE] को शुरू हुआ।\nकृपया बताएं कि आप इसे कब ठीक करेंगे।\nमैं फोटो/वीडियो संलग्न कर रहा/रही हूँ।\n\nधन्यवाद,\n`,
      pl: `Dzień dobry,\n\nMieszkam pod adresem [ADDRESS].\nWystępuje przeciek wody / woda wchodzi w [LOCATION].\nProblem zaczął się [START DATE].\nProszę powiedzieć, kiedy to zostanie naprawione.\nZałączam zdjęcia/wideo.\n\nDziękuję,\n`,
    },
    B: {
      en: `First message date: [DATE OF FIRST MESSAGE].\nCondition today: water leak still happening / not fixed.\nPlease provide the repair date and time.\n\n`,
      es: `Hola,\n\nLe escribí el [DATE OF FIRST MESSAGE] sobre la fuga de agua.\nSigue ocurriendo / no está arreglada.\nPor favor dígame la fecha y hora de la reparación.\n\nGracias,\n`,
      hi: `नमस्ते,\n\nमैंने [DATE OF FIRST MESSAGE] को पानी के रिसाव के बारे में लिखा था।\nयह अभी भी हो रहा है / ठीक नहीं हुआ है।\nकृपया मरम्मत की तारीख और समय बताएं।\n\nधन्यवाद,\n`,
      pl: `Dzień dobry,\n\nPisałem/am do Państwa [DATE OF FIRST MESSAGE] w sprawie przecieku.\nProblem nadal występuje / nie jest naprawiony.\nProszę podać datę i godzinę naprawy.\n\nDziękuję,\n`,
    },
    C: {
      en: `Start date: [START DATE].\nCondition today: water leak still not fixed.\nPlease confirm the repair date today.\nIf it is not scheduled soon, I will contact the City (311) to report the condition.\n\n`,
      es: `Hola,\n\nLa fuga de agua comenzó el [START DATE] y aún no está arreglada.\nPor favor confirme la fecha de reparación hoy.\nSi no se arregla pronto, contactaré a la Ciudad (311) para reportarlo.\n\nGracias,\n`,
      hi: `नमस्ते,\n\nपानी का रिसाव [START DATE] को शुरू हुआ और अब भी ठीक नहीं हुआ है।\nकृपया आज मरम्मत की तारीख की पुष्टि करें।\nयदि जल्द ठीक नहीं हुआ, तो मैं City (311) को रिपोर्ट करूंगा/करूंगी।\n\nधन्यवाद,\n`,
      pl: `Dzień dobry,\n\nPrzeciek wody zaczął się [START DATE] i nadal nie jest naprawiony.\nProszę dziś potwierdzić datę naprawy.\nJeśli nie zostanie szybko naprawione, skontaktuję się z miastem (311).\n\nDziękuję,\n`,
    },
  },
  simple: {
    en: `I live at [ADDRESS].\nCondition: water leak at [LOCATION].\nStart date: [START DATE].\nPlease provide the repair date.\n\n`,
  },
};
