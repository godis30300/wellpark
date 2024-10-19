import { useState } from 'react';
import { TextField, Button, Box } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterIcon from '../img/filter.svg';

export default function FloatingSearchBar({ onSearch }) {
    const [searchQuery, setSearchQuery] = useState('');

    const containerStyle = {
        position: 'fixed',
        top: '3%',
        left: '0',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        backgroundColor: 'transparent',
        borderRadius: '8px',
        paddingLeft: '8%',
        paddingRight: '5%',
        paddingTop: '1%',
        zIndex: 1000,
    };


    const handleSearchClick = () => {
        if (onSearch) {
            onSearch(searchQuery);
        }
    };

    return (
        <Box sx={containerStyle}>
            <TextField
                size="small"
                placeholder="輸入目的地"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                color="white"
                sx={{
                    flexGrow: 1, marginRight: '0.5rem', backgroundColor: 'white', borderRadius: '20px', padding: '0.2rem', // 設置圓角
                    '& .MuiOutlinedInput-root': {
                        backgroundColor: 'white', // 設置背景顏色
                        borderRadius: '20px', // 設置圓角
                        '&:hover': {
                            backgroundColor: 'white', // 懸停時背景顏色不變
                        },
                        '&.Mui-focused': {
                            backgroundColor: 'white', // 聚焦時背景顏色不變
                        },
                        '& fieldset': {
                            border: 'none',
                            borderRadius: '20px', // 設置圓角
                        },
                    },
                    '& .MuiInputLabel-root': {
                        color: 'inherit',
                        '&.Mui-focused': {
                            color: 'inherit',
                        },
                    },
                }}
            />
            <Button
                variant="contained"
                startIcon={<SearchIcon />}
                size="large"
                sx={{
                    backgroundColor: '#C6FE22', // 設置背景顏色
                    color: '#313131', // 設置字體顏色
                    '&:hover': {
                        backgroundColor: '#B8F21A', // 設置懸停時的背景顏色
                    },
                    marginRight: '0.5rem',
                    paddingRight: '0.5rem',
                    height: '100%', // 設置高度為100%
                    width: '100%', // 設置寬度和高度相同
                    maxWidth: '12%', // 設置最大寬度
                    maxHeight: '50px', // 設置最大高度
                    borderRadius: '15px', // 設置圓角
                }}
                onClick={handleSearchClick}
            >
            </Button>
            <Button
                variant="contained"
                sx={{
                    backgroundColor: '#91A0A8', // 設置背景顏色
                    color: '#C6FE22', // 設置字體顏色
                    '&:hover': {
                        backgroundColor: '#81929A', // 設置懸停時的背景顏色
                    },
                    height: '100%', // 設置高度為100%
                    paddingRight: '0.5rem',
                    width: '100%', // 設置寬度和高度相同
                    maxWidth: '12%', // 設置最大寬度
                    maxHeight: '50px', // 設置最大高度
                    borderRadius: '15px', // 設置圓角
                }}
                startIcon={<img src={FilterIcon} alt="Filter" />}
            >
            </Button>
        </Box>
    );
}