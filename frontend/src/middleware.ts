import { withAuth } from "next-auth/middleware";

export default withAuth({
    callbacks: {
        authorized: ({ token }) => !!token,
    },
});

export const config = {
    matcher: ["/chat/:path*", "/sell/:path*", "/api/items/:path*", "/api/chat/:path*"],
};
