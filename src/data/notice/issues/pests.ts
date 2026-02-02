import type { IssueOption } from "../types";

export const pestsIssue: IssueOption = {
  id: "pests",
  label: "🪳 Pests (roaches / rats / bedbugs)",
  notices: {
    A: {
      en: `I live at [ADDRESS].\nCondition: [ROACHES/RATS/BEDBUGS] seen.\nDate seen: [START DATE].\nCondition today: still happening.\nPlease schedule pest treatment and provide the date and time.\nI can share photos if needed.\n\n`,
      es: `Hola,\n\nVivo en [ADDRESS].\nVi [ROACHES/RATS/BEDBUGS] el [START DATE].\nEl problema sigue ocurriendo.\nPor favor programe el tratamiento y dígame la fecha y hora.\nPuedo compartir fotos si es necesario.\n\nGracias,\n`,
      hi: `नमस्ते,\n\nमैं [ADDRESS] में रहता/रहती हूँ।\nमैंने [START DATE] को [ROACHES/RATS/BEDBUGS] देखा।\nसमस्या अभी भी हो रही है।\nकृपया कीट उपचार शेड्यूल करें और तारीख/समय बताएं।\nज़रूरत हो तो मैं फोटो साझा कर सकता/सकती हूँ।\n\nधन्यवाद,\n`,
      pl: `Dzień dobry,\n\nMieszkam pod adresem [ADDRESS].\nWidziałem/am [ROACHES/RATS/BEDBUGS] dnia [START DATE].\nProblem nadal występuje.\nProszę zaplanować zabieg i podać datę oraz godzinę.\nMogę udostępnić zdjęcia, jeśli potrzeba.\n\nDziękuję,\n`,
    },
    B: {
      en: `First message date: [DATE OF FIRST MESSAGE].\nCondition today: pest problem still not fixed.\nPlease provide the treatment date and time.\n\n`,
      es: `Hola,\n\nLe escribí el [DATE OF FIRST MESSAGE] sobre plagas.\nEl problema aún no está resuelto.\nPor favor dígame la fecha y hora del tratamiento.\n\nGracias,\n`,
      hi: `नमस्ते,\n\nमैंने [DATE OF FIRST MESSAGE] को कीटों के बारे में लिखा था।\nसमस्या अभी भी ठीक नहीं हुई है।\nकृपया उपचार की तारीख और समय बताएं।\n\nधन्यवाद,\n`,
      pl: `Dzień dobry,\n\nPisałem/am [DATE OF FIRST MESSAGE] w sprawie szkodników.\nProblem nadal nie jest rozwiązany.\nProszę podać datę i godzinę zabiegu.\n\nDziękuję,\n`,
    },
    C: {
      en: `Start date: [START DATE].\nCondition today: pest problem still not fixed.\nPlease confirm the treatment date today.\nIf it is not scheduled soon, I will contact the City (311).\n\n`,
      es: `Hola,\n\nEl problema de plagas comenzó el [START DATE] y aún no está resuelto.\nPor favor confirme hoy la fecha del tratamiento.\nSi no se programa pronto, contactaré a la Ciudad (311).\n\nGracias,\n`,
      hi: `नमस्ते,\n\nकीटों की समस्या [START DATE] को शुरू हुई और अब भी ठीक नहीं हुई है।\nकृपया आज उपचार की तारीख की पुष्टि करें।\nयदि जल्द शेड्यूल नहीं हुआ, तो मैं City (311) से संपर्क करूंगा/करूंगी।\n\nधन्यवाद,\n`,
      pl: `Dzień dobry,\n\nProblem ze szkodnikami zaczął się [START DATE] i nadal nie jest rozwiązany.\nProszę dziś potwierdzić datę zabiegu.\nJeśli wkrótce nie zostanie zaplanowany, skontaktuję się z miastem (311).\n\nDziękuję,\n`,
    },
  },
  simple: {
    en: `I live at [ADDRESS].\nCondition: pests seen.\nDate seen: [START DATE].\nPlease schedule treatment and provide the date.\n\n`,
  },
};
