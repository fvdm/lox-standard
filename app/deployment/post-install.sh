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
    echo "creating database"
    app/console doctrine:database:create
  else
    echo "ERROR: doctrine problem contacting database:"
    echo "$problem"
    echo "Please check the settings in app/config/parameters.yml"
    exit
  fi
fi


if 
  app/console doctrine:query:sql "select * from libbit_lox_link" >/dev/null 2>/dev/null
then
  echo "ERROR: You already seem to have localbox installed in your database. Please check app/config/parameters.yml and try again."
else
    echo "installing database schema"
    app/console doctrine:schema:create -q
    echo "loading fixtures"
    app/console doctrine:fixtures:load -n
    echo "installing asset symlinks"
    app/console --env=prod assets:install --symlink web
    echo "installing YUI components"
    app/console --env=prod rednose:yui:install
    echo "warming cache"
    app/console --env=prod cache:warm
    # above actions can be done more elegantly when sudoed as apache; but this
    # (chown after the fact) method seems more reliable, especially when changes are made
    echo "changing owner"
    chown -R apache .
fi
