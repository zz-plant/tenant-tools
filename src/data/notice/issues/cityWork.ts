import type { IssueOption } from "../types";

/*
 * City work (an alley, street, or sidewalk project) blocks part of the building. The ward office
 * runs or tracks these projects, so it is the first place to ask for help, not a last step.
 * The notice asks management for a written answer, not a fixed credit: a rent credit is a legal
 * question for a tenant group or legal aid.
 */
export const cityWorkIssue: IssueOption = {
  id: "city-work",
  label: "City work blocks part of the building",
  notices: {
    A: {
      en: `I live at [ADDRESS].\nCity work near the building started on [START DATE].\nBecause of this work, I cannot use [WHAT I CANNOT USE].\nPlease tell me in writing how I can use it during the work, or what credit will be given for the days I cannot use it.\n\n`,
    },
    B: {
      en: `First message date: [DATE OF FIRST MESSAGE].\nCondition today: I still cannot use [WHAT I CANNOT USE] because of the City work.\nPlease answer my first message in writing.\n\n`,
    },
    C: {
      en: `Start date: [START DATE].\nFirst message date: [DATE OF FIRST MESSAGE].\nCondition today: I still cannot use [WHAT I CANNOT USE].\nI have not received a written answer.\nPlease answer in writing.\nIf there is no answer, the next normal step is to ask the ward office for help.\n\n`,
    },
  },
  simple: {
    A: `I live at [ADDRESS].\nCity work started on [START DATE].\nI cannot use [WHAT I CANNOT USE].\nPlease tell me in writing how I can use it.\nOr tell me what credit I will get.\n\n`,
    B: `I live at [ADDRESS].\nCity work started on [START DATE].\nI still cannot use [WHAT I CANNOT USE].\nFirst message: [DATE OF FIRST MESSAGE].\nPlease answer in writing.\n\n`,
    C: `I live at [ADDRESS].\nCity work started on [START DATE].\nI still cannot use [WHAT I CANNOT USE].\nFirst message: [DATE OF FIRST MESSAGE].\nI have no written answer.\nPlease answer in writing.\nIf there is no answer, the next normal step is to ask the ward office for help.\n\n`,
  },
};
