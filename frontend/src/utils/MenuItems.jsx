import {
  faGaugeHigh,
  faBook,
  faUser,
  faCommentDots,
  faQrcode,
  faGear,
} from "@fortawesome/free-solid-svg-icons";


// Admin menu items
export const menuItemsAdmin = [
    {
        title: "Dashboard",
        icon : faGaugeHigh,
        link: "dashboard"
    },
    {
        title: "Books",
        icon : faBook,
        link: "books"
    },
    {
        title: "Readers",
        icon : faUser,
        link: "readers"
    },
    {
        title: "Borrow Books",
        icon : faQrcode,  
        link: "borrow-books"
    },
    {
        title: "Messages",
        icon : faCommentDots,
        link: "messages"
    },
    {
        title: "Setting",
        icon : faGear,
        link: "settings"
    },
];

// Reader menu items can be added here in the future