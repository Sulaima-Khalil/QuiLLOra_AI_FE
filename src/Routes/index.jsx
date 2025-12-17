import { createBrowserRouter } from 'react-router-dom';
import { Home } from '../components/Home';
import { Setting } from '../pages/Setting';
import { Discover } from '../pages/Discover';
import  MyArticle from '../pages/MyArticle';
import  { Profile } from '../pages/Profile';
import { Write } from '../pages/Write';
const router=createBrowserRouter([
    {
        path:'/',
        element:<Home />,
        children: [
            {
                index:true,
                element:<Discover />
            },
        // {
        //     path:'Discover',
        //     element:<Discover />
        // },
        {
            path:'Profile',
            element:<Profile />
        },
        {
            path:'Setting',
            element:<Setting />
        },
        {
            path:'MyArticle',
            element:<MyArticle />
        },
        {
            path:'Write',
            element:<Write />
        },
    ]
    }
])

export default router;