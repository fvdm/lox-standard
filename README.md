# LiBBiT LocalBox

LocalBox is built on top of the [Symfony](http://symfony.com) framework and the [YUI](http://yuilibrary.com) library.

## System Requirements

* PHP needs to be a minimum version of PHP 5.3.3
* Your php.ini needs to have the date.timezone setting
* The PHP intl extension needs to be installed
* MySQL needs to be installed
* *Optional: For ItemKey support php5-mcrypt and php5-openssl*

To check the system configuration, run the check.php script from the command line, in the application's root directory:

    php app/check.php

If you get any warnings or recommendations, fix them before moving on.

## Initializing Symfony

Basic Symfony console commands that need to be executed from the application's root directory.

### Initializing a new installation

Execute the following commands after setting up a **new** LocalBox installation:

1. Copy the `parameters.yml` file and set the required values:

        cp app/config/parameters.yml.dist app/config/parameters.yml

2. Run the post installation script:

        [sudo] app/deployment/post-install.sh

The installation script uses 777 permissions on the writable dirs for platform portability. For more restrictive permissions, use something like ACL, depending on your platform. Write permissions are required for both the console user and the apache user.

### Initializing an updated installation

Execute the following commands after updating an **existing** LocalBox installation:

1. Run the post update script:

        [sudo] app/deployment/post-update.sh

The update script uses 777 permissions on the writable dirs for platform portability. For more restrictive permissions, use something like ACL, depending on your platform. Write permissions are required for both the console user and the apache user.

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

## Development

### Testing

1.  To run the test suite you'll need PHPUnit:

        phpunit -c app/

## About

LocalBox is a [LiBBiT](http://www.libbit.eu) initiative.
