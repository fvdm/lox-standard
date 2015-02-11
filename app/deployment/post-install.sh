#!/bin/sh
RELDIR=$(readlink -f $(dirname "${0}"))
cd "${RELDIR}/../.."

if 
  app/console doctrine:query:sql "select * from libbit_lox_link"
then
  echo You already seem to have localbox installed on that database.
  echo Please check app/config/parameters.yml and try again or run
  echo post-update.sh instead

else
  if 
    app/console doctrine:query:sql "select 1"
  then
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

    chown -R apache .
  else
    echo Unable to connect to the database defined in the file
    echo app/config/parameters.yml. Please check your settings, check
    echo if the database is indeed up, and try again.

  fi

fi
