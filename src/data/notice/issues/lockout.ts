import type { IssueOption } from "../types";

export const lockoutIssue: IssueOption = {
  id: "lockout",
  label: "Lockout / utility shutoff risk",
  notices: {
    A: {
      en: `I live at [ADDRESS].\nStatement received: [LOCK ME OUT / SHUT OFF UTILITIES] on [DATE].\nThat is not allowed in Chicago without a court process.\nPlease confirm in writing that you will not lock me out or shut off utilities.\n\n`,
      es: `Hola,\n\nVivo en [ADDRESS].\nUsted dijo que podría [LOCK ME OUT / SHUT OFF UTILITIES] el [DATE].\nEso no está permitido en Chicago sin un proceso judicial.\nPor favor confirme por escrito que no me cerrará el acceso ni cortará los servicios.\n\nGracias,\n`,
      hi: `नमस्ते,\n\nमैं [ADDRESS] में रहता/रहती हूँ।\nआपने कहा कि आप [LOCK ME OUT / SHUT OFF UTILITIES] [DATE] को कर सकते हैं।\nChicago में अदालत की प्रक्रिया के बिना यह अनुमति नहीं है।\nकृपया लिखित में पुष्टि करें कि आप मुझे बाहर नहीं करेंगे या यूटिलिटी बंद नहीं करेंगे।\n\nधन्यवाद,\n`,
      pl: `Dzień dobry,\n\nMieszkam pod adresem [ADDRESS].\nPowiedzieli Państwo, że mogą Państwo [LOCK ME OUT / SHUT OFF UTILITIES] dnia [DATE].\nW Chicago jest to niedozwolone bez postępowania sądowego.\nProszę pisemnie potwierdzić, że nie zostanę wyrzucony/a ani nie zostaną odcięte media.\n\nDziękuję,\n`,
    },
    B: {
      en: `Utilities were shut off / service was interrupted on [DATE/TIME].\nPlease restore service and confirm the restoration date and time.\n\n`,
      es: `Hola,\n\nLos servicios fueron cortados / interrumpidos el [DATE/TIME].\nPor favor restablezca el servicio de inmediato y confirme cuándo se restablecerá.\n\n`,
      hi: `नमस्ते,\n\n[DATE/TIME] को यूटिलिटी बंद कर दी गई / सेवा बाधित हुई।\nकृपया तुरंत सेवा बहाल करें और बताएं कि यह कब बहाल होगी।\n\n`,
      pl: `Dzień dobry,\n\nMedia zostały odcięte / usługa została przerwana [DATE/TIME].\nProszę natychmiast przywrócić usługę i potwierdzić, kiedy zostanie przywrócona.\n\n`,
    },
    C: {
      en: `I live at [ADDRESS].\nStatement received: [LOCK ME OUT / SHUT OFF UTILITIES] on [DATE].\nFirst message date: [DATE OF FIRST MESSAGE].\nI have not received written confirmation.\nPlease confirm in writing today that you will not lock me out or shut off utilities.\nIf there is no written confirmation, the next normal step is to ask a tenant group or legal aid for help.\n\n`,
      es: `Hola,\n\nVivo en [ADDRESS].\nEl [DATE] recibí esta declaración: [LOCK ME OUT / SHUT OFF UTILITIES].\nLe escribí el [DATE OF FIRST MESSAGE].\nTodavía no he recibido una confirmación por escrito.\nPor favor confirme hoy por escrito que no me cerrará el acceso ni cortará los servicios.\nSi no recibo una confirmación por escrito, el siguiente paso habitual es pedir ayuda a un grupo de inquilinos o a asistencia legal.\n\nGracias,\n`,
      hi: `नमस्ते,\n\nमैं [ADDRESS] में रहता/रहती हूँ।\n[DATE] को मुझे यह सूचना मिली: [LOCK ME OUT / SHUT OFF UTILITIES]।\nमैंने [DATE OF FIRST MESSAGE] को आपको लिखा था।\nमुझे अभी तक लिखित पुष्टि नहीं मिली है।\nकृपया आज लिखित में पुष्टि करें कि आप मुझे बाहर नहीं करेंगे या यूटिलिटी बंद नहीं करेंगे।\nयदि लिखित पुष्टि नहीं मिलती है, तो अगला सामान्य कदम किसी किरायेदार समूह या कानूनी सहायता से मदद लेना है।\n\nधन्यवाद,\n`,
      pl: `Dzień dobry,\n\nMieszkam pod adresem [ADDRESS].\nDnia [DATE] otrzymałem/am informację: [LOCK ME OUT / SHUT OFF UTILITIES].\nPisałem/am do Państwa [DATE OF FIRST MESSAGE].\nNadal nie otrzymałem/am pisemnego potwierdzenia.\nProszę dziś pisemnie potwierdzić, że nie zostanę wyrzucony/a ani nie zostaną odcięte media.\nJeśli nie otrzymam pisemnego potwierdzenia, następnym standardowym krokiem jest zwrócenie się o pomoc do organizacji lokatorskiej lub pomocy prawnej.\n\nDziękuję,\n`,
    },
  },
  simple: {
    A: `Please confirm in writing that you will not lock me out or shut off utilities.\n\n`,
    B: `I live at [ADDRESS].\nStatement received on [DATE]: [LOCK ME OUT / SHUT OFF UTILITIES].\nFirst message: [DATE OF FIRST MESSAGE].\nI have not received a written reply.\nPlease confirm in writing that you will not lock me out or shut off utilities.\n\n`,
    C: `I live at [ADDRESS].\nStatement received on [DATE]: [LOCK ME OUT / SHUT OFF UTILITIES].\nFirst message: [DATE OF FIRST MESSAGE].\nPlease confirm in writing today that you will not lock me out or shut off utilities.\nIf there is no reply, the next normal step is to ask a tenant group or legal aid.\n\n`,
  },
};
