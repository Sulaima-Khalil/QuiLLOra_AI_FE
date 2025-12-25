
import { CiHome } from "react-icons/ci";
 import { FiPenTool } from "react-icons/fi";
 import { IoBookOutline } from "react-icons/io5";
 import { IoPersonOutline } from "react-icons/io5";
 import { IoSettingsOutline } from "react-icons/io5";
import { Sidebar } from "../shared/Sidebar";

const Drawer = () => {
  const DrawerContent = [
    { icon: <CiHome />, title: "Discover", path: "/" },
    { icon: <FiPenTool />, title: "Write", path: "write" },
    { icon: <IoBookOutline />, title: "My Articles", path: "my-article" },
    { icon: <IoPersonOutline />, title: "Profile", path: "profile" },
    { icon: <IoSettingsOutline />, title: "Settings", path: "setting" },
  ];

  return <Sidebar content={DrawerContent} />;
};

export default Drawer;
