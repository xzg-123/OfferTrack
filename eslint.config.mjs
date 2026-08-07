import { FlatCompat } from "@eslint/eslintrc";

const compat = new FlatCompat({ baseDirectory: import.meta.dirname });

const config = [{ ignores: [".next/**", "node_modules/**", "next-env.d.ts", "electron/**", "lib/generated/**", "release/**", ".desktop-smoke-user-data/**"] }, ...compat.extends("next/core-web-vitals", "next/typescript")];
export default config;
