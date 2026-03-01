export const formatResidentReportCount = (count: number) => {
  if (!Number.isFinite(count) || count <= 0) {
    return "0";
  }
  if (count < 3) {
    return "<3";
  }
  return String(Math.floor(count));
};

export const formatPublicReadonlyCount = (count: number) => {
  if (!Number.isFinite(count) || count <= 0) {
    return "0";
  }
  if (count < 3) {
    return "Not shown";
  }
  return String(Math.floor(count));
};
