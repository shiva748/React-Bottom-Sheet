import React, { useState } from 'react';
import './App.css';
import BottomSheet from './components/BottomSheet.tsx';

const features = [
  { icon: '🟦', title: 'Multiple Snap Points', desc: 'Closed, half, open, and custom positions.' },
  { icon: '🌀', title: 'Smooth Animation', desc: 'Custom spring/linear motion, no libraries.' },
  { icon: '🖐️', title: 'Drag & Flick', desc: 'Drag or flick to snap, with momentum.' },
  { icon: '🔘', title: 'Snap Controls', desc: 'Buttons and indicator for snap points.' },
  { icon: '🌗', title: 'Light/Dark Mode', desc: 'Toggle between light and dark themes.' },
  { icon: '🛡️', title: 'Accessibility', desc: 'Keyboard, focus trap, ESC to close.' },
  { icon: '📱', title: 'Responsive', desc: 'Works on desktop and mobile.' },
  { icon: '🔒', title: 'No 3rd-Party Anim', desc: 'All animation is custom-coded.' },
];

function App() {
  const [darkMode, setDarkMode] = useState(false);

  return (
    <div className="App">
      <header className="App-header" style={{paddingBottom: 0}}>
        <button
          style={{
            position: 'absolute',
            top: 18,
            right: 18,
            padding: '8px 16px',
            borderRadius: 8,
            border: 'none',
            background: darkMode ? '#222' : '#e3f2fd',
            color: darkMode ? '#fff' : '#1976d2',
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
            zIndex: 2000,
            transition: 'background 0.2s, color 0.2s',
          }}
          onClick={() => setDarkMode((d) => !d)}
          aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {darkMode ? '🌙 Dark' : '☀️ Light'}
        </button>
        <div className="feature-tiles">
          {features.map((f, i) => (
            <div className="feature-tile" key={i}>
              <div className="feature-icon">{f.icon}</div>
              <div className="feature-title">{f.title}</div>
              <div className="feature-desc">{f.desc}</div>
            </div>
          ))}
        </div>
      </header>
      <BottomSheet
        snapPoints={[0.05, 0.3, 0.6, 0.92]}
        initialSnap={1}
        header={<span>✨ Advanced Sheet Header</span>}
        footer={<span>Footer: <a href="https://react.dev" target="_blank" rel="noopener noreferrer">Learn React</a></span>}
        darkMode={darkMode}
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
