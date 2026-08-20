import { Route, Routes } from 'react-router-dom';
import MenuSubmodePage from '~/pages/MenuSubmodePage';
import LobbySubmodePage from '~/pages/LobbySubmodePage';
import IntroPage from '~/pages/IntroPage';
import ProfilePage from '~/pages/ProfilePage';
import GamePage from '~/pages/GamePage';
import ScorePage from '~/pages/ScorePage';
import { AppRoutes } from '~/app/routes';
import { Toaster } from '~/shared/ui/components/sonner';

export default function App() {
	return (
		<div className="app-shell">
			<Toaster
				toastOptions={{
					duration: 100000,
				}}
			/>
			<main className="content compact">
				<Routes>
					<Route path={AppRoutes.profile} element={<ProfilePage />} />
					<Route path={AppRoutes.intro} element={<IntroPage />} />
					<Route path={AppRoutes.menu} element={<MenuSubmodePage />} />
					<Route path={AppRoutes.lobby} element={<LobbySubmodePage />} />
					<Route path={AppRoutes.game} element={<GamePage />} />
					<Route path={AppRoutes.score} element={<ScorePage />} />
				</Routes>
			</main>
		</div>
	);
}