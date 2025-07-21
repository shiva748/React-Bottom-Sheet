import React from 'react';
import './App.css';
import BottomSheet from './components/BottomSheet.tsx';


function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>React Bottom Sheet Demo</h1>
        <p>
          Drag the handle or use the buttons to move the bottom sheet.<br />
          Try on desktop and mobile!
        </p>
      </header>
      <BottomSheet
        snapPoints={[0.05, 0.3, 0.6, 0.92]}
        initialSnap={1}
        header={<span>✨ Advanced Sheet Header</span>}
        footer={<span>Footer: <a href="https://react.dev" target="_blank" rel="noopener noreferrer">Learn React</a></span>}
      >
        <h2>Bottom Sheet Content</h2>
        <p>This is a custom bottom sheet with advanced features:</p>
        <ul>
          <li>Backdrop overlay with click-to-dismiss</li>
          <li>Momentum-based snap (flick up/down)</li>
          <li>Customizable snap points</li>
          <li>Dark mode support</li>
          <li>Focus trap and ESC to close</li>
          <li>Prevents background scroll</li>
        </ul>
        <p>Try dragging, flicking, or using the keyboard. Resize the window or switch to dark mode to see the effect!</p>
        <div className="demo-block" style={{height: 200, background: '#f0f0f0', borderRadius: 8, margin: '16px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600}}>
          Demo Content Block
        </div>
        <p style={{marginBottom: 0}}>You can put any content here: lists, forms, images, etc.</p>
      </BottomSheet>
    </div>
  );
}


export default App;
