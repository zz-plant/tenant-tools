import type { IssueOption } from "../types";

export const commonIssue: IssueOption = {
  id: "common",
  label: "Elevator / common areas",
  notices: {
    A: {
      en: `I live at [ADDRESS].\nCondition: problem with [ELEVATOR / GARAGE DOOR / HALL LIGHTS / TRASH ROOM].\nStart date: [START DATE].\nPlease provide the repair date and time.\n\n`,
      es: `Hola,\n\nVivo en [ADDRESS].\nHay un problema con [ELEVATOR / GARAGE DOOR / HALL LIGHTS / TRASH ROOM].\nEsto comenzó el [START DATE].\nPor favor dígame cuándo se reparará.\n\nGracias,\n`,
      hi: `नमस्ते,\n\nमैं [ADDRESS] में रहता/रहती हूँ।\n[ELEVATOR / GARAGE DOOR / HALL LIGHTS / TRASH ROOM] में समस्या है।\nयह [START DATE] को शुरू हुई।\nकृपया बताएं कि इसे कब ठीक किया जाएगा।\n\nधन्यवाद,\n`,
      pl: `Dzień dobry,\n\nMieszkam pod adresem [ADDRESS].\nJest problem z [ELEVATOR / GARAGE DOOR / HALL LIGHTS / TRASH ROOM].\nProblem zaczął się [START DATE].\nProszę powiedzieć, kiedy zostanie naprawione.\n\nDziękuję,\n`,
    },
    B: {
      en: `First message date: [DATE OF FIRST MESSAGE].\nCondition today: common area issue still not fixed.\nPlease provide the repair date.\n\n`,
      es: `Hola,\n\nLe escribí el [DATE OF FIRST MESSAGE] sobre el problema en el área común.\nAún no está arreglado.\nPor favor dígame la fecha de reparación.\n\nGracias,\n`,
      hi: `नमस्ते,\n\nमैंने [DATE OF FIRST MESSAGE] को साझा क्षेत्र की समस्या के बारे में लिखा था।\nयह अभी भी ठीक नहीं है।\nकृपया मरम्मत की तारीख बताएं।\n\nधन्यवाद,\n`,
      pl: `Dzień dobry,\n\nPisałem/am do Państwa [DATE OF FIRST MESSAGE] w sprawie części wspólnych.\nNadal nie jest naprawione.\nProszę podać datę naprawy.\n\nDziękuję,\n`,
    },
    C: {
      en: `Start date: [START DATE].\nCondition today: common area issue still not fixed.\nPlease confirm the repair date today.\nIf there is still no repair date, the next normal step is to contact 311.\n\n`,
      es: `Hola,\n\nEl problema en el área común comenzó el [START DATE] y aún no está arreglado.\nPor favor confirme la fecha de reparación hoy.\nSi no se atiende pronto, contactaré a la Ciudad (311) para reportarlo.\n\nGracias,\n`,
      hi: `नमस्ते,\n\nसाझा क्षेत्र की समस्या [START DATE] को शुरू हुई और अब भी ठीक नहीं है।\nकृपया आज मरम्मत की तारीख की पुष्टि करें।\nयदि जल्द समाधान नहीं हुआ, तो मैं City (311) को रिपोर्ट करूंगा/करूंगी।\n\nधन्यवाद,\n`,
      pl: `Dzień dobry,\n\nProblem w częściach wspólnych zaczął się [START DATE] i nadal nie jest naprawiony.\nProszę dziś potwierdzić datę naprawy.\nJeśli nie zostanie szybko rozwiązany, skontaktuję się z miastem (311).\n\nDziękuję,\n`,
    },
  },
  simple: {
    A: `I live at [ADDRESS].\nCondition: problem with a common area.\nStart date: [START DATE].\nPlease provide the repair date.\n\n`,
    B: `I live at [ADDRESS].\nCondition: problem with a common area.\nIt is still not fixed.\nStart date: [START DATE].\nFirst message: [DATE OF FIRST MESSAGE].\nPlease provide the repair date.\n\n`,
    C: `I live at [ADDRESS].\nCondition: problem with a common area.\nIt is still not fixed.\nStart date: [START DATE].\nFirst message: [DATE OF FIRST MESSAGE].\nPlease provide the repair date today.\nIf there is no repair date, the next normal step is to call 311 for an inspection.\n\n`,
  },
};
