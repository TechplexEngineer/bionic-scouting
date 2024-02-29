#!/bin/bash

read -s -r -p "Enter password: " password
echo ""
read -r -p "Enter event eg 2024week0: " event

host="https://tga-db.team4909.org"

tables=("matches" "pit_scouting" "db_${event}_matches" "super_scouts")

for table in "${tables[@]}"; do
    echo -e "\nCreating db_${event}_${table}:"
    curl -XPUT --user "admin:${password}" "${host}/db_${event}_${table}"
    curl -XPUT --user "admin:${password}" "${host}/db_${event}_${table}/_security" \
        --data-raw '{"members":{"roles":["_admin","tga"]},"admins":{"roles":["_admin"]}}'
done





