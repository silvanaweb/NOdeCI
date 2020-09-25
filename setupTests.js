const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn()
};
console.log('I AM HERE')
global.localStorage = localStorageMock
