export type BuildingStatus = "available" | "coming-soon";

export type BuildingOption = {
  id: string;
  status: BuildingStatus;
};

export const defaultBuildingOptions: BuildingOption[] = [
  { id: "2353 W Wabansia", status: "available" },
  { id: "2400 W Wabansia", status: "available" },
  { id: "812 W Adams St", status: "coming-soon" },
  { id: "159 W North Ave", status: "coming-soon" },
];

const compareBuildingOptions = (a: BuildingOption, b: BuildingOption) => {
  if (a.status !== b.status) {
    return a.status === "available" ? -1 : 1;
  }
  return a.id.localeCompare(b.id);
};

export const getBuildingOptions = (buildingKeys: Record<string, string> = {}) => {
  const keyedOptions = Object.keys(buildingKeys).map<BuildingOption>((id) => ({
    id,
    status: "available",
  }));

  const baseOptions =
    keyedOptions.length > 0
      ? [
          ...keyedOptions,
          ...defaultBuildingOptions.filter((option) => option.status === "coming-soon"),
        ]
      : defaultBuildingOptions;

  const uniqueById = new Map<string, BuildingOption>();
  baseOptions.forEach((option) => {
    if (!uniqueById.has(option.id) || option.status === "available") {
      uniqueById.set(option.id, option);
    }
  });

  return Array.from(uniqueById.values()).sort(compareBuildingOptions);
};
