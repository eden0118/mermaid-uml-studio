import { defineConfig } from "eslint/config";
import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";
export default defineConfig([{
    extends: [...nextCoreWebVitals, ...nextTypescript],

    rules: {
        "@typescript-eslint/no-explicit-any": "warn",
        "react-hooks/exhaustive-deps": "warn",
    },
}]);