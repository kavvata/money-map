import { usdToTime } from "../currency/currencyService";
import geoJsonData from "../../data/countries.json";
import type { FeatureCollection } from "geojson";

export const getFullGeojson = async (): Promise<FeatureCollection> => {
  return geoJsonData;
};

interface BinResult {
  min: number;
  max: number;
}

export const buildGeoJsonMapDataFromUsd = async (price: number) => {
  const NO_TIME = -1;
  const fullData = await getFullGeojson();
  const N_OF_BINS = 4;

  let minTimeLog = Infinity;
  let maxTimeLog = NO_TIME;

  fullData.features.forEach((f) => {
    if (!f.properties) {
      return;
    }

    const timeInHours = usdToTime(price, f.properties.name!);

    f.properties.value = timeInHours;

    f.properties.logValue = timeInHours > 0 ? Math.log10(timeInHours) : 0;

    if (timeInHours > 0) {
      const logVal = f.properties.logValue;
      if (logVal < minTimeLog) minTimeLog = logVal;
      if (logVal > maxTimeLog) maxTimeLog = logVal;
    }
  });

  fullData.features = fullData.features.filter(
    (f) => f.properties && f.properties.value > 0,
  );

  const binInterval = (maxTimeLog - minTimeLog) / N_OF_BINS;

  const edges = Array<BinResult>();

  let lastMax = minTimeLog;

  for (let i = 1; i <= N_OF_BINS; i++) {
    const newMax = lastMax + binInterval;
    edges.push({
      min: lastMax,
      max: newMax,
    });
    lastMax = newMax;
  }

  const binnedData = Array<FeatureCollection>();

  edges.forEach((bin) => {
    binnedData.push({
      type: "FeatureCollection",
      bbox: fullData.bbox,
      features: fullData.features.filter(
        (f) =>
          f.properties!.logValue >= bin.min && f.properties!.logValue < bin.max,
      ),
    });
  });

  return binnedData;
};
