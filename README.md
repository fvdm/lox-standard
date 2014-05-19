# LocalBox

LocalBox is built on top of the [Symfony](http://symfony.com) framework and the [YUI](http://yuilibrary.com) library.

## Installing LocalBox using the installer script

The installer script was tested on Ubuntu (12.04/14.04), Debian (Wheezy 7) and CentOS (6.5).

You can find the installer scripts in the app/deployment folder.

### Before installing

* Make sure you have sudo rights on the machine

* Extract the contents of the archive to the desired folder. Choose a folder that is recommended for your system or which has your preference.

* If MySQL is already installed on your system, make sure you know the root password

* Make sure you are in the LocalBox root-folder (default this is "lox-standard").

* Make sure the install script is executable, by executing the following command:

For Ubuntu (12.04/14.04) or Debian (Wheezy 7) based systems:

    [sudo] chmod +x ./app/deployment/install-apt.sh

For CentOs (6.5) or RHEL (6) based systems:

    [sudo] chmod +x ./app/deployment/install-yum.sh

### Installing
* When you are ready to install LocalBox, execute the following command and follow the instructions on-screen:

For Ubuntu (12.04/14.04) or Debian (Wheezy 7) based systems:

    [sudo] ./app/deployment/install-apt.sh

For CentOs (6.5) or RHEL (6) based systems:

    [sudo] ./app/deployment/install-yum.sh

*Important:* The above command should be executed from the LocalBox root-folder (default this is "lox-standard" ).

You will be prompted to deliver the MySQL password, and to add a database user for the database that LocalBox will create.

During the installation you will be prompted to install MySQL, Apache and PHP. You have the possibilty to choose not to install these, but be sure that you made the correct changes in order to support the LocalBox application.

### After installing

* If Apache was not installed before you ran the install script, the script will have configured Apache for you. This means that you can now type your machine's hostname or ip-address in a browser, and you will see the LocalBox login page. You can log in for the first time using the default admin credentials (see the section "Default User Accounts" in this document).

* If Apache was already installed before you ran the install script, you should now configure Apache. Make sure that the following directory is accessible to Apache and the right permissions are set:

       */lox-standard/web*

* If you're running a webserver other than Apache2 make sure that mod-rewrite is enabled, and make sure that the webserver user and command line user have the right permission on the following folders:

       */lox-standard/app/cache*
       */lox-standard/app/logs*
       */lox-standard/data*

## Installing Localbox manually

### System Requirements

* PHP needs to be a minimum version of PHP 5.3.3
* Your php.ini needs to have the date.timezone setting
* The PHP intl extension needs to be installed
* MySQL needs to be installed
* *Optional:* To enable LocalBox's encryption capabilities, your PHP should support mcrypt- and openssl-functionality. Depending on your Linux distribution, this is either included in php or it can be installed through the packages php5-mcrypt and php5-openssl. Ubuntu 12.04 and higher already has openssl-support in PHP.

### Downloading project dependencies

1. Clone the repository, open the console and navigate to the directory.

2. Install composer, if you don't have it yet.

        curl -sS https://getcomposer.org/installer | php

3. The `app/cache` directory should be  writable for the composer post-install scripts to execute. The easiest way to do so is:

        [sudo] chmod 777 app/cache

4. Download dependencies. Enter default values (press enter) for the `parameters.yml` if prompted.

        php composer.phar install

### Initializing Symfony

To check the system configuration, run the check.php script from the command line, in the application's root directory:

    php app/check.php

If you get any warnings or recommendations, fix them before moving on.

Basic Symfony console commands that need to be executed from the application's root directory.

#### Initializing a new installation

Execute the following commands after setting up a **new** LocalBox installation:

1. Edit the `app/config/parameters.yml` file and set the required values for your specific environment.

2. Run the post installation script:

        [sudo] app/deployment/post-install.sh

The installation script uses 777 permissions on the writable dirs for platform portability. For more restrictive permissions, use something like ACL, depending on your platform. Write permissions are required for both the console user and the apache user.

#### Initializing an updated installation

Execute the following commands after updating an **existing** LocalBox installation:

1. Edit the `app/config/parameters.yml` file and set the required values for your specific environment.

1. Run the post update script:

        [sudo] app/deployment/post-update.sh

The update script uses 777 permissions on the writable dirs for platform portability. For more restrictive permissions, use something like ACL, depending on your platform. Write permissions are required for both the console user and the apache user.

**Caution**: The update script might not work properly when using an older proof-of-concept version of LocalBox, especially if there are duplicate entries in the Items-table of your database. Should you encounter problems while running the update script on an old proof-of-concept version of LocalBox, we recommend that you do a full clean install instead.

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
