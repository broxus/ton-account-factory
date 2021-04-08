# FreeTON account factory

This project aims to help with deploying multiple account contracts. It implements
factory contracts, which can deploy multiple account contracts per one external call.

## Build contracts

```
locklift build --config locklift.config.js
```

## Run tests

Use the following command to run FreeTON local node (for testing on `local` network):

```
docker run --rm -d --name local-node -p80:80 -e USER_AGREEMENT=yes tonlabs/local-node
```

Run script

```
locklift test --config locklift.config.js --network local
```
