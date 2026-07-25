# ExpenseFlow Mobile

Cross-platform expense tracking app built with Expo and React Native.

**Related repos:** [expenseflow-api](https://github.com/your-org/expenseflow-api) · [expenseflow-admin](https://github.com/your-org/expenseflow-admin)

## Stack

- Expo SDK 56, React Native, TypeScript
- Expo Router, Redux Toolkit, React Query
- Expo Secure Store, PostHog (optional)

## Prerequisites

- [ExpenseFlow API](https://github.com/your-org/expenseflow-api) running
- Expo Go (latest) or development build

## Quick start

```bash
cp .env.example .env
npm install
npx expo start
```

### API URL

Default: `http://localhost:8000/api/v1`

On a **physical device**, set your machine's LAN IP in `.env`:

```
EXPO_PUBLIC_API_URL=http://192.168.1.x:8000/api/v1
```

### Dev login

Seed the API first (`npm run db:seed` in the API repo):

| Email | Password |
|-------|----------|
| `admin@budgetbrain.app` | `Admin123!` |

Or use **Sign Up** to register a new account.

## Environment

See `.env.example` for optional keys (PostHog, Sentry).

## Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start Expo dev server |
| `npm run ios` | Run on iOS simulator |
| `npm run android` | Run on Android emulator |
| `npm run web` | Run in browser |

## Expo Go limitations

- Push notifications require a **development build** (`npx expo run:android`)

## Features

- Auth, onboarding, dashboard
- Expenses, budgets, goals, net worth
- Offline queue, biometric lock, receipt upload
