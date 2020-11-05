# Hive Node Beacon

A Node.js scanner/monitoring tool for the Hive blockchain. Check it out on [beacon.peakd.com](https://beacon.peakd.com)

# Usage

### Server

```
# Install dependencies
npm install

# Serve on localhost:3000
npm run start

# Build for production (this will build both server and client)
npm run build
```

### Client

```
# Move to client directory
cd client

# Install dependencies
npm install

# Serve on localhost:8080
npm run serve

# Rebuild/update Tailwind CSS
npm run build:tailwind
```

# Configuration

To configure the server you can use environment variables or a `.env` file. Use `env.sample` as a reference configuration.

```
# account used to cast test transactions
BEACON_ACCOUNT=peak.beacon
# if not set some tests will be skipped
BEACON_ACCOUNT_POSTING_KEY=
# if not set some tests will be skipped
BEACON_ACCOUNT_ACTIVE_KEY=

# chain ID
API_CHAIN_ID=beeab0de00000000000000000000000000000000000000000000000000000000
# account used in most 'fetch' call
API_PARAM_ACCOUNT=peakd
# community used for pinned/muted tests
API_PARAM_COMMUNITY=hive-156509
```
