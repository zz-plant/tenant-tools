import type { IssueOption } from "../types";

export const buildingIssue: IssueOption = {
  id: "building",
  label: "🏢 Building-wide message",
  notices: {
    A: {
      en: `We are residents at [ADDRESS].\nCondition: multiple residents report the same issue.\nIssue: [ISSUE].\nStart date: around [START DATE].\nPlease provide the repair plan and expected repair date.\n\nResidents of [ADDRESS]`,
      es: `Hola,\n\nSomos residentes en [ADDRESS].\nVarios residentes informan el mismo problema:\n[ISSUE].\n\nEsto comenzó alrededor de [START DATE].\nPor favor díganos el plan de reparación y la fecha estimada.\n\nGracias,\nResidentes de [ADDRESS]`,
      hi: `नमस्ते,\n\nहम [ADDRESS] के निवासी हैं।\nकई निवासी एक ही समस्या की रिपोर्ट कर रहे हैं:\n[ISSUE].\n\nयह लगभग [START DATE] को शुरू हुआ।\nकृपया मरम्मत की योजना और अपेक्षित तारीख बताएं।\n\nधन्यवाद,\n[ADDRESS] के निवासी`,
      pl: `Dzień dobry,\n\nJesteśmy mieszkańcami [ADDRESS].\nWielu mieszkańców zgłasza ten sam problem:\n[ISSUE].\n\nProblem zaczął się około [START DATE].\nProszę podać plan naprawy i przewidywaną datę.\n\nDziękujemy,\nMieszkańcy [ADDRESS]`,
    },
    B: {
      en: `First message date: [DATE OF FIRST MESSAGE].\nIssue: [ISSUE].\nCondition today: still not fixed.\nPlease confirm the repair date today.\n\nResidents of [ADDRESS]`,
      es: `Hola,\n\nLe escribimos el [DATE OF FIRST MESSAGE] sobre [ISSUE].\nAún no está arreglado.\nPor favor confirme hoy la fecha de reparación.\n\nGracias,\nResidentes de [ADDRESS]`,
      hi: `नमस्ते,\n\nहमने [DATE OF FIRST MESSAGE] को [ISSUE] के बारे में लिखा था।\nयह अभी भी ठीक नहीं हुआ है।\nकृपया आज मरम्मत की तारीख की पुष्टि करें।\n\nधन्यवाद,\n[ADDRESS] के निवासी`,
      pl: `Dzień dobry,\n\nPisaliśmy [DATE OF FIRST MESSAGE] w sprawie [ISSUE].\nNadal nie jest naprawione.\nProsimy dziś potwierdzić datę naprawy.\n\nDziękujemy,\nMieszkańcy [ADDRESS]`,
    },
  },
  simple: {
    en: `We are residents at [ADDRESS].\nBuilding-wide issue: [ISSUE].\nPlease provide the repair plan and date.\n\nResidents of [ADDRESS]`,
  },
};
