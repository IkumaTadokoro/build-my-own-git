// @ts-check
import antfu from '@antfu/eslint-config'

export default antfu(
  {
    type: 'lib',
  },
  {
    rules: {
      '@typescript-eslint/no-redeclare': 'off',
    },
  },
)
