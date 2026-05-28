import { Map, MapControls, useMap } from "@/components/ui/map";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import "./App.css";
import { useCallback, useEffect, useState } from "react";
import { Layers, X } from "lucide-react";
import type { Feature, FeatureCollection, Geometry } from "geojson";
import type { GeoJsonProperties } from "./types/types.ts";

function CustomLayer() {
  const { map, isLoaded } = useMap();
  const [isLayerVisible, setIsLayerVisible] = useState(false);
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);

  const addLayers = useCallback(async () => {
    if (!map) return;
    const response = await fetch("http://localhost:3000/scrape/");
    const geojsonData: FeatureCollection<Geometry, GeoJsonProperties> =
      await response.json();
    // Add source if it doesn't exist
    if (!map.getSource("countries")) {
      map.addSource("countries", {
        type: "geojson",
        data: geojsonData,
      });
    }

    // Add fill layer if it doesn't exist
    if (!map.getLayer("countries-fill")) {
      map.addLayer({
        id: "countries-fill",
        type: "fill",
        source: "countries",
        paint: {
          "fill-color": "#22c55e",
          "fill-opacity": 0.4,
        },
        layout: {
          visibility: isLayerVisible ? "visible" : "none",
        },
      });
    }

    // Add outline layer if it doesn't exist
    if (!map.getLayer("countries-outline")) {
      map.addLayer({
        id: "countries-outline",
        type: "line",
        source: "countries",
        paint: {
          "line-color": "#16a34a",
          "line-width": 2,
        },
        layout: {
          visibility: isLayerVisible ? "visible" : "none",
        },
      });
    }
  }, [map, isLayerVisible]);

  useEffect(() => {
    if (!map || !isLoaded) return;

    // Add layers on mount
    addLayers();

    // Hover effect
    const handleMouseEnter = () => {
      map.getCanvas().style.cursor = "pointer";
    };

    const handleMouseLeave = () => {
      map.getCanvas().style.cursor = "";
      setHoveredCountry(null);
    };

    const handleMouseMove = (e: maplibregl.MapMouseEvent) => {
      const features = map.queryRenderedFeatures(e.point, {
        layers: ["countries-fill"],
      });

      if (features.length > 0) {
        setHoveredCountry(features[0].properties?.value || null);
      }
    };

    map.on("mouseenter", "countries-fill", handleMouseEnter);
    map.on("mouseleave", "countries-fill", handleMouseLeave);
    map.on("mousemove", "countries-fill", handleMouseMove);

    return () => {
      map.off("mouseenter", "countries-fill", handleMouseEnter);
      map.off("mouseleave", "countries-fill", handleMouseLeave);
      map.off("mousemove", "countries-fill", handleMouseMove);
    };
  }, [map, isLoaded, isLayerVisible]);

  const toggleLayer = () => {
    if (!map) return;

    const visibility = isLayerVisible ? "none" : "visible";
    map.setLayoutProperty("countries-fill", "visibility", visibility);
    map.setLayoutProperty("countries-outline", "visibility", visibility);
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
        <div className="bg-background/90 absolute bottom-3 left-3 z-10 rounded-md border px-3 py-2 text-sm font-medium backdrop-blur">
          {hoveredCountry}
        </div>
      )}
    </>
  );
}

function App() {
  const handleSubmit = async (url: string) => {
    const response = await fetch("http://localhost:3000/scrape");
    if (!response.ok) {
      console.log({ response });
    }
    const productDetails = await response.json();
    console.log({ productDetails });
  };

  return (
    <main className="relative h-screen w-screen bg-gray-900">
      <Card className="h-full w-full p-0 overflow-hidden rounded-none bg-transparent">
        <Map center={[0, 0]} zoom={2} projection={{ type: "globe" }}>
          <MapControls />
          <CustomLayer />
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
            placeholder="https://..."
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
