import type { IssueOption } from "../types";

export const depositIssue: IssueOption = {
  id: "deposit",
  label: "💰 Security deposit (move-out deadlines)",
  notices: {
    A: {
      en: `Move-out date: [MOVE-OUT DATE].\nAddress: [ADDRESS].\nCondition: I did not receive a list of charges.\nPlease send the list of charges.\n\n`,
      es: `Hola,\n\nMe mudé de [ADDRESS] el [MOVE-OUT DATE].\nNo he recibido una lista detallada de deducciones.\nPor favor envíe la lista detallada.\n\nGracias,\n`,
      hi: `नमस्ते,\n\nमैं [ADDRESS] से [MOVE-OUT DATE] को स्थानांतरित हुआ/हुई।\nमुझे कटौतियों की आइटमाइज़्ड सूची नहीं मिली है।\nकृपया सूची भेजें।\n\nधन्यवाद,\n`,
      pl: `Dzień dobry,\n\nWyprowadziłem/am się z [ADDRESS] dnia [MOVE-OUT DATE].\nNie otrzymałem/am wyszczególnionej listy potrąceń.\nProszę przesłać listę.\n\nDziękuję,\n`,
    },
    B: {
      en: `Move-out date: [MOVE-OUT DATE].\nAddress: [ADDRESS].\nCondition: security deposit not returned.\nPlease return the security deposit and any interest required by local rules.\n\n`,
      es: `Hola,\n\nMe mudé de [ADDRESS] el [MOVE-OUT DATE].\nNo he recibido mi depósito de seguridad.\nPor favor devuelva mi depósito y cualquier interés requerido.\n\nGracias,\n`,
      hi: `नमस्ते,\n\nमैं [ADDRESS] से [MOVE-OUT DATE] को स्थानांतरित हुआ/हुई।\nमुझे मेरा सुरक्षा जमा वापस नहीं मिला है।\nकृपया मेरा जमा और आवश्यक ब्याज वापस करें।\n\nधन्यवाद,\n`,
      pl: `Dzień dobry,\n\nWyprowadziłem/am się z [ADDRESS] dnia [MOVE-OUT DATE].\nNie otrzymałem/am zwrotu kaucji.\nProszę zwrócić kaucję i wymagane odsetki.\n\nDziękuję,\n`,
    },
    C: {
      en: `Move-out date: [MOVE-OUT DATE].\nCondition: deposit and required information not received.\nPlease provide the deposit and required information, with a date for delivery.\nIf it is not provided soon, I will take the next normal step.\n\n`,
      es: `Hola,\n\nMe mudé el [MOVE-OUT DATE].\nTodavía no he recibido mi depósito ni la información requerida.\nSi no lo recibo pronto, tomaré el siguiente paso para hacer valer mis derechos.\n\nGracias,\n`,
      hi: `नमस्ते,\n\nमैं [MOVE-OUT DATE] को स्थानांतरित हुआ/हुई।\nमुझे अभी भी मेरा जमा और आवश्यक जानकारी नहीं मिली है।\nयदि जल्द नहीं मिला, तो मैं अपने अधिकारों की रक्षा के लिए अगला कदम उठाऊंगा/उठाऊंगी।\n\nधन्यवाद,\n`,
      pl: `Dzień dobry,\n\nWyprowadziłem/am się [MOVE-OUT DATE].\nNadal nie otrzymałem/am kaucji i wymaganych informacji.\nJeśli wkrótce nie otrzymam, podejmę następny krok w celu ochrony moich praw.\n\nDziękuję,\n`,
    },
  },
  simple: {
    en: `Move-out date: [MOVE-OUT DATE].\nAddress: [ADDRESS].\nPlease return the security deposit.\n\n`,
  },
};
