import type { IssueOption } from "../types";

/** Trash or recycling service in the building changed or stopped (a locked chute room, moved bins). */
export const trashIssue: IssueOption = {
  id: "trash",
  label: "Trash or recycling changed or not working",
  notices: {
    A: {
      en: `I live at [ADDRESS].\nSince [START DATE], trash service in the building changed.\nWhat changed: [TRASH CHANGE].\nPlease tell me in writing when normal trash service will return.\n\n`,
    },
    B: {
      en: `First message date: [DATE OF FIRST MESSAGE].\nCondition today: trash service is still not back to normal.\nWhat changed: [TRASH CHANGE].\nPlease give the date it will be fixed.\n\n`,
    },
    C: {
      en: `Start date: [START DATE].\nFirst message date: [DATE OF FIRST MESSAGE].\nCondition today: trash service is still not back to normal.\nPlease give the date it will be fixed.\nIf there is no date, the next normal step is to contact 311 or the ward office.\n\n`,
    },
  },
  simple: {
    A: `I live at [ADDRESS].\nTrash service changed on [START DATE].\nWhat changed: [TRASH CHANGE].\nPlease tell me in writing when it will be normal again.\n\n`,
    B: `I live at [ADDRESS].\nTrash service is still not normal.\nStart date: [START DATE].\nFirst message: [DATE OF FIRST MESSAGE].\nPlease give the date it will be fixed.\n\n`,
    C: `I live at [ADDRESS].\nTrash service is still not normal.\nStart date: [START DATE].\nFirst message: [DATE OF FIRST MESSAGE].\nPlease give the date it will be fixed.\nIf there is no date, the next normal step is to contact 311 or the ward office.\n\n`,
  },
};
