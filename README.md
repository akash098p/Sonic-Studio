# SonicStudio - Professional Audio & Video Editor (Web Edition)

A browser-based professional-grade media editing suite built entirely with vanilla JavaScript. SonicStudio runs entirely in the client without server dependencies, providing powerful audio and video editing capabilities accessible anytime, anywhere.

## Key Features

### Media Editing Suite
- **Video Editing**: Trim, cut, splice, rotate, resize, transformations
- **Audio Editing**: Multi-track mixing, advanced effects (Bass Boost, Treble, Equalizer, Reverb, Echo, Noise Reduction), normalization
- **Effects Library**: Visual filters, transitions, audio enhancements
- **Multi-track Timeline**: Independent audio/video tracks with precise control
- **Export Options**: Save projects as MP4, MP3, WAV, AAC, OGG, FLAC with adjustable bitrate & quality

### Production Features
- **Project Autosave**: Automatic project serialization with version tracking
- **Media Library**: Import files via drag-and-drop, recent files access
- **Performance Monitoring**: CPU/Memory usage visualization
- **Themes**: Dark/light/midnight/neon themes with customization
- **Keyboard Shortcuts**: Efficient workflow navigation
- **Cross-Device Responsive**: Seamless experience on desktop & tablet

## System Requirements

- Modern web browser (Chrome, Firefox, Edge, Safari)
- Internet connection only for first load
- No server or installation required

## Getting Started

### Quick Start
1. **Open Application**  
   Simply open `index.html` in your browser - no installation needed

2. **Create New Project**  
   Click "New Project" → Choose between Audio or Video workspace

3. **Import Media**  
   - Drag & drop files to the Media Library  
   - Click "Open" to browse files  
   - Files appear instantly in the library

4. **Edit Your Media**  
   - Drag clips onto timeline tracks  
   - Trim, cut, and arrange clips  
   - Apply effects via the Inspector panel  
   - Adjust volume, opacity, and transformations

5. **Export Your Work**  
   - Choose MP4 for video projects  
   - Choose MP3/WAV for audio projects  
   - Adjust export settings and save

### Advanced Usage
- **Multi-track Editing**: Work with separate audio tracks for voiceovers, music, and sound effects
- **Live Preview**: Real-time playback with visual effects
- **Project Management**: Save multiple projects, load recent files, export completed projects
- **Theme Customization**: Switch themes in Settings → Appearance
- **Keyboard Shortcuts**: Use `Space` to play/pause, `Ctrl+Z` for undo

## Project Structure

```
SonicStudio/
├── css/                # Styling files
├── js/                 # Core JavaScript modules
│   ├── ui.js           # UI manager with workspace switching
│   ├── player.js       # Audio/video player with playback controls
│   ├── timeline.js     # Multi-track timeline management
│   ├── storage.js      # Browser localStorage persistence
│   ├── notifications.js# System notifications & alerts
│   └── loading.js      # Startup sequence manager
├── index.html          # Main application entry point
└── README.md           # Documentation
```

## Technical Implementation

### Core Components
- **UIManager**: Controls workspace visibility, handles user interactions
- **PlayerManager**: Handles media playback, volume control, seek functionality
- **TimelineManager**: Manages multi-track operations, clip positioning, destination assignment
- **StorageManager**: Persists project data using `localStorage`
- **App**: Orchestrates initialization, main loop, theme loading, and export flow

### Media Import Flow
1. User selects/draifts files into Media Library
2. `FileReader` converts binary to Data URLs
3. Clips are stored as objects with metadata
4. Added to visual media library UI
5. Dragging to timeline creates editable clips

### Playback Behavior
- Supports automatic source identification (video vs audio)
- Adjustable playback rate with just-in-time loading
- Timeline playhead synchronization with media timeline
- End-of-playback handling triggers timeline reset

## Contributing

### Development Flow
- Fork repository and create feature branch
- Implement changes in modular JavaScript files
- Test functionality through browser interface
- Maintain backward compatibility
- Submit pull request with detailed description

### Code Style
- Strict mode JavaScript (`'use strict'`)
- Class-based architecture with clear separation of concerns
- Semantic naming conventions
- Comprehensive inline documentation
- Minimal DOM manipulations

## License

SonicStudio is released under the MIT License - see `LICENSE` file for details.

## Acknowledgments

Special thanks to the vibrant web development community and all contributors who helped shape SonicStudio into a professional-grade editor that runs entirely in the browser.