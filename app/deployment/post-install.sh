#!/bin/sh
RELDIR=$(readlink -f $(dirname "${0}"))
cd "${RELDIR}/../.."

if
  test ! -f "app/config/parameters.yml"
then
  echo "Please create a file app/config/parameters.yml based on app/config/parameters.yml.dist"
  exit
fi

if
test -z "`app/console doctrine:query:sql "select 1" 2>/dev/null`"
then
  problem=`app/console doctrine:query:sql "select 1" 2>&1`
  if
    echo "$problem" | grep -q "Unknown database"
  then
    app/console doctrine:database:create
  else
    echo "doctrine problem contacting database: $problem"
    echo "Please check the settings in app/config/parameters.yml"
    exit
  fi
fi


if 
  app/console doctrine:query:sql "select * from libbit_lox_link" >/dev/null 2>/dev/null
then
  echo You already seem to have localbox installed in your database.
  echo Please check app/config/parameters.yml and try again or run
  echo post-update.sh instead.

else
    app/console doctrine:schema:create -q
    app/console doctrine:fixtures:load -n
    app/console --env=prod assets:install --symlink web
    app/console --env=prod rednose:yui:install
    app/console --env=prod cache:warm
    # above actions can be done more elegantly when sudoed as apache; but this
    # (chown after the fact) method seems more reliable, especially when changes are made
    chown -R apache .
fi
