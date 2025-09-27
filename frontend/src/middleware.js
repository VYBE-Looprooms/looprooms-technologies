// Middleware disabled for now - using client-side authentication
// The issue is that middleware runs server-side and can't access localStorage
// We'll handle all authentication on the client side with useEffect hooks

export function middleware(request) {
  // Allow all requests to pass through
  // Authentication will be handled client-side
  return;
}

export const config = {
  matcher: [],
};