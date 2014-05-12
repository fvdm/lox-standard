#!/bin/sh

# Initializes a new installation. This script should only be executed after a clean system install.
# The app/config/parameters.yml file should be configured before executing this script.

# This script uses 777 permissions on the writable dirs for platform portability.
# For more restrictive permissions, use something like ACL, depending on your platform. Write permissions are
# required for both the console user and the apache user.

# Make sure only root can run our script
if [[ $EUID -ne 0 ]]; then
   echo "This script must be run as root" 1>&2
   exit 1
fi

# Set permissions on the writable folders.
chmod -R 777 app/cache app/logs data

# Create the database.
app/console doctrine:database:create

# Create the database schema.
app/console doctrine:schema:create -q

# Load the fixtures.
app/console doctrine:fixtures:load -n

# Install assets.
app/console --env=prod assets:install --symlink web

# Install YUI assets.
app/console --env=prod rednose:yui:install

# Warm the cache.
app/console --env=prod cache:warm

# Reinitialize permissions on the cache and data folder.
chmod -R 777 app/cache/ data
