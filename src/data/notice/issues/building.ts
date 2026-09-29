import type { IssueOption } from "../types";

export const buildingIssue: IssueOption = {
  id: "building",
  label: "Building-wide message",
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
    C: {
      en: `First message date: [DATE OF FIRST MESSAGE].\nIssue: [ISSUE].\nStart date: around [START DATE].\nCondition today: still not fixed. Multiple residents still report this issue.\nPlease confirm the repair plan and repair date today.\nIf there is still no repair date, the next normal step is to contact 311.\n\nResidents of [ADDRESS]`,
      es: `Hola,\n\nLe escribimos el [DATE OF FIRST MESSAGE] sobre [ISSUE].\nEl problema comenzó alrededor de [START DATE] y aún no está arreglado.\nVarios residentes todavía informan este problema.\nPor favor confirme hoy el plan de reparación y la fecha de reparación.\nSi todavía no hay una fecha de reparación, el siguiente paso habitual es contactar al 311.\n\nGracias,\nResidentes de [ADDRESS]`,
      hi: `नमस्ते,\n\nहमने [DATE OF FIRST MESSAGE] को [ISSUE] के बारे में लिखा था।\nयह समस्या लगभग [START DATE] को शुरू हुई और अब भी ठीक नहीं हुई है।\nकई निवासी अभी भी इस समस्या की रिपोर्ट कर रहे हैं।\nकृपया आज मरम्मत की योजना और मरम्मत की तारीख की पुष्टि करें।\nयदि अभी भी मरम्मत की तारीख नहीं मिलती है, तो अगला सामान्य कदम 311 से संपर्क करना है।\n\nधन्यवाद,\n[ADDRESS] के निवासी`,
      pl: `Dzień dobry,\n\nPisaliśmy [DATE OF FIRST MESSAGE] w sprawie [ISSUE].\nProblem zaczął się około [START DATE] i nadal nie jest naprawiony.\nWielu mieszkańców nadal zgłasza ten problem.\nProsimy dziś potwierdzić plan naprawy i datę naprawy.\nJeśli nadal nie będzie daty naprawy, następnym standardowym krokiem jest kontakt z miastem (311).\n\nDziękujemy,\nMieszkańcy [ADDRESS]`,
    },
  },
  simple: {
    A: `We are residents at [ADDRESS].\nBuilding-wide issue: [ISSUE].\nPlease provide the repair plan and date.\n\nResidents of [ADDRESS]`,
    B: `We are residents at [ADDRESS].\nBuilding-wide issue: [ISSUE].\nIt is still not fixed.\nStart date: [START DATE].\nFirst message: [DATE OF FIRST MESSAGE].\nPlease provide the repair plan and date.\n\nResidents of [ADDRESS]`,
    C: `We are residents at [ADDRESS].\nBuilding-wide issue: [ISSUE].\nIt is still not fixed.\nStart date: [START DATE].\nFirst message: [DATE OF FIRST MESSAGE].\nPlease provide the repair plan and date today.\nIf there is no repair date, the next normal step is to call 311 for an inspection.\n\nResidents of [ADDRESS]`,
  },
};
