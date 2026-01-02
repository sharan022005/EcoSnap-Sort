# **App Name**: EcoSnap Sort

## Core Features:

- Waste Image Capture: Capture an image of waste using the device's camera.
- AI-Powered Waste Identification: Use Google Gemini 1.5 Flash API to identify the type of waste and determine the appropriate bin (Red, Blue, Green) using reasoning tool to choose among environmental facts and bin types.
- Bin Recommendation Display: Display the recommended bin color (Red, Blue, Green) and an eco-fact to the user.
- Points Accrual: Award users points for successfully identifying the correct bin.
- User Authentication: Allow users to log in anonymously or via email using Firebase Authentication.
- Leaderboard Ranking: Display a leaderboard of the top 10 users sorted by points, fetched in real-time.
- User Score Management: Store user points in Firestore and update them upon successful waste identification.

## Style Guidelines:

- Primary color: Forest green (#388E3C) to represent ecology and nature.
- Background color: Very light green (#F1F8E9) to create a soft, clean interface.
- Accent color: Bright cyan (#00BCD4) for interactive elements and highlights, providing contrast and a modern feel.
- Body and headline font: 'PT Sans' for a clean and readable user experience.
- Use flat, vector icons representing different types of waste and recycling bins.
- Clean and modern layout with a prominent 'Scan Trash' button in the center.
- Subtle animations to provide feedback when capturing images and updating scores.