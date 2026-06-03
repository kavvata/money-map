import { Map, MapControls, useMap } from "@/components/ui/map";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import "./App.css";
import { useCallback, useEffect, useRef, useState } from "react";
import { Layers, X } from "lucide-react";
import type { FeatureCollection, Geometry } from "geojson";
import type { GeoJsonProperties } from "./types/types.ts";
import { hoursToNatural } from "./utils/time.ts";

interface PolygonColor {
  fillColor: string;
  outlineColor: string;
}

const COLORS: PolygonColor[] = [
  {
    fillColor: "#22c55e",
    outlineColor: "#16a34a",
  },
  {
    fillColor: "#eab308",
    outlineColor: "#ca8a04",
  },
  {
    fillColor: "#f97316",
    outlineColor: "#ea580c",
  },
  {
    fillColor: "#ef4444",
    outlineColor: "#dc2626",
  },
];

const fillLayerIds = COLORS.map((_, i) => `countries-fill-${i}`);

function CustomLayer({
  geojsonData,
}: {
  geojsonData: FeatureCollection[] | null;
}) {
  const { map, isLoaded } = useMap();
  const [isLayerVisible, setIsLayerVisible] = useState(false);
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const isDraggingRef = useRef(false);

  const addLayers = useCallback(async () => {
    if (!map || !geojsonData) return;

    geojsonData.forEach((data, i) => {
      const color = COLORS[i];
      if (!color) return;

      const sourceId = `countries-${i}`;
      const fillLayerId = fillLayerIds[i];
      const outlineLayerId = `countries-outline-${i}`;

      if (!map.getSource(sourceId)) {
        map.addSource(sourceId, {
          type: "geojson",
          data,
        });
      }

      if (!map.getLayer(fillLayerId)) {
        map.addLayer({
          id: fillLayerId,
          type: "fill",
          source: sourceId,
          paint: {
            "fill-color": color.fillColor,
            "fill-opacity": 0.4,
          },
          layout: {
            visibility: isLayerVisible ? "visible" : "none",
          },
        });
      }

      if (!map.getLayer(outlineLayerId)) {
        map.addLayer({
          id: outlineLayerId,
          type: "line",
          source: sourceId,
          paint: {
            "line-color": color.outlineColor,
            "line-width": 2,
          },
          layout: {
            visibility: isLayerVisible ? "visible" : "none",
          },
        });
      }
    });
  }, [map, isLayerVisible, geojsonData]);

  useEffect(() => {
    if (!map || !geojsonData) return;

    geojsonData.forEach((data, i) => {
      const source = map.getSource(`countries-${i}`);
      if (source && source.type === "geojson") {
        source.setData(data);
      }
    });
  }, [map, geojsonData]);

  useEffect(() => {
    if (!map || !isLoaded) return;

    addLayers();

    const handleMouseEnter = () => {
      map.getCanvas().style.cursor = "pointer";
    };

    const handleMouseLeave = () => {
      map.getCanvas().style.cursor = "";
      setHoveredCountry(null);
    };

    const handleMouseMove = (e: maplibregl.MapMouseEvent) => {
      if (isDraggingRef.current) return;

      const features = map.queryRenderedFeatures(e.point, {
        layers: fillLayerIds,
      });

      if (features.length > 0) {
        setHoveredCountry(
          hoursToNatural(features[0].properties?.value) || null,
        );
        setMousePos({ x: e.point.x, y: e.point.y });
      }
    };

    const handleDragStart = () => {
      isDraggingRef.current = true;
      setHoveredCountry(null);
    };

    const handleDragEnd = () => {
      isDraggingRef.current = false;
    };

    fillLayerIds.forEach((layerId) => {
      map.on("mouseenter", layerId, handleMouseEnter);
      map.on("mouseleave", layerId, handleMouseLeave);
      map.on("mousemove", layerId, handleMouseMove);
    });

    map.on("dragstart", handleDragStart);
    map.on("dragend", handleDragEnd);

    return () => {
      fillLayerIds.forEach((layerId) => {
        map.off("mouseenter", layerId, handleMouseEnter);
        map.off("mouseleave", layerId, handleMouseLeave);
        map.off("mousemove", layerId, handleMouseMove);
      });
      map.off("dragstart", handleDragStart);
      map.off("dragend", handleDragEnd);
    };
  }, [map, isLoaded, isLayerVisible]);

  const toggleLayer = () => {
    if (!map) return;

    const visibility = isLayerVisible ? "none" : "visible";
    COLORS.forEach((_, i) => {
      if (
        map.getLayer(`countries-fill-${i}`) &&
        map.getLayer(`countries-outline-${i}`)
      ) {
        map.setLayoutProperty(`countries-fill-${i}`, "visibility", visibility);
        map.setLayoutProperty(
          `countries-outline-${i}`,
          "visibility",
          visibility,
        );
      }
    });
    setIsLayerVisible(!isLayerVisible);
  };

  return (
    <>
      <div className="absolute top-3 left-3 z-10">
        <Button
          size="sm"
          variant={isLayerVisible ? "default" : "secondary"}
          onClick={toggleLayer}
        >
          {isLayerVisible ? (
            <X className="mr-1.5 size-4" />
          ) : (
            <Layers className="mr-1.5 size-4" />
          )}
          {isLayerVisible ? "Hide countries" : "Show countries"}
        </Button>
      </div>

      {hoveredCountry && (
        <div
          className="bg-background/90 pointer-events-none absolute z-10 rounded-md border px-3 py-2 text-sm font-medium backdrop-blur"
          style={{ left: mousePos.x + 12, top: mousePos.y - 12 }}
        >
          {hoveredCountry}
        </div>
      )}
    </>
  );
}

function App() {
  const [geojsonData, setGeojsonData] = useState<FeatureCollection[] | null>(
    null,
  );

  const handleSubmit = async (url: string) => {
    const response = await fetch("http://localhost:3000/scrape/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url,
      }),
    });

    if (!response.ok) {
      console.log({ response });
    }
    const productDetails = await response.json();
    setGeojsonData(productDetails);
  };

  return (
    <main className="relative h-screen w-screen bg-gray-900">
      <Card className="h-full w-full p-0 overflow-hidden rounded-none bg-transparent">
        <Map center={[0, 0]} zoom={2} projection={{ type: "globe" }}>
          <MapControls />
          <CustomLayer geojsonData={geojsonData} />
        </Map>
      </Card>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-full max-w-sm px-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const input = e.currentTarget.elements.namedItem(
              "url",
            ) as HTMLInputElement;
            handleSubmit(input.value);
          }}
          className="flex gap-2 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-xl shadow-lg p-2"
        >
          <Input
            type="url"
            name="url"
            placeholder="https://www.amazon..."
            required
            className="flex-1 border-none shadow-none focus-visible:ring-0 bg-transparent"
          />
          <Button type="submit" size="sm">
            Go
          </Button>
        </form>
      </div>
    </main>
  );
}

export default App;
