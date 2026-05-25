import { Map, MapControls } from "@/components/ui/map";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import "./App.css";

function App() {
  const handleSubmit = (url: string) => {
    // TODO
  };

  return (
    <main className="relative h-screen w-screen bg-gray-900">
      <Card className="h-full w-full p-0 overflow-hidden rounded-none bg-transparent">
        <Map center={[0, 0]} zoom={2} projection={{ type: "globe" }}>
          <MapControls />
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
