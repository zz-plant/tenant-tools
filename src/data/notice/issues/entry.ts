import type { IssueOption } from "../types";

export const entryIssue: IssueOption = {
  id: "entry",
  label: "Entry without notice / access problems",
  notices: {
    A: {
      en: `I live at [ADDRESS].\nEntry without notice happened on [DATE].\nIn Chicago, 48-hour notice is required before entry unless there is an emergency.\nPlease confirm future entry will follow the 48-hour notice rule.\n\n`,
      es: `Hola,\n\nVivo en [ADDRESS].\nEl [DATE], alguien entró / intentó entrar sin aviso.\nEn Chicago, los propietarios deben dar 48 horas de aviso antes de entrar (excepto emergencias).\nPor favor confirme que dará 48 horas de aviso en el futuro.\n\nGracias,\n`,
      hi: `नमस्ते,\n\nमैं [ADDRESS] में रहता/रहती हूँ।\n[DATE] को किसी ने बिना सूचना के मेरे यूनिट में प्रवेश किया / कोशिश की।\nChicago में, आपात स्थिति को छोड़कर, प्रवेश से पहले 48 घंटे की सूचना देनी होती है।\nकृपया पुष्टि करें कि आप भविष्य में 48 घंटे की सूचना देंगे।\n\nधन्यवाद,\n`,
      pl: `Dzień dobry,\n\nMieszkam pod adresem [ADDRESS].\nDnia [DATE] ktoś wszedł / próbował wejść do mojego lokalu bez powiadomienia.\nW Chicago właściciele muszą dać 48 godzin powiadomienia przed wejściem (poza nagłymi sytuacjami).\nProszę potwierdzić, że w przyszłości będzie 48 godzin powiadomienia.\n\nDziękuję,\n`,
    },
    B: {
      en: `First message date: [DATE OF FIRST MESSAGE].\nEntry without notice happened again on [DATE].\nPlease confirm future entry will follow the 48-hour notice rule.\n\n`,
      es: `Hola,\n\nLe escribí el [DATE OF FIRST MESSAGE] sobre el aviso de entrada.\nEsto volvió a ocurrir el [DATE].\nPor favor confirme que seguirá la regla de 48 horas en adelante.\n\nGracias,\n`,
      hi: `नमस्ते,\n\nमैंने [DATE OF FIRST MESSAGE] को प्रवेश सूचना के बारे में लिखा था।\nयह [DATE] को फिर से हुआ।\nकृपया पुष्टि करें कि आगे से आप 48 घंटे की सूचना का पालन करेंगे।\n\nधन्यवाद,\n`,
      pl: `Dzień dobry,\n\nPisałem/am [DATE OF FIRST MESSAGE] w sprawie powiadomienia o wejściu.\nTo zdarzyło się ponownie [DATE].\nProszę potwierdzić, że będzie przestrzegana zasada 48 godzin.\n\nDziękuję,\n`,
    },
    C: {
      en: `Entry without proper notice happened on [DATES].\nPlease confirm in writing that future entry will follow the 48-hour notice rule.\nIf it happens again, I will report the issue for help.\n\n`,
      es: `Hola,\n\nLa entrada sin el aviso adecuado ocurrió el [DATES].\nPor favor confirme por escrito que en el futuro se seguirá la regla de 48 horas.\nSi vuelve a ocurrir, reportaré el problema para obtener ayuda.\n\nGracias,\n`,
      hi: `नमस्ते,\n\nबिना सही सूचना के प्रवेश [DATES] को हुआ।\nकृपया लिखित रूप में पुष्टि करें कि भविष्य में 48 घंटे की सूचना का पालन होगा।\nयदि यह फिर हुआ, तो मैं सहायता के लिए रिपोर्ट करूंगा/करूंगी।\n\nधन्यवाद,\n`,
      pl: `Dzień dobry,\n\nWejście bez właściwego powiadomienia miało miejsce [DATES].\nProszę pisemnie potwierdzić, że w przyszłości będzie przestrzegana zasada 48 godzin.\nJeśli to się powtórzy, zgłoszę sprawę po pomoc.\n\nDziękuję,\n`,
    },
  },
  simple: {
    A: `I live at [ADDRESS].\nEntry without notice happened on [DATE].\nPlease give 48 hours’ notice going forward.\n\n`,
    B: `I live at [ADDRESS].\nEntry without notice happened again on [DATE].\nFirst message: [DATE OF FIRST MESSAGE].\nPlease give 48 hours’ notice before each entry.\nPlease confirm this in writing.\n\n`,
    C: `I live at [ADDRESS].\nEntry without notice happened on [DATE].\nFirst message: [DATE OF FIRST MESSAGE].\nPlease confirm in writing today that you will give 48 hours’ notice before each entry.\nIf it happens again, the next normal step is to call 311.\n\n`,
  },
};
