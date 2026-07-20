'use client';

import { useState } from 'react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Card, CardContent } from '@/app/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import { MapPin, Calendar, Truck, Search, Star, Clock, AlertCircle } from 'lucide-react';

const MOCK_DRIVERS = [
  {
    id: '1',
    name: "John's Logistics",
    rating: 4.8,
    reviews: 342,
    distance: 2.3,
    eta: 8,
    price: 2500,
    capacity: 5,
    type: 'Flatbed',
    image: 'https://via.placeholder.com/80?text=Driver1',
  },
  {
    id: '2',
    name: 'Swift Transport',
    rating: 4.9,
    reviews: 521,
    distance: 5.1,
    eta: 12,
    price: 3000,
    capacity: 10,
    type: 'Box Truck',
    image: 'https://via.placeholder.com/80?text=Driver2',
  },
  {
    id: '3',
    name: 'Express Movers',
    rating: 4.6,
    reviews: 189,
    distance: 8.7,
    eta: 18,
    price: 3500,
    capacity: 8,
    type: 'Flatbed',
    image: 'https://via.placeholder.com/80?text=Driver3',
  },
];

export default function ExplorePage() {
  const [filters, setFilters] = useState({
    from: '',
    to: '',
    date: new Date().toISOString().split('T')[0],
    type: '',
  });
  const [searchSubmitted, setSearchSubmitted] = useState(false);
  const [drivers, setDrivers] = useState<typeof MOCK_DRIVERS>([]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();

    setSearchSubmitted(true);
    setDrivers(MOCK_DRIVERS);
  }

  function handleFilterChange(key: string, value: string) {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="hidden lg:grid lg:grid-cols-[350px_1fr_350px] gap-4 p-4 h-screen">
        <div className="flex flex-col gap-4 overflow-y-auto border-r border-border pr-4">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold mb-6">Ready to go?</h2>
            <p className="text-sm text-muted-foreground">
                Find the perfect pickup for your move
              </p>
          </div>

          <form onSubmit={handleSearch} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="from" className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" />
                From
              </Label>
              <Input
                id="from"
                type="text"
                placeholder="Enter pickup location"
                value={filters.from}
                onChange={(e) => handleFilterChange('from', e.target.value)}
                className="border-primary/20"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="to" className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" />
                To
              </Label>
              <Input
                id="to"
                type="text"
                placeholder="Enter destination"
                value={filters.to}
                onChange={(e) => handleFilterChange('to', e.target.value)}
                className="border-primary/20"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date" className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" />
                Date
              </Label>
              <Input
                id="date"
                type="date"
                value={filters.date}
                onChange={(e) => handleFilterChange('date', e.target.value)}
                className="border-primary/20"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type" className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-primary" />
                Vehicle Type
              </Label>
              <Select value={filters.type} onValueChange={(value) => handleFilterChange('type', value)}>
                <SelectTrigger id="type">
                  <SelectValue placeholder="Any type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any type</SelectItem>
                  <SelectItem value="flatbed">Flatbed</SelectItem>
                  <SelectItem value="box-truck">Box Truck</SelectItem>
                  <SelectItem value="pickup">Pickup</SelectItem>
                  <SelectItem value="van">Van</SelectItem>
                  <SelectItem value="semi-truck">Semi Truck</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary-600 text-primary-foreground"
            >
              <Search className="w-4 h-4 mr-2" />
              Search
            </Button>
          </form>

          {!searchSubmitted && (
            <div className="mt-6 space-y-3 pt-6 border-t border-border">
              <p className="text-sm font-medium text-muted-foreground">Recent</p>
              <div className="space-y-2">
                <button className="w-full text-left p-2 hover:bg-muted rounded-lg transition-colors text-sm">
                  <p className="font-medium">100242 Oworonshoki → Lekki Sea port</p>
                  <p className="text-xs text-muted-foreground">Yesterday</p>
                </button>
                <button className="w-full text-left p-2 hover:bg-muted rounded-lg transition-colors text-sm">
                  <p className="font-medium">101327 Ring road, Oredo → 023147 Uselu, Lagos-Benin Exp way</p>
                  <p className="text-xs text-muted-foreground">2 days ago</p>
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/20">
          <div className="text-center space-y-3">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                <MapPin className="w-10 h-10 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Live Map View</p>
                <p className="text-sm text-muted-foreground">
                  See drivers in real-time
                </p>
              </div>
              <p className="text-xs text-muted-foreground/70 max-w-xs">
                Search to see available drivers and their locations on an interactive map
              </p>
          </div>
        </div>

        <div className="flex flex-col gap-4 overflow-y-auto border-l border-border pl-4">
          {!searchSubmitted ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto">
                  <Search className="w-6 h-6 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Use the filters to find available drivers
                </p>
              </div>
            </div>
          ) : (
            <>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Results: {drivers.length} drivers available
                </p>
              </div>
              <div className="space-y-3">
                {drivers.map((driver) => (
                  <Card key={driver.id} className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-4 space-y-3">
                      <div className="flex gap-3">
                        <img
                          src={driver.image}
                          alt={driver.name}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{driver.name}</p>
                          <div className="flex items-center gap-1 text-sm">
                            <Star className="w-3.5 h-3.5 fill-primary text-primary" />
                            <span className="font-medium">{driver.rating}</span>
                            <span className="text-muted-foreground">
                              ({driver.reviews})
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-primary">₦{driver.price.toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground">{driver.type}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-muted-foreground py-2 border-y border-border/50">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          <span>{driver.distance} km</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{driver.eta} min</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Truck className="w-4 h-4" />
                          <span>{driver.capacity}T capacity</span>
                        </div>
                      </div>

                      <Button className="w-full bg-primary hover:bg-primary-600 text-primary-foreground">
                        Book Now
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="lg:hidden flex flex-col h-screen overflow-hidden">
        <div className="sticky top-0 z-40 bg-background border-b border-border p-4">
          <h2 className="text-2xl font-bold mb-6">Ready to go?</h2>
            <p className="text-sm text-muted-foreground">
              Find the perfect pickup for your move
            </p>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="px-4 pt-4 pb-2">
            <div className="flex items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/20 h-60">
              <div className="text-center space-y-2">
                <MapPin className="w-8 h-8 text-primary mx-auto" />
                <p className="text-sm text-muted-foreground">Map View</p>
              </div>
            </div>
          </div>

          <div className="px-4 py-4 border-t border-border space-y-4">
            <form onSubmit={handleSearch} className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="from-mobile" className="text-xs">
                  From
                </Label>
                <Input
                  id="from-mobile"
                  type="text"
                  placeholder="Pickup location"
                  value={filters.from}
                  onChange={(e) => handleFilterChange('from', e.target.value)}
                  className="text-sm h-9"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="to-mobile" className="text-xs">
                  To
                </Label>
                <Input
                  id="to-mobile"
                  type="text"
                  placeholder="Destination"
                  value={filters.to}
                  onChange={(e) => handleFilterChange('to', e.target.value)}
                  className="text-sm h-9"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1.5">
                  <Label htmlFor="date-mobile" className="text-xs">
                    Date
                  </Label>
                  <Input
                    id="date-mobile"
                    type="date"
                    value={filters.date}
                    onChange={(e) => handleFilterChange('date', e.target.value)}
                    className="text-sm h-9"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="type-mobile" className="text-xs">
                    Type
                  </Label>
                  <Select value={filters.type} onValueChange={(value) => handleFilterChange('type', value)}>
                    <SelectTrigger id="type-mobile" className="h-9 text-sm">
                      <SelectValue placeholder="Any" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any type</SelectItem>
                      <SelectItem value="flatbed">Flatbed</SelectItem>
                      <SelectItem value="box-truck">Box Truck</SelectItem>
                      <SelectItem value="pickup">Pickup</SelectItem>
                      <SelectItem value="van">Van</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-10 bg-primary hover:bg-primary-600 text-primary-foreground text-sm"
              >
                Search
              </Button>
            </form>
          </div>

          {searchSubmitted && (
            <div className="px-4 py-4 space-y-3 border-t border-border">
              <p className="text-xs font-medium text-muted-foreground">
                {drivers.length} drivers available
              </p>
              {drivers.map((driver) => (
                <Card key={driver.id} className="hover:shadow-sm transition-shadow">
                  <CardContent className="p-3 space-y-2">
                    <div className="flex gap-2">
                      <img
                        src={driver.image}
                        alt={driver.name}
                        className="w-10 h-10 rounded object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{driver.name}</p>
                        <div className="flex items-center gap-1 text-xs">
                          <Star className="w-3 h-3 fill-primary text-primary" />
                          <span className="font-medium">{driver.rating}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-primary">₦{driver.price.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">{driver.distance}km</p>
                      </div>
                    </div>

                    <Button size="sm" className="w-full h-8 text-xs bg-primary hover:bg-primary-600">
                      Book
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
