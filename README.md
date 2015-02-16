# LocalBox

LocalBox is built on top of the [Symfony](http://symfony.com) framework and the [YUI](http://yuilibrary.com) library.
## Installation of the LAMP stack (you need this)
For CentOS/Ubuntu:

yum install php httpd mariadb-server php-bcmath php-mbstring php-pdo git php-xml php-mysql php-intl

apt-get install apache mariadb-server php-bcmath php-mbstring php-pdo git php-xml php-mysql php-intl

# install composer
curl -sS https://getcomposer.org/installer | php

mv composer.phar /usr/local/bin/composer

chmod +x /usr/local/bin/composer


## Installation from the github repository:

git clone ${localboxurl}

in this case:

git clone https://github.com/2EK/lox-standard /usr/share/lox-standard (or any pre-directory of your liking)

cd lox-standard

before we update composer, make sure you have enough memory for it.

look in your /etc/php.ini or/and the /etc/php5/cli

for the parameter: memory_limit make it at least 2048M

composer is a little bit memory hungry when its installing and updating.

Its smart to update 2 more parameters,find post_max_size make it 4096M

and upload_max_filesize make it 4096M.

so your user can send bigger files to the box.

There are plenty more settings to fiddle with but that's up to you.

## Update the vendor library

next give the following command: composer update

You have to wait a while, go walk the dog or drink some coffee:-)
If all go's well you can try to do a post install.

note: if you don't have a valid parameters.yml it wil ask you for the settings, you can fill it in thats ok,
but you have to use ofcourse the same value's as below with a new installation.
You can alway's copy the parameters.yml.dist to parameters.yml and manually edit the file.

## Starting your engines.

# for boot

systemctl enable httpd.service

systemctl enable mariadb.service

# for now

systemctl start httpd.service

systemctl start mariadb.service

## For a new installation
For a brand new install it is easier to create the database first with a database owner.

first run: mysql_secure_installation

to tighten the databses if your not done that already.(remebered you pwd?)
then:

mysql -h localhost -u root -p <your pwd>

MariaDB [(none)]> CREATE DATABASE localbox;

MariaDB [(none)]> GRANT ALL PRIVILEGES ON localbox.* TO 'localbox'@'localhost' IDENTIFIED BY '<yourownpwd';

MariaDB [(none)]> FLUSH PRIVILEGES;

exit

standing in you localbox root directory (cd /usr/share/localbox)

app/deployment/post-install.sh

## Some things to check:
do you have a data directory?

mkdir /usr/share/lox-standard/data

Make sure the data app/cache app/logs folders are writable for httpd  (mostly apache, or www-data)

cd /usr/share/lox-standard

chown -R apache data app/cache app/logs

don't use a alias in your apache config , it's better to set its documentroot to /usr/share/lox-standard/web

We removed some (install) scripts because the were out of date, and we are working on the rpm system to replace most of the
 scripting.and are working on a WiKi and improving the web site , so most of the documentation and guides will be published
on wiki.yourlocalbox.org overtime.

Happy Boxing;-)

## Installation from RPM not yet possible :-( but coming soon

yum install localbox\*-${version}.rpm

create a app/parameters.yml based on app/parameters.yml.dist

app/deployment/post-install.sh



# Deprecated information??not all of it:-)

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

## Updating LocalBox using the update script

### Before updating

It is really important that you make a copy of the data folder and the file /app/config/parameters.yml in your LocalBox installation. Place this copy in a safe place (for instance, your home folder). We will need this data folder and parameters.yml later on in the update process.

### Removing the lox-standard folder

Next, we will remove the entire lox-standard folder. Go to the folder where this folder is located (for instance /var/www or /opt) and execute the following command:

    rm -rf lox-standard

### Extracting the new LocalBox files

Go to the folder where the .tar.gz-file of the new LocalBox version is located, and extract it to the appropriate folder (for instance /var/www or /opt).

    tar -xzvf [filename].tar.gz -C /[pathname]

So for instance:

    tar -xzvf localbox-v2.4.1.tar.gz -C /var/www

### Copying back the data folder and parameters.yml

Go to the folder where you stored a copy of both the data folder and the file parameters.yml, and copy them to your new lox-standard folder. For instance:

    [sudo] cp -rf /home/admin/paramaters.yml /var/www/app/config/parameters.yml
    [sudo] cp -rf /home/admin/data /var/www/app/config/data

### Running the update script

Now run the update script:

    [sudo] app/deployment/post-update.sh

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

2. Run the post update script:

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

LocalBox is a Hocosta and Department of EZ initiative.Developed by [LiBBiT](http://www.libbit.eu)
More information is found on [wesharesafe.org](http://www.wesharesafe.org/)
