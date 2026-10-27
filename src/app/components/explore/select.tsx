import { useRef } from "react";
import { Location } from "@/types";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/app/components/ui/combobox";

export function From({ locations, placeholder, setLocations, setSelectedLocation }: {
  locations: Location[],
  placeholder?: string,
  setLocations: React.Dispatch<React.SetStateAction<Location[]>>,
  setSelectedLocation: React.Dispatch<React.SetStateAction<Location | null>>
}) {
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  async function searchLocation(query: string) {
    try {
      const res = await fetch(`/api/locations/search/v1/text?q=${query}`);
      if (!res.ok) throw new Error(`Search failed: ${res.status}`);

      const { data } = await res.json();
      setLocations(data);
    }
    catch(err) {
      setLocations([{
        coords: { latitude: 0, longitude: 0 },
        name: 'Failed to perform search. Please check connection and retry.'
      }]);
    }
  }

  function geoCodeInput(e: React.ChangeEvent<HTMLInputElement>) {
    const text = e.target.value;
    clearTimeout(timerRef.current);

    if(text.length < 3) {
      setLocations([]);
      return;
    }

    timerRef.current = setTimeout(() => searchLocation(text), 1000);
  }

  return (
    <Combobox
    id="from"
    items={locations}
    itemToStringValue={(item: Location) => item.name}
    >
      <ComboboxInput
      onChange={geoCodeInput}
      placeholder={placeholder} />
      <ComboboxContent>
        <ComboboxEmpty>No items found.</ComboboxEmpty>
        <ComboboxList>
          {(item: Location, index: number) => (
            <ComboboxItem
            onClick={() => setSelectedLocation(item)}
            key={index}
            value={item.name}>
              {item.name}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}

export function To({ locations, setLocations, setSelectedLocation }: {
  locations: Location[],
  setLocations: React.Dispatch<React.SetStateAction<Location[]>>,
  setSelectedLocation: React.Dispatch<React.SetStateAction<Location | null>>
}) {
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  async function searchLocation(query: string) {
    try {
      const res = await fetch(`/api/locations/search/v1/text?q=${query}`);
      if (!res.ok) throw new Error(`Search failed: ${res.status}`);

      const { data } = await res.json();
      setLocations(data);
    }
    catch(err) {
      setLocations([{
        coords: { latitude: 0, longitude: 0 },
        name: 'Failed to perform search. Please check connection and retry.'
      }]);
    }
  }

  function geoCodeInput(e: React.ChangeEvent<HTMLInputElement>) {
    const text = e.target.value;
    clearTimeout(timerRef.current);

    if(text.length < 3) {
      setLocations([]);
      return;
    }

    timerRef.current = setTimeout(() => searchLocation(text), 1000);
  }

  return (
    <Combobox
    id="to"
    items={locations}
    itemToStringValue={(item: Location) => item.name}
    >
      <ComboboxInput
      onChange={geoCodeInput}
      placeholder='Enter destination' />
      <ComboboxContent>
        <ComboboxEmpty>No items found.</ComboboxEmpty>
        <ComboboxList>
          {(item: Location, index: number) => (
            <ComboboxItem
            onClick={() => setSelectedLocation(item)}
            key={index}
            value={item.name}>
              {item.name}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}
