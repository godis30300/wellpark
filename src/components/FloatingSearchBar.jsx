import { useState } from 'react';
import { TextField, Button, Box } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';

export default function FloatingSearchBar({ parkingData, map }) {
    const [searchQuery, setSearchQuery] = useState('');

    const containerStyle = {
        position: 'fixed', // 讓搜尋框固定懸浮
        top: '20px',       // 距離頂部 20px
        left: '50%',
        transform: 'translateX(-50%)', // 水平居中
        display: 'flex',
        alignItems: 'center',
        backgroundColor: 'transparent',
        borderRadius: '8px',
        padding: '0.5rem',
        zIndex: 1000, // 保證懸浮在其他元素上面
        width: '80vw',
    };

    const handleSearch = async () => {
        if (!searchQuery) return;

        // 使用 Google Maps Geocoding API 將地點轉換為經緯度
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ address: searchQuery }, (results, status) => {
            if (status === 'OK' && results[0]) {
                const location = results[0].geometry.location;
                const lat = location.lat();
                const lng = location.lng();

                // 計算所有停車場與該地點的距離
                let closestParking = null;
                let minDistance = Infinity;

                parkingData.forEach(parking => {
                    const distance = calculateDistance(lat, lng, parking.latitude, parking.longitude);
                    if (distance < minDistance) {
                        minDistance = distance;
                        closestParking = parking;
                    }
                });

                if (closestParking) {
                    // 將地圖中心移動到最近的停車場
                    map.setCenter({ lat: closestParking.latitude, lng: closestParking.longitude });
                    map.setZoom(15); // 調整地圖縮放級別
                }
            } else {
                alert('無法找到該地點，請重新輸入');
            }
        });
    };

    // 計算兩個經緯度之間的距離的輔助函數
    const calculateDistance = (lat1, lng1, lat2, lng2) => {
        const R = 6371; // 地球半徑，單位為公里
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLng = (lng2 - lng1) * Math.PI / 180;
        const a =
            0.5 - Math.cos(dLat) / 2 +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            (1 - Math.cos(dLng)) / 2;

        return R * 2 * Math.asin(Math.sqrt(a));
    };

    return (
        <Box sx={containerStyle}>
            {/* 左側的文字輸入框 */}
            <TextField
                variant="outlined"
                size="small"
                placeholder="輸入目的地"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                sx={{
                    flexGrow: 1, marginRight: '0.5rem', backgroundColor: 'white',
                    '& .MuiOutlinedInput-root': {
                        '& fieldset': {
                            border: 'none',
                        },
                    },
                }}
            />

            {/* 中間的搜尋按鈕 */}
            <Button
                variant="contained"
                color="primary"
                startIcon={<SearchIcon />}
                sx={{ marginRight: '0.5rem' }}
                onClick={handleSearch}
            >
            </Button>

            {/* 右側的過濾按鈕 */}
            <Button
                variant="outlined"
                color="default"
                startIcon={<FilterListIcon />}
            >
            </Button>
        </Box>
    );
}