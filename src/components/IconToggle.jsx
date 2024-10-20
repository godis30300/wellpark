import { useState } from 'react';
import AboutIcon from '../img/about.svg';
import FeeIcon from '../img/fee.png';
import LotIcon from '../img/lot.png';
import ListIcon from '../img/list.svg';
import AboutIcon_hover from '../img/about-hover.svg';
import FeeIcon_hover from '../img/fee-hover.png';
import LotIcon_hover from '../img/lot-hover.png';
import ListIcon_hover from '../img/list-hover.svg';
import { Typography } from '@mui/material'; // 用於顯示文字

// 定義一個 IconToggle 組件
export default function IconToggle({ iconType, link }) {
    // 使用 useState 來控制 hover 狀態
    const [hover, setHover] = useState(false);

    // 根據傳入的 iconType 動態選擇對應的初始圖標和 hover 圖標
    const getIcon = () => {
        switch (iconType) {
            case 'about':
                return hover ? AboutIcon_hover : AboutIcon;
            case 'fee':
                return hover ? FeeIcon_hover : FeeIcon;
            case 'lot':
                return hover ? LotIcon_hover : LotIcon;
            case 'list':
                return hover ? ListIcon_hover : ListIcon;
            default:
                return ListIcon;  // 默認圖標
        }
    };

    // 根據傳入的 iconType 設置對應的文字
    const getText = () => {
        switch (iconType) {
            case 'about':
                return '收藏夾';
            case 'fee':
                return '停車記';
            case 'lot':
                return '找車位';
            case 'list':
                return '路況通';
            default:
                return 'List';  // 默認文字
        }
    };

    // 設定 hover 時背景和文字顏色變化的樣式
    const containerStyle = {
        textAlign: 'center',
        borderRadius: '8px',
        backgroundColor: hover ? '#C6FE22' : 'black', // 背景顏色變化
        transition: 'background-color 0.3s',         // 背景顏色平滑過渡
        cursor: 'pointer',
        width: '18vw',
        padding: '1%',
    };

    const textStyle = {
        color: hover ? '#313131' : '#91A0A8',  // 文字顏色變化
        transition: 'color 0.3s',
        fontFamily: 'GlowSansTC-Extended-Medium, sans-serif', // 應用字體
    };

    return (
        <a href={link} style={{ textDecoration: 'none' }}>
        <div
            style={containerStyle}
            onMouseEnter={() => setHover(true)}  // 當鼠標進入時設置 hover 為 true
            onMouseLeave={() => setHover(false)} // 當鼠標離開時設置 hover 為 false
        >
            <img src={getIcon()} alt={`${iconType} icon`}/>
            <Typography variant="body1" style={textStyle}>
                {getText()}
            </Typography>
        </div>
        </a>
    );
}