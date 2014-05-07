#!/bin/bash

# *** Localbox installation ***
# Make sure the user understands that this script is for specific systems.
echo "[LocalBox Installation]"
echo "Before continuing with the installation of LocalBox, note that you are"
echo "executing the installation script for 'yum' based systems. This script"
echo "has been tested on:"
echo "* CentOs 6.5"
read -p "Do you want to continue with the installation ( yes | no ) " answerInstall

if [[ $answerInstall = "no" ]]; then
  exit 1
fi


# *** Localbox installation ***
# Installation of the Localbox will start.
echo "[LocalBox Notice] Installing LocalBox ..."


# *** Update repositories ***
# Updating the repositories to make sure we will be installing the latest
# version of the packages.
echo "[LocalBox Notice] Updating repositories ..."
yum check-update


# *** Install MySQL ***
# Installing MySQL as database. We need the root password for MySQL in order
# to create a new database later on in the script.
clear
read -p "Is MySQL installed on the system? (yes | no) " answerMysql

if [[ $answerMysql = "no" ]]; then
    read -p "Please provide a password for the root user for MySQL: " mysqlpasswd
    
    echo "[LocalBox Notice] Installing MySQL ..."
    yum install -q -y mysql-server mysql
    service mysqld start
    sleep 5
    mysqladmin -u root password $mysqlpasswd
else
    read -p "Please provide the password of the root user for MySQL: " mysqlpasswd
fi


# *** Install Apache ***
# When there is no webserver present on the client we are giving here the option
# to install it. With the use of Apache we need to enable mod-rewrite to rewrite
# the requested url's on the fly. When Apache is not used as webserver it is 
# important to enable the same feature on the chosen webserver
clear
PS3="Please select one of the options (1,2 or 3) "

declare -a options
options[${#options[*]}]="I want to install Apache, it's not present on the system";
options[${#options[*]}]="I don't want to install Apache, it's already present on the system";
options[${#options[*]}]="I don't want to install Apache, I'm using a different webserver";

select opt in "${options[@]}"; do
  case ${opt} in
  ${options[0]}) yum install -q -y httpd; apacheOnSystem=true; break; ;;
  ${options[1]}) apacheOnSystem=true; break; ;;
  ${options[2]}) apacheOnSystem=false; break; ;;
  esac;
done


# *** Install PHP ***
# PHP5 needs to be installed along with the following dependencies: 
# php5-intl, php5-json, php5-mysql
# We give the user the possiblity to install without PHP if this is required.
clear
PS3="Please select one of the options (1,2 or 3) "

declare -a options2
options2[${#options2[*]}]="I want to install PHP 5, it's not present on the system";
options2[${#options2[*]}]="I don't want to install PHP 5, it's already present on the system. (This will install some dependencies)";
options2[${#options2[*]}]="I don't want to install PHP 5, it's already present on the system. (This won't install dependencies)";

select opt in "${options2[@]}"; do
  case ${opt} in
  ${options2[0]}) yum install -y php php-intl php-json php-mysql php-xml php-mbstring php-bcmath;
                  phpOnSystem=true; break; ;;
  ${options2[1]}) yum install -y php-intl php-json php-mysql php-xml php-mbstring php-bcmath;
                  phpOnSystem=true; break; ;;
  ${options2[2]}) phpOnSystem=false; break; ;;
  esac;
done


# *** Symfony 2: Composer ***
# A timezone is needed in php.ini for Composer to function properly
echo "[LocalBox Notice] Editing php.ini file ..."
if [[ $phpOnSystem ]]; then
    sed -i 's/;date.timezone\s=.*/date.timezone = Europe\/Amsterdam/' /etc/php.ini
fi


# *** LocalBox ***
# Settings file parameters.yml needs to contain the database credentials for
# the newly created database and database-user. These credentials will be
# appended to the file parameters.yml
cp -f app/config/parameters.yml.dist app/config/parameters.yml
clear
echo "We're about to create a new MySQL database ..."
read -p "Please provide a database user for the database loxstandard: " dbusername
read -p "Please provide a password for the database user: " dbpasswd

DBPARAM=$(cat <<EOF
parameters:
    database_driver:   pdo_mysql
    database_host:     127.0.0.1
    database_port:     ~
    database_name:     loxstandard
    database_user:     $dbusername
    database_password: $dbpasswd

    mailer_transport:  smtp
    mailer_host:       127.0.0.1
    mailer_user:       ~
    mailer_password:   ~

    locale:            en
    secret:            sAUwuNmLzqxJY8WL3dqmoAGQ
EOF
)
echo "${DBPARAM}" > app/config/parameters.yml


# *** MySQL ****
# A new database will be created named 'loxstandard' on which the database-user
# will be the owner
Q1="CREATE USER $dbusername@localhost IDENTIFIED BY '$dbpasswd';"
Q2="GRANT USAGE ON *.* TO $dbusername@localhost IDENTIFIED BY '$dbpasswd';"
Q3="GRANT ALL PRIVILEGES ON loxstandard.* TO $dbusername@localhost;"
Q4="FLUSH PRIVILEGES;"
SQL="${Q1}${Q2}${Q3}${Q4}"
mysql -uroot -p$mysqlpasswd -e "$SQL"


# *** Symfony 2: Composer ***
# Composer will be downloaded and moved, so it will be globally available
echo "[LocalBox Notice] Downloading and installing composer"
yum install -y curl
curl -s https://getcomposer.org/installer | php
mv composer.phar /usr/local/bin/composer


# *** LocalBox ***
# Remove app/cache and app/logs
echo "[LocalBox Notice] Removing cache and logs ..."
rm -rf app/cache/*
rm -rf app/logs/*


# *** Symfony2: post-install ***
# To initialize a new installation. This script will make the necessary changes
# for the symfony2 framework to work. See the script post-install.sh for more
# information.
app/deployment/post-install.sh


# Restart Apache
if [[ $apacheOnSystem ]]; then
    service httpd restart
fi