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
        const response = await axios.get('https://wellpark.dd-long.fun/api/latest-parks?per_page=100');
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
    const [circle, setCircle] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [modalContent, setModalContent] = useState(null);
    const [userLocation, setUserLocation] = useState(null);
    const [selectedMarker, setSelectedMarker] = useState(null); // State to store the selected marker
    const [showNavigationModal, setShowNavigationModal] = useState(false);
    const markersRef = useRef([]);
    const circleRef = useRef(null);

    // Fetch parking data
    useEffect(() => {
        const fetchData = async () => {
            const data = await fetchParkingData();
            setParkingData2(Array.isArray(data) ? data : []);
        };

        fetchData();

        // 設置定時器每5秒更新一次
        //const intervalId = setInterval(fetchData, 5000);

        // 清除定時器
        return () => clearInterval(intervalId);
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
                    keyboardShortcuts: false,
                    styles: [
                        {
                            featureType: 'poi',
                            elementType: 'labels',
                            stylers: [{ visibility: 'off' }],
                        },
                        {
                            featureType: 'water',
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
                    // 將所有標記設置為可見
                    markersRef.current.forEach(marker => marker.setVisible(true));

                    // 清除圓圈
                    if (circleRef.current) {
                        circleRef.current.setMap(null);
                    }

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
    }, [mapRef, map, activeInfoWindow, circle, userLocation, circleRef]);

    // Add markers to the map

    useEffect(() => {
        if (map && parkingData2.length > 0) {
            const newMarkers = [];

            parkingData2.forEach((data) => {
                const percentage = (data.free_quantity / data.total_quantity) * 100;
                const icon = getMarkerIcon(percentage);

                // 查找現有標記
                let marker = markersRef.current.find(m => m.getPosition().lat() === parseFloat(data.latitude) && m.getPosition().lng() === parseFloat(data.longitude));

                if (marker) {
                    // 更新現有標記的圖標
                    marker.setIcon({
                        url: icon,
                        scaledSize: new window.google.maps.Size(50, 50),
                    });
                } else {
                    // 創建新標記
                    marker = new window.google.maps.Marker({
                        position: {
                            lat: parseFloat(data.latitude),
                            lng: parseFloat(data.longitude),
                        },
                        map: map,
                        title: data.parking_name, // 添加 title 屬性
                        icon: {
                            url: icon,
                            scaledSize: new window.google.maps.Size(50, 50),
                        },
                    });

                    // 點擊標記時顯示模態窗口
                    marker.addListener("click", () => {
                        setSelectedMarker(marker);
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
                        if (circleRef.current) {
                            circleRef.current.setMap(null);
                        }
                        const newCircle = new window.google.maps.Circle({
                            map: map,
                            radius: 600,
                            fillColor: 'gray',
                            fillOpacity: 0.2,
                            strokeColor: 'gray',
                            strokeOpacity: 0.5,
                            strokeWeight: 2,
                            center: marker.getPosition(),
                        });
                        circleRef.current = newCircle;

                        //  隱藏圓圈外的標記，顯示圓圈內的標記
                        markersRef.current.forEach(m => {
                            const distance = calculateDistance(
                                marker.getPosition().lat(),
                                marker.getPosition().lng(),
                                m.getPosition().lat(),
                                m.getPosition().lng()
                            );
                            if (distance > 0.6) { // 距離大於600米
                                m.setVisible(false);
                            } else {
                                m.setVisible(true); // 確保圓圈內的標記仍然顯示
                            }
                        });
                    });

                    newMarkers.push(marker);
                }
            });

            // 更新標記狀態
            markersRef.current = [...markersRef.current, ...newMarkers];
        }
    }, [map, parkingData2, circle]);

    //markers.forEach(marker => marker.setMap(null));
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
                            scaledSize: new window.google.maps.Size(50, 50), // Adjust the size as needed
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
                            scaledSize: new window.google.maps.Size(50, 50), // Adjust the size as needed
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
    const handleSearch = async (searchQuery) => {
        if (!searchQuery) return;

        // 使用 Google Maps Geocoding API 將地點轉換為經緯度
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ address: searchQuery }, (results, status) => {
            if (status === 'OK' && results[0]) {
                const location = results[0].geometry.location;
                const lat = location.lat();
                const lng = location.lng();

                // 確保 markers 是一個有效的數組
                if (Array.isArray(markersRef.current)) {
                    // 將地圖中心移動到搜尋結果位置
                    map.setCenter(location);
                    map.setZoom(15); // 調整地圖縮放級別
// 畫一個600米的圓圈
                    if (circleRef.current) {
                        circleRef.current.setMap(null);
                    };
                    const newCircle = new window.google.maps.Circle({
                        map: map,
                        radius: 600,
                        fillColor: 'gray',
                        fillOpacity: 0.2,
                        strokeColor: 'gray',
                        strokeOpacity: 0.5,
                        strokeWeight: 2,
                        center: location,
                    });
                    circleRef.current = newCircle;

                    // 隱藏圓圈外的標記，顯示圓圈內的標記
                    markersRef.current.forEach(m => {
                        const distance = calculateDistance(
                            location.lat(),
                            location.lng(),
                            m.getPosition().lat(),
                            m.getPosition().lng()
                        );
                        if (distance > 0.6) { // 距離大於600米
                            m.setVisible(false);
                        } else {
                            m.setVisible(true); // 確保圓圈內的標記顯示
                        }
                    });

                } else {
                    console.error('markers is not an array');
                }
            } else {
                alert('無法找到該地點，請重新輸入');
            }
        });
    };

    return (
        <>
            <FloatingSearchBar onSearch={handleSearch} />
            <div style={{ height: "100%", width: "100%" }}>
                <div
                    id="googleMaps"
                    ref={mapRef}
                    style={{
                        height: "100%", width: "100%",
                        borderRadius: '2rem'
                    }}
                ></div>
                <BottomModal show={showModal} onClose={() => setShowModal(false)} onConfirm={handleNavigation}>
                    {modalContent}
                </BottomModal>
            </div>
        </>
    );
};

export default GoogleMap;