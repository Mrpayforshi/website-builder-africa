// Nothing renders in the @modal slot unless a route intercepted into it
// (see (.)[id]/page.tsx). Required so Next.js doesn't 404 the parallel
// slot on every other /templates/* route.
export default function Default() {
  return null;
}
