import { render, screen } from '@testing-library/react';
import App from './App';
import { AuthProvider } from './context/AuthContext';

test('renders navbar sign in link', async () => {
  render(
    <AuthProvider>
      <App />
    </AuthProvider>
  );
  const linkElement = await screen.findByText(/sign in \/ register/i);
  expect(linkElement).toBeInTheDocument();
});
