# enChat server notes

## First messaging setup

Copy `.env.example` to `.env` and set the MongoDB, token, and ImageKit values. Set `REDIS_URL` to a reachable Redis instance to enable contact-list caching; the server continues to use MongoDB if Redis is unavailable.

Before starting the server against a database that contains existing messaging data, run this one-time migration from the repository root:

```sh
npm --prefix server run migrate:messaging
```

The migration fills canonical contact pair keys and direct conversation keys, repairs the changed indexes, and creates messaging indexes. It stops without changing indexes if it finds duplicate contact pairs, direct conversations, blocks, or memberships. Resolve those records and run it again before starting the server.

## Contact-list cache

The authenticated contact endpoints `GET /api/contact/`, `/pending`, and `/rejected` use a cache-aside lookup. Redis stores only the serialized page under a per-user, per-status, per-cursor key for `CONTACT_CACHE_TTL_SECONDS` (60 seconds by default). Relationship changes increment the cache version for both users, so the next request reads fresh data from MongoDB. Redis errors are treated as cache misses; contact and block checks for messaging always query MongoDB.

To check the cache locally, request a contact list twice with the same user and pagination values, then inspect Redis:

```sh
redis-cli --scan --pattern 'contacts:*'
redis-cli TTL 'contacts:list:<userId>:<version>:accepted:30:start'
```

You should see the version and list keys, and the list key should have a positive TTL. Approve, reject, remove, block, unblock, or create/cancel a request, then request the list again; the version changes and the old page is no longer selected. Stop Redis to confirm the endpoints still return MongoDB results.

## Current messaging scope

Direct conversations and text messages are implemented. Both REST history requests and Socket.IO message events check membership; sending additionally requires an approved, unblocked contact. Removing a contact preserves read access to old history and disables new messages. Group routes can list existing group conversation records, but group creation and group messaging are not implemented yet.
