import Books from '../assets/Books.png'
import Dashboard from '../assets/Dashboard.png'
import Messages from '../assets/Messages.png'
import QR from '../assets/QR.png'
import Reader from '../assets/Reader.png'
import Setting from '../assets/Setting.png'

// Admin menu items
export const menuItemsAdmin = [
    {
        title: "Dashboard",
        icon : Dashboard,
        link: "/dashboard"
    },
    {
        title: "Books",
        icon : Books,
        link: "/book"
    },
    {
        title: "Readers",
        icon : Reader,
        link: "/reader"
    },
        {
        title: "QR Code",
        icon : QR,  
        link: "/qrcode"
    },
    {
        title: "Messages",
        icon : Messages,
        link: "/messages"
    },
    {
        title: "Settings",
        icon : Setting,
        link: "/settings"
    },
];

// Reader menu items can be added here in the future