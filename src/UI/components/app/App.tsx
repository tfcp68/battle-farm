import React from 'react';
import './App.scss';
import Card from "../card/Card";
import beans from '../../../../assets/crops/beans.png';

function App() {
    return (
        <div className={'app'}>
            <Card cropImage={beans}/>
        </div>
    );
}

export default App;