// Set CLERK_JWT_ISSUER_DOMAIN on the Convex deployment to enable admin sign-in.
// Until then no provider is configured and every admin mutation is rejected.
const domain = process.env.CLERK_JWT_ISSUER_DOMAIN;

const authConfig = {
  providers: domain ? [{ domain, applicationID: "convex" }] : [],
};

export default authConfig;
