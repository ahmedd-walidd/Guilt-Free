# Guilt-Free

Guilt-Free is an Expo React Native MVP for a Ramit Sethi-style Conscious Spending Plan. It tracks user-defined fixed costs, investments, savings goals, guilt-free spending, waste, purchase checks, and monthly reviews.

It is not an investment advice app. It does not recommend stocks, crypto, ETFs, funds, or other assets.

## Install Dependencies

```bash
npm install
```

The project uses Expo Router, Supabase Auth, Supabase Postgres, React Hook Form, Zod, Zustand, date-fns, and lucide icons.

## Create A Supabase Project

1. Create a project at [supabase.com](https://supabase.com).
2. In the Supabase dashboard, open **Project Settings > API**.
3. Copy the project URL and anon public key.
4. Create a local `.env` file in the project root.

Example `.env`:

```bash
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
```

Do not commit real credentials. `.env.example` is included as the template.

## Run The Database Schema

1. Open **SQL Editor** in your Supabase project.
2. Paste the contents of `supabase/schema.sql`.
3. Run the SQL.

The schema creates:

- `profiles`
- `transactions`
- `goals`
- `purchase_checks`
- `monthly_reviews`

It also enables Row Level Security, adds per-user RLS policies, creates indexes, and applies reusable `updated_at` triggers.

## Start The App

```bash
npx expo start
```

Then open the app in Expo Go, an iOS simulator, an Android emulator, or the web target from the Expo CLI.

## Useful Commands

```bash
npm run typecheck
npm run android
npm run ios
npm run web
```

There is no lint script configured yet.
