
import { CiHome } from "react-icons/ci";
import { FiPenTool } from "react-icons/fi";
import { IoBookOutline } from "react-icons/io5";
import { IoPersonOutline } from "react-icons/io5";
import { IoSettingsOutline } from "react-icons/io5";

import { Sidebar } from '../shared/Sidebar';

const Drawer = () => {
   
    const DrawerContent = [
        {
            icon: <CiHome />,
            title: "Discover",
            path:'/'
        },
        {
            icon: <FiPenTool />,
            title: "Write",
            path:'Write'
        },
        {
            icon: <IoBookOutline />,
            title: "My Article",
            path:'my-article'
        },
        {
            icon: <IoPersonOutline />,
            title: "Profile",
            path:'Profile'
        },
        {
            icon: <IoSettingsOutline />,
            title: "Setting" ,
            path:'Setting'
        }
    ];


    return (
        <div>
           <Sidebar content={DrawerContent} />
        
        </div>
    );
}

export default Drawer;