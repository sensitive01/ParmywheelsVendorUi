import CredentialProvider from "next-auth/providers/credentials";

export const authOptions = {
  providers: [
    CredentialProvider({
      name: "Vendor Login",
      credentials: {
        mobile: { label: "Mobile", type: "text" },
        password: { label: "Password", type: "password" },
        loginType: { label: "Login Type", type: "text" },
      },
      async authorize(credentials) {
        const { mobile, password, loginType } = credentials;

        try {
          const endpoint = loginType === "accountant" ? "/vendor/accountant/login" : "/vendor/login";
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ mobile, password, loginType }),
          });

          const data = await res.json();

          if (!res.ok) {
            throw new Error(data.message || "Login failed");
          }

          console.log("Login successful:", data);

          // Return user data (do NOT use localStorage here)
          return {
            id: data.vendorId,
            name: data.role === 'accountant' ? data.accountName : data.vendorName,
            contacts: data.contacts || [],
            latitude: data.latitude || '',
            longitude: data.longitude || '',
            address: data.address || '',
            image: data.image || '', // Ensure image is returned correctly
            parkingEntries: data.parkingEntries || [], // Ensure parkingEntries is returned correctly
            role: data.role || 'vendor',
            accountName: data.accountName || '',
            accountantId: data.accountantId || '',
          };
        } catch (error) {
          console.error("Error during login:", error);
          throw new Error(error.message || "Internal server error");
        }
      },
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token = { ...token, ...user };
      }

      return token;
    },
    async session({ session, token }) {
      session.user = token;

      return session;
    },
  },
  pages: { signIn: "/login" },
};
