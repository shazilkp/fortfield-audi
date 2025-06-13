# fortfield-audi

FortField Audi (internally named "Breeze Lounge") is a Next.js web application designed for booking and managing time slots for a small venue. It provides an administrative interface to view reservations on a calendar, book new slots, cancel existing ones, and search for bookings.

## Features

*   **User Authentication:** Secure login for administrators using email and password, with session management via JWT.
*   **Slot Booking System:**
    *   Book slots for specific dates.
    *   Available slots: Slot 1, Slot 2, or Full Day.
    *   Capture details like name, phone number, number of pax, purpose of booking, and AC preference.
*   **Booking Cancellation:** Allows administrators to cancel existing bookings.
*   **Interactive Calendar Dashboard:**
    *   Monthly calendar view displaying booked slots.
    *   Quick view of daily reservation details by clicking on a date.
    *   Color-coded indicators for slot availability.
*   **Booking Search:**
    *   Search for bookings by Booking ID or Mobile Number.
    *   View detailed information of the searched booking.
*   **Progressive Web App (PWA):** Enabled for an enhanced user experience and potential offline capabilities.
*   **Responsive Design:** Styled with Tailwind CSS for usability across different devices.

## Tech Stack
[![My Skills](https://skillicons.dev/icons?i=react,nextjs,firebase,tailwind)](https://skillicons.dev)
*   **Framework:** [Next.js](https://nextjs.org/) (App Router)
*   **Frontend:** [React](https://reactjs.org/)
*   **Backend:** Next.js API Routes
*   **Database:** [Firebase Firestore](https://firebase.google.com/docs/firestore)
*   **Authentication:** Custom JWT-based authentication. User credentials (email, bcryptjs hashed password) are stored and validated against Firestore.
*   **Styling:** [Tailwind CSS](https://tailwindcss.com/)
*   **PWA:** [next-pwa](https://www.npmjs.com/package/next-pwa)
*   **Date Management:** [date-fns](https://date-fns.org/)
*   **JWT Handling:** [jose](https://www.npmjs.com/package/jose)

## Project Structure

*   `/app`: Main application code using Next.js App Router.
    *   `/api`: Backend API routes for login, logout, and user information.
    *   `/booking`: Pages and components for creating new bookings.
    *   `/cancel`: Pages and components for cancelling existing bookings.
    *   `/components`: Reusable React components (Calendar, Booking Forms, Search, Date Selector, etc.).
    *   `/dashboard`: Main administrative dashboard page featuring the calendar view.
    *   `/login`: User login page.
    *   `globals.css`: Global styles.
    *   `layout.js`: Root layout for the application.
*   `/firebase`: Firebase client (`firebase.js`, `firebase/client.js`) and admin SDK (`firebase/admin.js`) configurations.
*   `/public`: Static assets, PWA manifest (`manifest.json`), and service worker (`sw.js`).
*   `middleware.ts`: Handles authentication and route protection.

## Firebase Setup

The application uses Firebase for:

*   **Firestore:**
    *   Storing user data in a `users` collection (fields: `email`, `name`, `hashedPass`).
    *   Storing reservation details in a `reservations` collection (documents keyed by `YYYY-MM-DD`, containing slots `slot1`, `slot2`, `fullDay`).
    *   Maintaining a `bookingsIndex` collection for efficient searching of bookings by `bookingId` or `mobileNo`.
*   **Authentication (Custom):** User credentials are validated against the `users` collection in Firestore. JWTs are then issued and used for API and page protection.

## API Endpoints

*   `POST /api/login`: Authenticates a user by validating credentials against Firestore and sets an `auth-token` (JWT) cookie.
*   `POST /api/logout`: Clears the `auth-token` cookie to log the user out.
*   `GET /api/user`: Retrieves authenticated user's details (ID, email, name) from the JWT.

## Environment Variables

Create a `.env.local` file in the root of the project and add the following environment variables:

```env
# Firebase Client SDK Configuration
NEXT_PUBLIC_PUBLIC_API_KEY=your_firebase_public_api_key
NEXT_PUBLIC_AUTH_DOMAIN=your_firebase_auth_domain
NEXT_PUBLIC_PROJECT_ID=your_firebase_project_id
NEXT_PUBLIC_STORAGE_BUCKET=your_firebase_storage_bucket
NEXT_PUBLIC_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
NEXT_PUBLIC_APP_ID=your_firebase_app_id
NEXT_PUBLIC_MEASUREMENT_ID=your_firebase_measurement_id

# Firebase Admin SDK Configuration
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_CLIENT_EMAIL=your_firebase_admin_client_email
FIREBASE_PRIVATE_KEY=your_firebase_admin_private_key_with_newlines_escaped

# JWT Secret
JWT_SECRET=your_strong_jwt_secret_key
```

**Note on `FIREBASE_PRIVATE_KEY`**: When copying the private key from the Firebase JSON file, ensure that newline characters (`\n`) are properly escaped (e.g., replace actual newlines with `\\n`).

## Getting Started

First, ensure you have Node.js and npm (or yarn/pnpm) installed.

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/shazilkp/fortfield-audi.git
    cd fortfield-audi
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    # or
    pnpm install
    ```

3.  **Set up Firebase:**
    *   Create a Firebase project at [https://console.firebase.google.com/](https://console.firebase.google.com/).
    *   Enable **Firestore Database**.
    *   In Firestore, create a `users` collection. Add user documents with the following fields:
        *   `email` (string): The user's login email.
        *   `name` (string): The user's display name.
        *   `hashedPass` (string): The user's password, hashed using `bcryptjs`. You will need to pre-hash passwords before adding them.
    *   Add a Web App to your Firebase project. Copy the Firebase SDK configuration details for your `.env.local` file.
    *   Set up Firebase Admin SDK: Go to Project settings > Service accounts, generate a new private key, and use its contents for the Firebase Admin environment variables in `.env.local`.

4.  **Configure Environment Variables:**
    *   Create a `.env.local` file in the project root.
    *   Copy the contents from the "Environment Variables" section above and fill in your Firebase and JWT details.

5.  **Run the development server:**
    ```bash
    npm run dev
    # or
    yarn dev
    # or
    pnpm dev
    ```

6.  Open [http://localhost:3000](http://localhost:3000) with your browser to see the result. You can start by navigating to `/login`.

You can start editing the application by modifying files within the `app/` directory. The pages auto-update as you edit the files.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a font family from Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

-   [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
-   [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
