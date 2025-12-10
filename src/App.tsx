import { Route, Routes } from 'react-router-dom';
import MenuSubmodePage from '~/pages/MenuSubmodePage';
import LobbySubmodePage from '~/pages/LobbySubmodePage';
import IntroPage from '~/pages/IntroPage';
import LoginPage from '~/pages/LoginPage';

export default function App() {
    return (
        <div className="app-shell">
            <main className="content compact">
                <Routes>
                    <Route path="/" element={<LoginPage />} />
                    <Route path="/intro" element={<IntroPage />} />
                    <Route path="/menu" element={<MenuSubmodePage />} />
                    <Route path="/lobby" element={<LobbySubmodePage />} />
                    {/*<Route path="/register" element={<RegisterPage />} />*/}
					<Route path="/login" element={<LoginPage />} />
				</Routes>
            </main>
        </div>
    );
}