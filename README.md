# PBL6 Vietnomi Backend

## Prerequisites

- Node.js (v20 or higher)
- PostgreSQL
- Yarn

Note: Please use yarn for this project

```sh
# Install all dependencies
yarn install

# Add new lib
yarn add $NAME_LIB
```

## DB interaction

- Create migrations:

```
yarn db:migrate:generate src/migrations/AddNewEntity
```

Replace

- Update database:

```
yarn db:migrate:up
```

- Revert change:

```
yarn db:migrate:down
```

## Run

```
yarn start
```

## Entities

To better manage entites aka database table, create/update entities in src/entities

And run migration `yarn db:migrate:generate ...`, `yarn db:migrate:up`.

## Test

Use integration test. Read src/api/sample/sample.controller.spec.ts
