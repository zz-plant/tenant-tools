import type { IssueOption } from "../types";

export const noTimelineIssue: IssueOption = {
  id: "no-timeline",
  label: "No repair date shared",
  notices: {
    A: {
      en: `Please provide the repair date.\nIf there is no date, provide the next step and the exact day it will happen.\n\n`,
      es: `Hola,\n\nGracias por su mensaje.\nPor favor dígame la fecha de reparación.\nSi no tiene una fecha, por favor dígame el siguiente paso y el día exacto en que ocurrirá.\n\nGracias,\n`,
      hi: `नमस्ते,\n\nआपके संदेश के लिए धन्यवाद।\nकृपया मरम्मत की तारीख बताएं।\nयदि तारीख नहीं है, तो कृपया अगला कदम और सटीक दिन बताएं।\n\nधन्यवाद,\n`,
      pl: `Dzień dobry,\n\nDziękuję za wiadomość.\nProszę podać datę naprawy.\nJeśli nie ma daty, proszę podać następny krok i dokładny dzień.\n\nDziękuję,\n`,
    },
    B: {
      en: `I still do not have a repair date.\nStart date: [START DATE].\nCondition today: still not fixed.\nPlease reply with a date today.\n\n`,
      es: `Hola,\n\nTodavía no tengo una fecha de reparación.\nEl problema comenzó el [START DATE] y aún no está arreglado.\nPor favor responda con una fecha hoy.\n\nGracias,\n`,
      hi: `नमस्ते,\n\nमुझे अभी भी मरम्मत की तारीख नहीं मिली है।\nसमस्या [START DATE] को शुरू हुई और अब भी ठीक नहीं हुई है।\nकृपया आज तारीख के साथ जवाब दें।\n\nधन्यवाद,\n`,
      pl: `Dzień dobry,\n\nNadal nie mam daty naprawy.\nProblem zaczął się [START DATE] i nadal nie jest naprawiony.\nProszę dziś odpowiedzieć z datą.\n\nDziękuję,\n`,
    },
    C: {
      en: `First message date: [DATE OF FIRST MESSAGE].\nStart date: [START DATE].\nCondition today: still not fixed. I still do not have a repair date.\nPlease confirm the repair date today.\nIf there is still no repair date, the next normal step is to contact 311.\n\n`,
      es: `Hola,\n\nLe escribí el [DATE OF FIRST MESSAGE] para pedir una fecha de reparación.\nEl problema comenzó el [START DATE] y aún no está arreglado.\nTodavía no tengo una fecha de reparación.\nPor favor confirme hoy la fecha de reparación.\nSi todavía no hay una fecha de reparación, el siguiente paso habitual es contactar al 311.\n\nGracias,\n`,
      pl: `Dzień dobry,\n\nPisałem/am do Państwa [DATE OF FIRST MESSAGE] z prośbą o datę naprawy.\nProblem zaczął się [START DATE] i nadal nie jest naprawiony.\nNadal nie mam daty naprawy.\nProszę dziś potwierdzić datę naprawy.\nJeśli nadal nie będzie daty naprawy, następnym standardowym krokiem jest kontakt z miastem (311).\n\nDziękuję,\n`,
    },
  },
  simple: {
    A: `Please provide the repair date.\nIf there is no date, provide the next step and the exact day.\n\n`,
    B: `I live at [ADDRESS].\nThe problem started on [START DATE].\nI asked for a repair date on [DATE OF FIRST MESSAGE].\nI still do not have a repair date.\nPlease provide the repair date.\nIf there is no date, provide the next step and the exact day.\n\n`,
    C: `I live at [ADDRESS].\nThe problem started on [START DATE].\nI asked for a repair date on [DATE OF FIRST MESSAGE].\nI still do not have a repair date.\nPlease provide the repair date today.\nIf there is no repair date, the next normal step is to call 311 for an inspection.\n\n`,
  },
};
