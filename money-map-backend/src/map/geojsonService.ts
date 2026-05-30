import { usdToTime } from "../currency/currencyService";
import geoJsonData from "../../data/countries.json";
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

export const buildGeoJsonMapDataFromUsd = async (price: number) => {
  const fullData = await getFullGeojson();

  fullData.features.forEach((f) => {
    if (f.properties) {
      const timeInHours = usdToTime(price, f.properties.name!);
      f.properties.value = timeInHours;
    }
  });

  fullData.features = fullData.features.filter(
    (f) => f.properties && f.properties.value > 0,
  );

  return fullData;
};
