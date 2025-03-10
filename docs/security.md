# PIKNIK Security Architecture

## Event Codes and Security Tokens

PIKNIK uses two main security features for URLs and access control:

1. **Event Codes** - Human-readable unique identifiers for potlucks
2. **Security Tokens** - Cryptographically secure random tokens for authentication

### Event Codes

Instead of using sequential database IDs in URLs, which could be easily guessed or enumerated, PIKNIK uses event codes with the following properties:

- Format: `XXXX-XXXX` (e.g., `ABCD-2345`)
- Uses a reduced alphabet that excludes ambiguous characters (no 0/O, 1/I, etc.)
- Unique constraint in the database ensures no collisions
- Provides a friendly, shareable code for potlucks

This approach enhances security while also improving usability, as event codes are easier to share verbally or in text messages.

### Security Tokens

PIKNIK uses cryptographically secure tokens for both admin and participant authentication:

- **Admin Tokens**: 64-character hexadecimal strings generated using `crypto.randomBytes()`
- **Participant Tokens**: 64-character hexadecimal strings generated when a participant signs up

These tokens provide the following security benefits:

1. Cannot be guessed or predicted (cryptographically secure)
2. Not sequential or derived from database IDs
3. Uniquely map to database records without exposing internal IDs
4. Allow for authorization checks without traditional login systems

## URL Structure

The security architecture influences the URL structure:

- Potluck URLs: `/potluck/{eventCode}`
- Admin URLs: `/admin/{eventCode}?token={adminToken}`
- Participant URLs: `/potluck/{eventCode}?token={participantToken}`

## Implementation Details

- Tokens are generated using Node.js `crypto` module
- Event codes are generated using `nanoid` with a custom alphabet
- Both are stored in the database with unique constraints
- API endpoints validate tokens before allowing access to protected resources

## Security Considerations

- Tokens should be transmitted over HTTPS to prevent interception
- Admin tokens should never be shared publicly
- Event codes are designed to be shareable but provide a layer of security through obscurity
- Database queries validate both the event code and appropriate token before allowing sensitive operations 