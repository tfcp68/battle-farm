import {createRoot} from 'react-dom/client';
import React from "react";
import GameApp from "./components/GameApp/GameApp";

const root = createRoot(document.getElementById('root')!);
root.render(<GameApp></GameApp>);