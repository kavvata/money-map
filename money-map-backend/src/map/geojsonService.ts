import geoJsonData from "./file/countries.json";
import type { FeatureCollection } from "geojson";

export const getFullGeojson = async (): Promise<FeatureCollection> => {
  return geoJsonData;
};

export const getBrazil = async () => {
  const fullData = await getFullGeojson();
  fullData.features = fullData.features.filter(
    (f) => f.properties!.name! == "Brazil",
  );
  fullData.features.forEach((f) => {
    if (f.properties) {
      f.properties.value = 10;
    }
  });
  return fullData;
};
