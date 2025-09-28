# aidooit odoo test instance

## Start
```
docker compose up
```

## Running odoo with commands
```
docker compose up -d && docker compose stop web && ./odoo.sh <commands>
```
Use commands like
```
.odoo.sh -d <db_name> -u <addon_name> --stop-after-init
```

## Running Odoo in shell mode
```
docker compose up -d && docker compose stop web && docker compose run web odoo shell -d <db_name>
```
