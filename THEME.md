# Theme System Documentation

## Overview
This project includes a fully implemented dark and light theme system that allows users to toggle between themes dynamically. The theme preference is saved in localStorage and persists across sessions.

## Features

### 1. **Theme Toggle Button**
- Located in the navbar on every page (except login)
- Displays a moon icon for light mode (click to switch to dark)
- Displays a sun icon for dark mode (click to switch to light)
- Smooth animations and transitions

### 2. **Persistent Theme**
- Theme preference is saved in browser's localStorage
- Automatically loads the saved theme when user returns
- Default theme is light mode

### 3. **CSS Variables**
The theme system uses CSS custom properties (variables) for consistency:

#### Light Theme Variables
- `--bg-primary`: #f5f5f5 (main background)
- `--bg-secondary`: #ffffff (secondary background)
- `--bg-tertiary`: #e9ecef (tertiary background)
- `--text-primary`: #333333 (main text)
- `--text-secondary`: #666666 (secondary text)
- `--text-tertiary`: #999999 (tertiary text)
- `--border-color`: #ddd (borders)
- `--card-bg`: #ffffff (card backgrounds)
- `--input-bg`: #ffffff (input backgrounds)

#### Dark Theme Variables
- `--bg-primary`: #1a1a1a (main background)
- `--bg-secondary`: #2d2d2d (secondary background)
- `--bg-tertiary`: #3d3d3d (tertiary background)
- `--text-primary`: #e0e0e0 (main text)
- `--text-secondary`: #b0b0b0 (secondary text)
- `--text-tertiary`: #808080 (tertiary text)
- `--border-color`: #444 (borders)
- `--card-bg`: #2d2d2d (card backgrounds)
- `--input-bg`: #3d3d3d (input backgrounds)

## File Structure

### New Files Created
```
frontend/
  src/
    context/
      ThemeContext.js       # Theme state management with React Context
    components/
      ThemeToggle.js        # Theme toggle button component
      ThemeToggle.css       # Styling for theme toggle button
```

### Modified Files
All CSS files have been updated to use theme variables:
- `index.css` - Theme variable definitions
- `App.css` - Global styles with theme support
- `App.js` - Wrapped with ThemeProvider
- `Navbar.js` - Added ThemeToggle component
- `Navbar.css` - Updated with theme variables
- All page CSS files (Login, Dashboard, ExamPage, CreateExam, Results)
- Component CSS files (Modal)

## Usage

### For Users
Simply click the theme toggle button in the navbar to switch between light and dark modes. Your preference will be remembered for future visits.

### For Developers

#### Using Theme in Components
To access theme state in any component:

```javascript
import { useTheme } from '../context/ThemeContext';

function MyComponent() {
  const { theme, toggleTheme, isDark } = useTheme();
  
  return (
    <div>
      Current theme: {theme}
      <button onClick={toggleTheme}>Toggle Theme</button>
    </div>
  );
}
```

#### Adding Theme Support to New CSS
When adding new styles, use CSS variables instead of hard-coded colors:

```css
.my-element {
  background: var(--card-bg);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  box-shadow: var(--shadow-md);
}
```

#### Adding New Theme Variables
To add new theme variables, update `index.css`:

```css
:root[data-theme='light'] {
  --my-new-variable: #value;
}

:root[data-theme='dark'] {
  --my-new-variable: #value;
}
```

## Implementation Details

### ThemeContext
- Uses React Context API for global theme state
- Manages theme in localStorage
- Applies `data-theme` attribute to document root
- Provides `theme`, `toggleTheme`, and `isDark` values

### Theme Application
Themes are applied by setting a `data-theme` attribute on the document root (`<html>` element), which CSS selectors use to apply the appropriate color scheme.

### Smooth Transitions
All theme-aware elements include transition properties for smooth color changes when switching themes:

```css
body {
  transition: background-color 0.3s ease, color 0.3s ease;
}
```

## Browser Compatibility
The theme system uses:
- CSS Custom Properties (supported in all modern browsers)
- localStorage API (supported in all modern browsers)
- React Context API (React 16.3+)


## Future Enhancements
Potential improvements:
- Auto theme based on system preferences (prefers-color-scheme media query)
- Additional theme options (high contrast, colorblind-friendly)
- Theme selection menu with preview
- Custom color picker for personalized themes
