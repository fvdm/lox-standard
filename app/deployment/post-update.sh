#!/bin/sh

# Initializes an existing installation. This script should be executed after updating an installation.

# This script uses 777 permissions on the writable dirs for platform portability.
# For more restrictive permissions, use something like ACL, depending on your platform. Write permissions are
# required for both the console user and the apache user.

# Make sure only root can run our script
if [[ $EUID -ne 0 ]]; then
   echo "This script must be run as root" 1>&2
   exit 1
fi

# Set permissions on the cache folder.
chmod -R 777 app/cache

# Execute database migrations.
app/console --env=prod doctrine:migrations:migrate -n

# Install assets.
app/console --env=prod assets:install --symlink web

# Install YUI assets.
app/console --env=prod rednose:yui:install

# Clear the current cache and warmup a new version.
app/console --env=prod cache:clear

# Reinitialize permissions on the cache folder
chmod -R 777 app/cache
