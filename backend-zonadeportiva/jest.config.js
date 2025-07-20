export default {
    testEnvironment: 'node',
    moduleNameMapper: {
      '^(\\.{1,2}/.*)\\.js$': '$1',
    },
    transform: {
      '^.+\\.[tj]sx?$': [
        'babel-jest',
        {
          presets: [
            ['@babel/preset-env', { targets: { node: 'current' } }]
          ]
        }
      ],
    },
    globals: {
      'ts-jest': {
        useESM: true
      }
    }
  };