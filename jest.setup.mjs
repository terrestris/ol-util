import 'jest-canvas-mock';

import {
  TextDecoder,
  TextEncoder
} from 'util';

global.fetch = jest.fn();

Object.defineProperty(global, 'ResizeObserver', {
  writable: true,
  value: jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn()
  }))
});

Object.assign(global, { TextDecoder, TextEncoder });
