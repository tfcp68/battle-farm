import { Route, Routes } from 'react-router-dom';
import MenuSubmodePage from '~/pages/MenuSubmodePage';
import LobbySubmodePage from '~/pages/LobbySubmodePage';
import IntroPage from '~/pages/IntroPage';
import ProfilePage from '~/pages/ProfilePage';
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
				</Routes>
			</main>
		</div>
	);
}