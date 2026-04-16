import Sidebar from '../components/common/Sidebar'
import { Outlet } from 'react-router-dom'
import './Dashboard.css'

function Dashboard() {
    return (
        <div className="dashboard-layout">
            <Sidebar />
            <main className="dashboard-content">
                <Outlet />
            </main>
        </div>
    )
}

export default Dashboard