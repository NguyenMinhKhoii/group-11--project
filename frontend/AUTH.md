Auth forms (Sign up / Login)

This project includes simple Sign Up and Login components under `src/components` that call the backend API at `http://localhost:5000/api/auth`.

Quick notes to test locally:
- Start the backend server (the repo `Backend` folder) on port 5000.
- Start the frontend with `npm start` from the `frontend` folder.
- The login/signup forms will store the received JWT in `localStorage` under the key `token`.

If your backend runs on a different host/port, update the fetch URLs in `src/components/Login.jsx` and `src/components/Signup.jsx` (they currently point to `http://localhost:5000`).
