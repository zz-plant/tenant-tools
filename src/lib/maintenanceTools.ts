import { lintVerySimpleEnglish } from "./copyLint";

export type AccessAuditEntry = {
  routeId: string;
  requiresResidentKey: boolean;
  allowsWithoutKey: boolean;
  evidenceVisible: boolean;
};

export type AccessAuditResult =
  | {
      ok: false;
      error: string;
    }
  | {
      ok: true;
      summary: {
        totalRoutes: number;
        failingRoutes: number;
      };
      failures: Array<{ routeId: string; reasons: string[] }>;
    };

export const runAccessAudit = (entries?: AccessAuditEntry[]): AccessAuditResult => {
  if (!entries || entries.length === 0) {
    return {
      ok: false,
      error: "Access audit denied: no route audit context provided.",
    };
  }

  const failures = entries
    .map((entry) => {
      const reasons: string[] = [];
      if (entry.requiresResidentKey && entry.allowsWithoutKey) {
        reasons.push("missing_gate");
      }
      if (entry.evidenceVisible) {
        reasons.push("evidence_exposed");
      }
      return { routeId: entry.routeId, reasons };
    })
    .filter((entry) => entry.reasons.length > 0);

  return {
    ok: true,
    summary: {
      totalRoutes: entries.length,
      failingRoutes: failures.length,
    },
    failures,
  };
};

export type NoticeCopyValidation = {
  ok: boolean;
  templateId: string;
  warningCodes: string[];
};

export const validateNoticeCopy = (templateId?: string, text?: string): NoticeCopyValidation => {
  if (!templateId || !text) {
    return {
      ok: false,
      templateId: templateId || "unknown",
      warningCodes: ["missing_context"],
    };
  }

  const lint = lintVerySimpleEnglish(text);
  const warningCodes = lint.warnings.map((warning) => {
    if (warning.includes("idioms")) {
      return "idiom";
    }
    if (warning.includes("pressuring")) {
      return "pressure";
    }
    if (warning.includes("legal claims")) {
      return "legal_claim";
    }
    return "copy_warning";
  });

  return {
    ok: lint.ok,
    templateId,
    warningCodes,
  };
};
