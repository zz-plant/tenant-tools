export type BuildingStatus = "available";

export type BuildingOption = {
  id: string;
  status: BuildingStatus;
};

export const defaultBuildingOptions: BuildingOption[] = [
  { id: "2353 W Wabansia", status: "available" },
  { id: "2400 W Wabansia", status: "available" },
];

const compareBuildingOptions = (a: BuildingOption, b: BuildingOption) => {
  return a.id.localeCompare(b.id);
};

export const getBuildingOptions = (buildingKeys: Record<string, string> = {}) => {
  const keyedOptions = Object.keys(buildingKeys).map<BuildingOption>((id) => ({
    id,
    status: "available",
  }));

  const baseOptions = keyedOptions.length > 0 ? [...keyedOptions] : defaultBuildingOptions;

  const uniqueById = new Map<string, BuildingOption>();
  baseOptions.forEach((option) => {
    if (!uniqueById.has(option.id) || option.status === "available") {
      uniqueById.set(option.id, option);
    }
  });

  return Array.from(uniqueById.values()).sort(compareBuildingOptions);
};
