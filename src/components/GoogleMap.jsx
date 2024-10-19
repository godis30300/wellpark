import { useEffect, useRef, useState } from "react";
import axios from 'axios';
import Full from '../img/full.svg';
import Medium from '../img/medium.svg';
import Free from '../img/free.svg';
import Zero from '../img/zero.svg';
import MyLocation from '../img/my_location.svg'; // Import the MyLocation icon
import MyDestination from '../img/my_destination.svg'; // Import the MyDestination icon
import BottomModal from './BottomModal'; // Import the BottomModal component
import NavigationModal from './NavigationModal'; // Import the NavigationModal component
import FloatingSearchBar from './FloatingSearchBar.jsx';

// Fetch parking data from the API
const fetchParkingData = async () => {
    try {
        const response = await axios.get('https://wellpark.dd-long.fun/api/latest-parks');
        console.log(response.data.data);
        return response.data.data; // Access the nested data property
    } catch (error) {
        console.error("Error fetching parking data:", error);
        return [];
    }
};

const loadGoogleMapsScript = (callback) => {
    const existingScript = document.getElementById('googleMapsScript');

    if (!existingScript) {
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyC-PDovHdQ3dL_sq6t8cXH0I6Eqj8TSpdw`;
        script.id = 'googleMapsScript';
        document.body.appendChild(script);

        script.onload = () => {
            if (callback) callback();
        };
    } else if (callback) {
        callback();
    }
};

const getMarkerIcon = (percentage) => {
    if (percentage >= 40) {
        return Free; // 75% - 100%
    } else if (percentage >= 35) {
        return Medium; // 50% - 74%
    } else if (percentage > 0) {
        return Full; // 1% - 24%
    } else {
        return Zero; // 0%
    }
};

const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLng = (lng2 - lng1) * (Math.PI / 180);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in kilometers
};

const GoogleMap = () => {
    const mapRef = useRef(null); // 用於保存地圖容器的引用
    const [parkingData2, setParkingData2] = useState([]);
    const [map, setMap] = useState(null);
    const [activeInfoWindow, setActiveInfoWindow] = useState(null);
    const [directionsService, setDirectionsService] = useState(null);
    const [directionsRenderer, setDirectionsRenderer] = useState(null);
    const [markers, setMarkers] = useState([]);
    const [circle, setCircle] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [modalContent, setModalContent] = useState(null);
    const [userLocation, setUserLocation] = useState(null);
    const [selectedMarker, setSelectedMarker] = useState(null); // State to store the selected marker
    const [showNavigationModal, setShowNavigationModal] = useState(false);

    // Fetch parking data
    useEffect(() => {
        const fetchData = async () => {
            const data = await fetchParkingData();
            setParkingData2(Array.isArray(data) ? data : []);
        };

        fetchData();
    }, []);

    // Initialize the map
    useEffect(() => {
        loadGoogleMapsScript(() => {
            if (window.google && mapRef.current && !map) {
                const newMap = new window.google.maps.Map(mapRef.current, {
                    center: userLocation,
                    zoom: 15,
                    disableDefaultUI: true, // 隱藏所有默認的UI控件
                    mapTypeControl: false,
                    streetViewControl: false,
                    fullscreenControl: false,
                    zoomControl: false,
                    styles: [
                        {
                            featureType: 'poi',
                            elementType: 'labels',
                            stylers: [{ visibility: 'off' }],
                        },
                    ],
                });

                // Initialize Directions Service and Renderer
                const directionsService = new window.google.maps.DirectionsService();
                const directionsRenderer = new window.google.maps.DirectionsRenderer({
                    suppressMarkers: true, // Suppress default A and B markers
                });
                directionsRenderer.setMap(newMap);

                setDirectionsService(directionsService);
                setDirectionsRenderer(directionsRenderer);

                // Add click listener to close active InfoWindow when clicking on the map
                newMap.addListener("click", () => {
                    if (activeInfoWindow) {
                        activeInfoWindow.close();
                        setActiveInfoWindow(null);
                    }
                    if (circle) {
                        circle.setMap(null);
                    }
                });

                setMap(newMap);
            }
        });
    }, [mapRef, map, activeInfoWindow, circle, userLocation]);

    // Add markers to the map
    useEffect(() => {
        let newMarkers = [];
        if (map && parkingData2.length > 0) {
            newMarkers = parkingData2.map((data) => {
                const percentage = (data.free_quantity / data.total_quantity) * 100;
                const icon = getMarkerIcon(percentage);

                const marker = new window.google.maps.Marker({
                    position: {
                        lat: parseFloat(data.latitude),
                        lng: parseFloat(data.longitude),
                    },
                    map: map,
                    title: data.parking_name,
                    icon: {
                        url: icon,
                        scaledSize: new window.google.maps.Size(32, 32), // Adjust the size as needed
                    },
                });

                // 點擊標記時打開模態窗口
                marker.addListener("click", () => {
                    setSelectedMarker(marker); // Store the selected marker
                    setModalContent(
                        <div>
                            <h3>{data.parking_name}</h3>
                            <p>地址: {data.address}</p>
                            <p>營業時間: {data.business_hours}</p>
                            <p>平日價格: {data.weekdays}</p>
                            <p>假日價格: {data.holiday}</p>
                            <p>剩餘車位: {data.free_quantity} / {data.total_quantity}</p>
                        </div>
                    );
                    setShowModal(true);

                    // Draw a circle with a 600-meter radius
                    if (circle) {
                        circle.setMap(null);
                    }
                    const newCircle = new window.google.maps.Circle({
                        map: map,
                        radius: 600, // 600 meters
                        fillColor: 'gray',
                        fillOpacity: 0.2,
                        strokeColor: 'gray',
                        strokeOpacity: 0.5,
                        strokeWeight: 2,
                        center: marker.getPosition(),
                    });
                    setCircle(newCircle);
                });

                return marker;
            });

            setMarkers(newMarkers);
        }
    }, [map, parkingData2, activeInfoWindow, directionsService, directionsRenderer, circle]);

    // Get user's current location and watch for changes
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                const { latitude, longitude } = position.coords;
                setUserLocation({ lat: latitude, lng: longitude });

                // Add user location marker
                if (map) {
                    new window.google.maps.Marker({
                        position: { lat: latitude, lng: longitude },
                        map: map,
                        title: 'My Location',
                        icon: {
                            url: MyLocation,
                            scaledSize: new window.google.maps.Size(32, 32), // Adjust the size as needed
                        },
                    });

                    // Center the map on the user's location
                    map.setCenter({ lat: latitude, lng: longitude });
                }
            });
        }
    }, [map, selectedMarker, parkingData2]);

    const handleNavigation = () => {
        if (directionsService && directionsRenderer && selectedMarker) {
            const request = {
                origin: userLocation, // Use user's current location as the starting point
                destination: selectedMarker.getPosition(),
                travelMode: window.google.maps.TravelMode.DRIVING,
            };
            directionsService.route(request, (result, status) => {
                if (status === window.google.maps.DirectionsStatus.OK) {
                    directionsRenderer.setDirections(result);

                    // Add destination marker with MyDestination icon
                    new window.google.maps.Marker({
                        position: selectedMarker.getPosition(),
                        map: map,
                        title: 'My Destination',
                        icon: {
                            url: MyDestination,
                            scaledSize: new window.google.maps.Size(32, 32), // Adjust the size as needed
                        },
                    });
                } else {
                    console.error('Directions request failed due to ' + status);
                }
            });
        }
        setShowModal(false); // Close the modal after setting the destination
        setShowNavigationModal(true);

    };

    return (
        <>
        <FloatingSearchBar/>
        <div style={{ height: "100%", width: "100%" }}>
            <div
                id="googleMaps"
                ref={mapRef}
                style={{ height: "100%", width: "100%" }}
            ></div>
            <BottomModal show={showModal} onClose={() => setShowModal(false)} onConfirm={handleNavigation}>
                {modalContent}
            </BottomModal>
        </div>
        </>
    );
};

export default GoogleMap;