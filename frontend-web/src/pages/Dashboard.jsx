import Sidebar from '../components/common/Sidebar'
import { Outlet } from 'react-router-dom'

function Dashboard() {
    return (
        <div>
            <Sidebar />
            <Outlet />
        </div>
    )
}

export default Dashboard