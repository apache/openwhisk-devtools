#!/bin/bash

#
# create the subjects databases (in Cloudant or CouchDB)
#
# Usage: createSubjects.sh

SCRIPTDIR="$(cd $(dirname "$0")/ && pwd)"

URL_BASE="$OPEN_WHISK_DB_PROTOCOL://$OPEN_WHISK_DB_HOST:$OPEN_WHISK_DB_PORT"

if [ "$OPEN_WHISK_DB_PROVIDER" == "CouchDB" ]; then
    CURL_ADMIN="curl -s -k --user $OPEN_WHISK_DB_USERNAME:$OPEN_WHISK_DB_PASSWORD"

    # First part of confirmation prompt.
    echo "About to drop and recreate database '$DB_SUBJECTS_DBS' on:"
    echo "  $URL_BASE"

else
    echo "Unrecognized OPEN_WHISK_DB_PROVIDER: '$OPEN_WHISK_DB_PROVIDER'"
    exit 1
fi

GUEST_KEY=`cat "$SCRIPTDIR/config/keys/auth.guest"`
WHISK_SYSTEM_KEY=`cat "$SCRIPTDIR/config/keys/auth.whisk.system"`

# array of keys that need to be recreated in the auth table if it is ever dropped or in case of a fresh deployment
SUBJECTS_KEYS=("guest:$GUEST_KEY" "whisk.system:$WHISK_SYSTEM_KEY")

for db in $DB_SUBJECTS_DBS
do
    echo $db

    # drop the database
    CMD="$CURL_ADMIN -X DELETE $URL_BASE/$db"
    echo $CMD
    $CMD

    # create the database
    CMD="$CURL_ADMIN -X PUT $URL_BASE/$db"
    echo $CMD
    $CMD
done

# recreate the "full" index on the "auth" database
$CURL_ADMIN -X POST -H 'Content-Type: application/json' \
        -d @$PROJECT_HOME/ansible/files/auth_index.json \
    $URL_BASE/$DB_WHISK_AUTHS;

# recreate necessary "auth" keys
for key in "${SUBJECTS_KEYS[@]}" ; do
    SUBJECT="${key%%:*}"
    UUID="${key%:*}"
    UUID="${UUID##*:}"
    KEY="${key##*:}"
    echo Create key for $SUBJECT
    $CURL_ADMIN -X POST -H 'Content-Type: application/json' \
        -d "{
            \"_id\": \"$SUBJECT\",
            \"subject\": \"$SUBJECT\",
            \"uuid\": \"$UUID\",
            \"key\": \"$KEY\"
         }" \
    $URL_BASE/$DB_WHISK_AUTHS;
done
