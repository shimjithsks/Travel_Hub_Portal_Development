// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// jsdom doesn't implement scrollTo; some components call it on route changes.
Object.defineProperty(window, 'scrollTo', { value: jest.fn(), writable: true });
