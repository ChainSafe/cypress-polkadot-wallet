import typescriptEslint from '@typescript-eslint/eslint-plugin'
import prettier from 'eslint-plugin-prettier'
import cypress from 'eslint-plugin-cypress'
import tsParser from '@typescript-eslint/parser'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import js from '@eslint/js'
import { FlatCompat } from '@eslint/eslintrc'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all
})

export default [
  ...compat.extends('eslint:recommended', 'plugin:@typescript-eslint/recommended'),
  {
    plugins: {
      '@typescript-eslint': typescriptEslint,
      prettier,
      cypress
    },

    languageOptions: {
      parser: tsParser
    },

    rules: {
      '@typescript-eslint/no-namespace': 'off',
      trailingComma: 'off',
      'object-curly-spacing': ['error', 'always'],
      'prettier/prettier': 'error'
    }
  }
]
