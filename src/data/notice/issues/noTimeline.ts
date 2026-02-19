import type { IssueOption } from "../types";

export const noTimelineIssue: IssueOption = {
  id: "no-timeline",
  label: "🧾 No repair date shared",
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
  },
  simple: {
    en: `Please provide the repair date.\nIf there is no date, provide the next step and the exact day.\n\n`,
  },
};
