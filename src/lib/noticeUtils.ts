export const formatIssueLabel = (label: string) => label.replace(/^[^a-zA-Z0-9]+\s*/, "");

export const fillTemplate = (template: string, values: Record<string, string>) => {
  let text = template;
  Object.entries(values).forEach(([key, value]) => {
    text = text.replaceAll(`[${key}]`, value);
  });
  return text;
};
