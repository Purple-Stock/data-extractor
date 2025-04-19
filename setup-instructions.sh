#!/bin/bash

# Create a new Next.js project
npx create-next-app@latest excel-matcher --typescript --tailwind --eslint

# Navigate to the project directory
cd excel-matcher

# Install required dependencies
npm install jszip xlsx @radix-ui/react-slot @radix-ui/react-tabs class-variance-authority clsx lucide-react next-themes tailwind-merge tailwindcss-animate

# Start the development server
npm run dev
