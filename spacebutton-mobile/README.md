# SpaceButton Mobile - React Native Expo App

A cross-platform mobile application for apartment and property listings, built with React Native and Expo.

## Features

- **Authentication**: Login, Sign Up, Password Recovery
- **Property Listings**: Browse, Search, and Filter properties
- **Property Details**: View detailed property information with image galleries
- **Messaging**: Real-time chat with property owners
- **Saved Properties**: Bookmark favorite listings
- **User Profile**: Manage account settings and preferences
- **Wallet**: Built-in payment system
- **Premium Subscription**: Access exclusive features
- **Dark/Light Theme**: Automatic theme support
- **Notifications**: Stay updated on property activities

## Tech Stack

- **React Native** with **Expo SDK 52**
- **Expo Router** for file-based navigation
- **TypeScript** for type safety
- **Zustand** for state management
- **AsyncStorage** for local data persistence
- **Expo Vector Icons** for iconography

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Expo CLI
- iOS Simulator (Mac) or Android Emulator

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npx expo start
```

3. Run on your device:
- Press `i` for iOS Simulator
- Press `a` for Android Emulator
- Scan QR code with Expo Go app on your phone

## Project Structure

```
spacebutton-mobile/
├── app/                      # Expo Router screens
│   ├── (auth)/              # Authentication screens
│   │   ├── _layout.tsx
│   │   ├── welcome.tsx
│   │   ├── login.tsx
│   │   ├── signup.tsx
│   │   └── forgot-password.tsx
│   ├── (tabs)/              # Main tab screens
│   │   ├── _layout.tsx
│   │   ├── home.tsx
│   │   ├── search.tsx
│   │   ├── messages.tsx
│   │   ├── settings.tsx
│   │   ├── profile.tsx
│   │   ├── saved.tsx
│   │   ├── wallet.tsx
│   │   ├── notifications.tsx
│   │   ├── add-post.tsx
│   │   ├── my-posts.tsx
│   │   ├── premium.tsx
│   │   └── help.tsx
│   ├── property/
│   │   └── [id].tsx         # Property details
│   ├── chat/
│   │   └── [id].tsx         # Chat screen
│   ├── edit-profile.tsx
│   ├── _layout.tsx          # Root layout
│   └── index.tsx            # Splash screen
├── components/              # Reusable components
│   ├── ui/
│   │   ├── Button.tsx
│   │   └── Input.tsx
│   ├── PropertyCard.tsx
│   ├── BottomNav.tsx
│   ├── BackButton.tsx
│   └── Icons.tsx
├── constants/
│   └── theme.ts             # Color themes
├── context/
│   └── ThemeContext.tsx     # Theme provider
├── lib/
│   ├── mock-data.ts         # Sample data
│   └── store.ts             # Zustand store
├── app.json                 # Expo configuration
├── package.json
├── tsconfig.json
└── babel.config.js
```

## Building for Production

### iOS

```bash
npx expo build:ios
# or with EAS
eas build --platform ios
```

### Android

```bash
npx expo build:android
# or with EAS
eas build --platform android
```

## Configuration

Update `app.json` with your app details:

- `name`: App display name
- `slug`: URL-friendly name
- `ios.bundleIdentifier`: iOS bundle ID
- `android.package`: Android package name

## API Integration

Replace mock data in `lib/mock-data.ts` with actual API calls. The app is structured to easily integrate with:

- REST APIs
- GraphQL
- Firebase
- Supabase

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## License

MIT License - feel free to use this project for personal or commercial purposes.
