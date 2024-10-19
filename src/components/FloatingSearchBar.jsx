import { TextField, Button, Box } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';

export default function FloatingSearchBar() {
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

    return (
        <Box sx={containerStyle}>
            {/* 左側的文字輸入框 */}
            <TextField
                variant="outlined"
                size="small"
                placeholder="輸入目的地"
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
