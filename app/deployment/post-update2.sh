#!/bin/sh -x
# Initializes an existing installation. This script should be executed
# automatically after updating an installation.
RELDIR=$(readlink  -f $(dirname "${0}")/../..)
cd "${RELDIR}"

DBNAME=`cat app/config/parameters.yml | grep database_name: | sed "s/ *database_name: *//g"`
SIZ=`app/console doctrine:query:sql "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = '$DBNAME' and TABLE_TYPE='BASE TABLE'" | grep "'COUNT(\*)' => string '0' (length=1)"`

if
  test -z "$SIZ" 
then
  sudo -u apache app/console --env=prod cache:clear
  app/console --env=prod doctrine:migrations:migrate -n
  app/console --env=prod assets:install --symlink web
  app/console --env=prod rednose:yui:install
  sudo -u apache app/console --env=prod cache:warm
else
  cat > /dev/stderr <<EOF
The update script is unable to find the old database, or said database
is empty. If this is a new install, that is to be expected. If not,
please check if the app/config/parameters.yml has the right
host/port/user/pass. If this is a new install, please run post-install
instead
EOF
fi
