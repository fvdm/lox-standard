LocalBox
=======

Installation instructions
-------------------------

### Setup

1. Set permissions on the writable folders (use more restrictive permissions when deploying):

        chmod -R 777 app/cache app/logs data

2. Copy the `parameters.yml` file and set the required values:

        cp app/config/parameters.yml.dist app/config/parameters.yml

### Global dependencies

1. Install [node.js](http://nodejs.org), if you don't have it yet.

### Initialize Symfony

1. Create the database:

        app/console doctrine:database:create

2. Create the database schema:

        app/console doctrine:schema:create

3. Load the fixtures:

        app/console doctrine:fixtures:load -n

4. Install assets:

        app/console assets:install --symlink web

5. Migrate an existing database:

        app/console doctrine:migrations:migrate

About
-----

LocalBox is a [LiBBiT](http://www.libbit.eu) initiative.
