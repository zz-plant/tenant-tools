import type { IssueOption } from "../types";

/** Building work (cleaning, repairs, contractors) damaged something the resident owns. Facts and dates only. */
export const damageIssue: IssueOption = {
  id: "damage",
  label: "Damage from building work",
  notices: {
    A: {
      en: `I live at [ADDRESS].\nOn [START DATE], building work caused damage.\nWhat was damaged: [WHAT WAS DAMAGED].\nPhotos: [PHOTO/VIDEO].\nPlease tell me in writing how this will be fixed or paid for.\n\n`,
    },
    B: {
      en: `First message date: [DATE OF FIRST MESSAGE].\nThe damage from building work on [START DATE] is not fixed or paid for.\nWhat was damaged: [WHAT WAS DAMAGED].\nPlease answer my first message in writing.\n\n`,
    },
    C: {
      en: `Date of the work: [START DATE].\nFirst message date: [DATE OF FIRST MESSAGE].\nThe damage is still not fixed or paid for.\nI have not received a written answer.\nPlease answer in writing.\nIf there is no answer, the next normal step is to ask a tenant group or legal aid for advice.\n\n`,
    },
  },
  simple: {
    A: `I live at [ADDRESS].\nBuilding work on [START DATE] caused damage.\nWhat was damaged: [WHAT WAS DAMAGED].\nPlease tell me in writing how it will be fixed or paid for.\n\n`,
    B: `I live at [ADDRESS].\nThe damage from [START DATE] is not fixed.\nFirst message: [DATE OF FIRST MESSAGE].\nPlease answer in writing.\n\n`,
    C: `I live at [ADDRESS].\nThe damage from [START DATE] is not fixed.\nFirst message: [DATE OF FIRST MESSAGE].\nI have no written answer.\nPlease answer in writing.\nIf there is no answer, the next normal step is to ask a tenant group or legal aid for advice.\n\n`,
  },
};
