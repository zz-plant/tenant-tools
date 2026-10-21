/**
 * Splits a building address into the parts a Chicago street sign shows: the street name on the blade
 * and the hundred-block number with its direction on the small plate ("2400 W").
 * An address that does not start with a number and N/S/E/W shows whole on the blade.
 */
export type StreetSignParts = { street: string; block?: string; direction?: string; suffix?: string };

// Street types a Chicago blade sets small after the name ("WABANSIA AV").
const suffixes = new Set(["ave", "av", "st", "blvd", "dr", "pl", "rd", "ct", "pkwy", "ter", "way", "ln"]);

export const streetSignParts = (address: string): StreetSignParts => {
  const match = address.trim().match(/^(\d+)\s+([NSEW])\.?\s+(.+)$/i);
  if (!match) {
    return { street: address.trim() };
  }
  const [, number, direction, rest] = match;
  const words = rest.trim().split(/\s+/);
  const last = words.at(-1)?.replace(/\.$/, "") ?? "";
  const hasSuffix = words.length > 1 && suffixes.has(last.toLowerCase());
  return {
    street: hasSuffix ? words.slice(0, -1).join(" ") : rest.trim(),
    block: number,
    direction: direction.toUpperCase(),
    ...(hasSuffix ? { suffix: last } : {}),
  };
};
