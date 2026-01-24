type AccessEnv = {
  BUILDING_ACCESS_KEY?: string;
  BUILDING_KEYS_JSON?: string;
};

type BuildingKeys = Record<string, string>;

const normalizeKey = (value: string | null | undefined) => (typeof value === "string" ? value.trim() : "");

export const isAccessKeyValid = (provided: string | null | undefined, required: string | null | undefined) => {
  const requiredKey = normalizeKey(required);
  const providedKey = normalizeKey(provided);
  if (!requiredKey || !providedKey) {
    return false;
  }
  return providedKey === requiredKey;
};

export const parseBuildingKeys = (raw: string | null | undefined): BuildingKeys => {
  if (!raw) {
    return {};
  }
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") {
      return {};
    }
    return Object.entries(parsed as Record<string, unknown>).reduce<BuildingKeys>((acc, [buildingId, value]) => {
      if (typeof value !== "string") {
        return acc;
      }
      const key = normalizeKey(value);
      if (!key) {
        return acc;
      }
      acc[buildingId] = key;
      return acc;
    }, {});
  } catch {
    return {};
  }
};

const getBuildingKeys = (env: AccessEnv) => parseBuildingKeys(env.BUILDING_KEYS_JSON);

const getFallbackKey = (env: AccessEnv) => normalizeKey(env.BUILDING_ACCESS_KEY);

export const getRequiredBuildingKey = (buildingId: string, env: AccessEnv) => {
  const buildingKeys = getBuildingKeys(env);
  const directKey = normalizeKey(buildingKeys[buildingId]);
  if (directKey) {
    return directKey;
  }
  const fallback = getFallbackKey(env);
  return fallback || null;
};

export const isResidentKeyRecognized = (providedKey: string | null | undefined, env: AccessEnv) => {
  const provided = normalizeKey(providedKey);
  if (!provided) {
    return false;
  }
  const buildingKeys = getBuildingKeys(env);
  if (Object.keys(buildingKeys).length > 0) {
    return Object.values(buildingKeys).some((key) => isAccessKeyValid(provided, key));
  }
  return isAccessKeyValid(provided, getFallbackKey(env));
};

export const getBuildingIdsForKey = (providedKey: string | null | undefined, env: AccessEnv) => {
  const provided = normalizeKey(providedKey);
  if (!provided) {
    return [] as string[];
  }
  const buildingKeys = getBuildingKeys(env);
  const matched = Object.entries(buildingKeys)
    .filter(([, key]) => isAccessKeyValid(provided, key))
    .map(([buildingId]) => buildingId);
  if (matched.length > 0) {
    return matched;
  }
  return isAccessKeyValid(provided, getFallbackKey(env)) ? ["*"] : [];
};

export const isBuildingAccessValid = (buildingId: string, providedKey: string | null | undefined, env: AccessEnv) => {
  const required = getRequiredBuildingKey(buildingId, env);
  return isAccessKeyValid(providedKey, required);
};
