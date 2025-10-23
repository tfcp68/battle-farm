import { Link, Route, Routes, useLocation } from 'react-router-dom';
import WindowModePage from './pages/WindowModePage';
import MenuSubmodePage from './pages/MenuSubmodePage';
import LobbySubmodePage from './pages/LobbySubmodePage';

export default function App() {
    const { pathname } = useLocation();
    return (
        <div className="app-shell">
            <header className="topbar">
                <div className="brand">Battle Farm</div>
                <nav className="nav">
                    <Link to="/" className={pathname === '/' ? 'active' : ''}>Window Mode</Link>
                    <Link to="/menu" className={pathname === '/menu' ? 'active' : ''}>Menu Submode</Link>
                    <Link to="/lobby" className={pathname === '/lobby' ? 'active' : ''}>Lobby Submode</Link>
                </nav>
            </header>
            <main className="content">
                <Routes>
                    <Route path="/" element={<WindowModePage />} />
                    <Route path="/menu" element={<MenuSubmodePage />} />
                    <Route path="/lobby" element={<LobbySubmodePage />} />
                </Routes>
            </main>
        </div>
    );
}