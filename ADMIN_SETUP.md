# SwiftShip first-run and administrator setup

SwiftShip uses the managed Expo/React Native starter, its Express/tRPC API, and the project’s managed MySQL database. This is the mobile equivalent of the requested React logistics experience; it keeps the requested persistent shipment tracking and role-protected staff workflows while using the platform’s fixed mobile backend rather than introducing an external MongoDB service.

## First administrator

Manus OAuth sign-in creates a user record, but this project does not have an `OWNER_OPEN_ID` configured. The application therefore does **not** silently make the first person who signs in an administrator.

1. The intended staff/admin user opens **Staff access** in the app and signs in with Manus once. This creates the user record with the default, non-admin role.
2. The project owner runs the following command from the SwiftShip project environment, using the exact email returned for that Manus OAuth account:

   ```sh
   pnpm admin:grant -- staff@example.com
   ```

3. The staff user reopens Staff access. The server verifies the database-backed `admin` role for every shipment-management operation.

The command is a private owner-side utility, not a public endpoint. It only promotes one existing matching account, refuses ambiguous duplicate matches, and never changes role when the account is missing. To add another administrator, sign in that account once and repeat the command with its email.

Do not use a shared staff identity. Only promote accounts explicitly approved by the project owner. Development and production share the managed database, so an administrator-role change applies to the same project data used in both environments.

## Product scope

The customer can track a parcel without creating an account. Staff can register a shipment, share the automatically generated ID, assign delivery personnel, and append status/location updates to the customer-facing timeline. Payment processing, customer accounts, and automatic email/SMS notifications are not included in this first version.

The support email and phone shown on the Contact screen are demo placeholders (`help@swiftship.example` and `+1 (202) 555-0144`); replace them before launch.
