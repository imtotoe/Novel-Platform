import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const { pathname } = nextUrl;

      // Writer routes
      if (pathname.startsWith("/writer")) {
        if (!isLoggedIn) return false;
        if (auth.user.role === "READER") return Response.redirect(new URL("/", nextUrl));
        return true;
      }

      // Admin routes
      if (pathname.startsWith("/admin")) {
        if (!isLoggedIn || auth.user.role !== "ADMIN") {
          return Response.redirect(new URL("/", nextUrl));
        }
        return true;
      }

      // Auth-required routes
      const authRequired = ["/library", "/notifications", "/settings"];
      if (authRequired.some((p) => pathname.startsWith(p))) {
        return isLoggedIn;
      }

      return true;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
