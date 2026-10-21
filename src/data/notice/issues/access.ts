import type { IssueOption } from "../types";

/*
 * A building door, fob, or lock does not work, or management is changing them. This is not a
 * lockout by the landlord (that is the lockout notice). The ask that matters most: keep every
 * working key or fob on until each resident has a new one that works.
 */
export const accessIssue: IssueOption = {
  id: "access",
  label: "Doors, fobs, or locks not working",
  notices: {
    A: {
      en: `I live at [ADDRESS].\nSince [START DATE], this does not work: [DOOR / FOB / LOCK].\nPlease tell me in writing when it will be fixed, and how residents can get in until then.\nPlease do not turn off any working key or fob until each resident has a new one that works.\n\n`,
    },
    B: {
      en: `First message date: [DATE OF FIRST MESSAGE].\nCondition today: [DOOR / FOB / LOCK] still does not work.\nPlease give the repair date and a way to get in until then.\n\n`,
    },
    C: {
      en: `Start date: [START DATE].\nFirst message date: [DATE OF FIRST MESSAGE].\nCondition today: [DOOR / FOB / LOCK] still does not work.\nPlease give the repair date today.\nIf there is no repair date, the next normal step is to call 311.\n\n`,
    },
  },
  simple: {
    A: `I live at [ADDRESS].\nThis does not work: [DOOR / FOB / LOCK].\nStart date: [START DATE].\nPlease tell me in writing when it will be fixed.\nPlease tell me how to get in until then.\nPlease keep old keys and fobs working until new ones work.\n\n`,
    B: `I live at [ADDRESS].\nThis still does not work: [DOOR / FOB / LOCK].\nStart date: [START DATE].\nFirst message: [DATE OF FIRST MESSAGE].\nPlease give the repair date.\n\n`,
    C: `I live at [ADDRESS].\nThis still does not work: [DOOR / FOB / LOCK].\nStart date: [START DATE].\nFirst message: [DATE OF FIRST MESSAGE].\nPlease give the repair date today.\nIf there is no repair date, the next normal step is to call 311.\n\n`,
  },
};
