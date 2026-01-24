export const isAccessKeyValid = (provided: string | null | undefined, required: string | null | undefined) => {
  if (!required) {
    return false;
  }
  if (!provided) {
    return false;
  }
  return provided === required;
};
