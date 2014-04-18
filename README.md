# LiBBiT LocalBox

The "LocalBox Standard Edition" distribution.

## System Requirements

* PHP needs to be a minimum version of PHP 5.3.3
* Your php.ini needs to have the date.timezone setting
* The PHP intl extension needs to be installed
* MySQL needs to be installed

To check the system configuration, run the check.php script from the command line, in the application's root directory:

    php app/check.php
    
If you get any warnings or recommendations, fix them before moving on.

## Initializing Symfony

Basic Symfony console commands that need to be executed from the application's root directory.

### Initializing a new installation

Execute the following commands after setting up a **new** LocalBox installation:

1. Set permissions on the writable folders (use more restrictive permissions when deploying):

        [sudo] chmod -R 777 app/cache app/logs data

2. Copy the `parameters.yml` file and set the required values:

        cp app/config/parameters.yml.dist app/config/parameters.yml

3. Create the database:

        app/console doctrine:database:create

4. Create the database schema:

        app/console doctrine:schema:create

5. Load the fixtures:

        app/console doctrine:fixtures:load

6. Install assets:

        app/console assets:install --symlink web

7. Warm the cache:

        app/console --env=prod cache:warm

8. Reinitialize permissions on the cache folder (use more restrictive permissions when deploying):

        [sudo] chmod -R 777 app/cache

### Initializing an updated installation

Execute the following commands after updating an **existing** LocalBox installation:

1. Set permissions on the cache folder (use more restrictive permissions when deploying):

        [sudo] chmod -R 777 app/cache

2. Clear the current cache and warmup a new version:

        app/console --env=prod cache:clear

3. Install assets:

        app/console assets:install --symlink web

4. Execute database migrations:

        app/console doctrine:migrations:migrate

5. Reinitialize permissions on the cache folder (use more restrictive permissions when deploying):

        [sudo] chmod -R 777 app/cache

## Default User Accounts

Two default accounts are created, an admin account:

    username: admin
    password: adminpasswd

A standard user account:

    username: user
    password: userpasswd

## Administration

Users and groups can be managed by an admin from the following URL:

    http://host/admin/dashboard

## API Documentation

API documentation can be found on the following URL:

    http://host/api/doc

## About

LocalBox is a [LiBBiT](http://www.libbit.eu) initiative.
