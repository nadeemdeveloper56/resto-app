"use client";

import CustomerHeader from "./_components/CustomerHeader";
import RestaurantFooter from "./_components/RestaurantFooter";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const [locations, setLocations] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState("");
  const [showLocationList, setShowLocationList] = useState(false);
  const [filterLocations, setFilterLocations] = useState(false);
  const [searchRestaurant, setSearchRestaurant] = useState("");

  const locationBoxRef = useRef(null);
  const requestIdRef = useRef(0);

  const router = useRouter();

  const loadLocations = async () => {
    try {
      const res = await fetch("/Api/restaurant/customers/locations");
      const text = await res.text();

      if (!res.ok) {
        throw new Error(
          `Locations API error: ${res.status} - ${text}`
        );
      }

      if (!text.trim()) {
        throw new Error("Locations API returned an empty response");
      }

      const data = JSON.parse(text);

      if (data.success) {
        setLocations(Array.isArray(data.result) ? data.result : []);
      } else {
        console.error("Locations API failed:", data);
      }
    } catch (error) {
      console.error("Load Locations Error:", error);
    }
  };

  const loadRestaurants = async (params = {}) => {
    // Sirf sabse latest request ka result use hoga
    const requestId = ++requestIdRef.current;

    try {
      let url = "/Api/restaurant/customers";
      const query = [];

      if (params.location) {
        query.push(
          "location=" + encodeURIComponent(params.location)
        );
      }

      if (params.restaurant) {
        query.push(
          "restaurant=" + encodeURIComponent(params.restaurant)
        );
      }

      if (query.length > 0) {
        url += "?" + query.join("&");
      }

      const res = await fetch(url);
      const text = await res.text();

      if (!res.ok) {
        throw new Error(
          `Restaurants API error: ${res.status} - ${text}`
        );
      }

      if (!text.trim()) {
        throw new Error("Restaurants API returned an empty response");
      }

      const data = JSON.parse(text);

      if (requestId !== requestIdRef.current) return;

      if (data.success) {
        setRestaurants(
          Array.isArray(data.result) ? data.result : []
        );
      } else {
        console.error("Restaurants API failed:", data);
      }
    } catch (error) {
      console.error("Load Restaurants Error:", error);
    }
  };

  useEffect(() => {
    loadLocations();
    loadRestaurants();
  }, []);

  // Dropdown se bahar click karne par list band ho jaye
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        locationBoxRef.current &&
        !locationBoxRef.current.contains(event.target)
      ) {
        setShowLocationList(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // City select karna ("" ka matlab All Cities)
  const handleListItem = (item) => {
    setSelectedLocation(item);
    setShowLocationList(false);
    setFilterLocations(false);

    loadRestaurants({
      location: item,
      restaurant: searchRestaurant,
    });
  };

  // Input par click karne par poori city list dikhao
  const openLocationList = () => {
    setFilterLocations(false);
    setShowLocationList(true);
  };

  const handleLocationInput = (e) => {
    const value = e.target.value;

    setSelectedLocation(value);
    setFilterLocations(true);
    setShowLocationList(true);

    // Text poora delete ho gaya to city filter hata do
    if (!value.trim()) {
      loadRestaurants({
        location: "",
        restaurant: searchRestaurant,
      });
    }
  };

  const visibleLocations = filterLocations
    ? locations.filter((item) =>
        item.toLowerCase().includes(selectedLocation.toLowerCase())
      )
    : locations;

  return (
    <main>
      <CustomerHeader />

      <div className="main-page-banner">
        <h1 className="text-3xl font-bold">Restaurant App</h1>

        <div className="search-bar">
          <div className="location-box" ref={locationBoxRef}>
            <input
              type="text"
              value={selectedLocation}
              onClick={openLocationList}
              onFocus={openLocationList}
              onChange={handleLocationInput}
              className="select-input"
              placeholder="Select Place"
              autoComplete="off"
            />

            {selectedLocation && (
              <button
                type="button"
                className="clear-location"
                aria-label="Clear city"
                onClick={() => handleListItem("")}
              >
                &times;
              </button>
            )}

            {showLocationList && (
              <ul className="location-list">
                {!filterLocations && (
                  <li
                    className="location-all"
                    onClick={() => handleListItem("")}
                  >
                    All Cities
                  </li>
                )}

                {visibleLocations.map((item) => (
                  <li key={item} onClick={() => handleListItem(item)}>
                    {item}
                  </li>
                ))}

                {filterLocations && visibleLocations.length === 0 && (
                  <li className="location-empty">No city found</li>
                )}
              </ul>
            )}
          </div>

          <div className="search-box">
            <svg
              className="search-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="7" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>

            <input
              type="text"
              value={searchRestaurant}
              onChange={(e) => {
                const value = e.target.value;
                setSearchRestaurant(value);

                loadRestaurants({
                  location: selectedLocation,
                  restaurant: value,
                });
              }}
              className="search-input"
              placeholder="Enter Restaurant Name"
            />
          </div>
        </div>
      </div>

      <div className="restaurant-list-container">
        {restaurants.map((item) => (
          <div
            onClick={() =>
              router.push(
                "explore/" +
                  encodeURIComponent(item.restaurantName) +
                  "?id=" +
                  item._id
              )
            }
            className="restaurant-wrapper"
            key={item._id}
          >
            <div className="heading-wrapper">
              <h3>{item.restaurantName}</h3>
              <h5>contact: {item.contactNumber}</h5>
            </div>

            <div className="address-wrapper">
              <div>{item.city}, </div>
              <div className="address">
                {item.address}, Email: {item.email}
              </div>
            </div>
          </div>
        ))}
      </div>

      <RestaurantFooter />
    </main>
  );
}
