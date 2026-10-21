import type { IssueOption } from "../types";

/** A paid parking space or garage the resident cannot use. The notice asks; it never deducts. */
export const parkingIssue: IssueOption = {
  id: "parking",
  label: "Paid parking I cannot use",
  notices: {
    A: {
      en: `I live at [ADDRESS].\nI pay for a parking space in the building.\nSince [START DATE], I cannot use it.\nReason: [REASON].\nPlease tell me in writing when I can use it again, or what credit will be given for the days I cannot use it.\n\n`,
    },
    B: {
      en: `First message date: [DATE OF FIRST MESSAGE].\nCondition today: I still cannot use my parking space.\nReason: [REASON].\nPlease answer my first message in writing.\n\n`,
    },
    C: {
      en: `Start date: [START DATE].\nFirst message date: [DATE OF FIRST MESSAGE].\nCondition today: I still cannot use my parking space.\nI have not received a written answer.\nPlease answer in writing.\nIf there is no answer, the next normal step is to ask a tenant group or legal aid for advice.\n\n`,
    },
  },
  simple: {
    A: `I live at [ADDRESS].\nI pay for parking here.\nSince [START DATE], I cannot use it.\nReason: [REASON].\nPlease tell me in writing when I can use it.\nOr tell me what credit I will get.\n\n`,
    B: `I live at [ADDRESS].\nI still cannot use my parking.\nStart date: [START DATE].\nFirst message: [DATE OF FIRST MESSAGE].\nPlease answer in writing.\n\n`,
    C: `I live at [ADDRESS].\nI still cannot use my parking.\nStart date: [START DATE].\nFirst message: [DATE OF FIRST MESSAGE].\nI have no written answer.\nPlease answer in writing.\nIf there is no answer, the next normal step is to ask a tenant group or legal aid for advice.\n\n`,
  },
};
