Name:		localbox
BuildArch: noarch
Version:	1.1.1
Release:	2%{?dist}
License:	EUGPL
URL:		http://www.libbit.eu/nl/producten-nl/localbox
Source0:	lox-standaard.tar.gz
Summary:	A secure way of sharing documents
Group:		Applications/Publishing
BuildRoot:  %(mktemp -ud %{_tmppath}/%{name}-%{version}-%{release}-XXXXXX)


BuildRequires:	doxygen
# localbox
Requires:	localbox-server localbox-dependencies
# centos
Requires:   php
# epel
Requires:   php-symfony

%package server
Summary:	A secure way of sharing documents, server component.
Group:		Applications/Publishing


%package doxygen-refman
Summary:	Doxygen generated reference manual for localbox
Group:		Applications/Publishing

%description
Een nieuwe ontwikkeling betreft LocalBox; een door de overheid gewenst
Dropbox alternatief, veilig, toepasbaar in private cloud omgevingen en
te gebruiken vanaf verschillende devices (iPad, Android en Windows
desktops). 
%description server
Een nieuwe ontwikkeling betreft LocalBox; een door de overheid gewenst
Dropbox alternatief, veilig, toepasbaar in private cloud omgevingen en
te gebruiken vanaf verschillende devices (iPad, Android en Windows
desktops).
%description doxygen-refman
Een nieuwe ontwikkeling betreft LocalBox; een door de overheid gewenst
Dropbox alternatief, veilig, toepasbaar in private cloud omgevingen en
te gebruiken vanaf verschillende devices (iPad, Android en Windows
desktops). 

%prep
%setup -q -n lox-standaard

%clean
rm -rf $RPM_BUILD_ROOT

%build
#doxygen Doxyfile

mv app/config/parameters.yml.dist app/config/parameters.yml
rm Doxyfile composer.lock
find . -type f -iname .gitkeep -exec rm {} \;

%install
rm -rf $RPM_BUILD_ROOT
mkdir -p ${RPM_BUILD_ROOT}%{_datadir}/localbox
mkdir -p ${RPM_BUILD_ROOT}%{_defaultdocdir}/localbox
mkdir -p ${RPM_BUILD_ROOT}%{_datadir}/localbox/app/cache
mkdir -p ${RPM_BUILD_ROOT}%{_datadir}/localbox/app/logs
mkdir -p ${RPM_BUILD_ROOT}%{_sysconfdir}/httpd/conf.d

mv README.md LICENSE ${RPM_BUILD_ROOT}%{_defaultdocdir}/localbox

mv conf/localbox.conf ${RPM_BUILD_ROOT}%{_sysconfdir}/httpd/conf.d
rm -rf conf

#cp -pr doc/html ${RPM_BUILD_ROOT}%{_defaultdocdir}/localbox
rm -rf doc

cp -pr * ${RPM_BUILD_ROOT}%{_datadir}/localbox

%post
%{_datadir}/localbox/app/deployment/post-update2.sh

%files
%files server
%attr(0700, apache, apache)
%{_datadir}/localbox/app/cache
%{_datadir}/localbox/app/logs
%attr(0755, root, root)
%{_datadir}/localbox/app/console
%{_datadir}/localbox/app/deployment/*.sh
%{_datadir}/localbox/app/deployment/*.spec
%attr(0644, root, root)
%{_sysconfdir}/httpd/conf.d/localbox.conf

%{_datadir}/localbox/app/.htaccess
%{_datadir}/localbox/app/bootstrap.php.cache
%{_datadir}/localbox/app/DoctrineMigrations/*.php
%{_datadir}/localbox/app/config/*.yml
%{_datadir}/localbox/app/*.php
%{_datadir}/localbox/app/phpunit.xml.dist
%{_datadir}/localbox/app/Resources/apns/apns_certificate_dev.pem
%{_datadir}/localbox/app/Resources/views/base.html.twig
%{_datadir}/localbox/composer.json
%{_datadir}/localbox/go-pear.phar
%{_datadir}/localbox/src/Libbit/LoxBundle/Admin/*.php
%{_datadir}/localbox/src/Libbit/LoxBundle/Consumer/*.php
%{_datadir}/localbox/src/Libbit/LoxBundle/Controller/*.php
%{_datadir}/localbox/src/Libbit/LoxBundle/Controller/Admin/*.php
%{_datadir}/localbox/src/Libbit/LoxBundle/DataFixtures/ORM/files/test.pdf
%{_datadir}/localbox/src/Libbit/LoxBundle/DataFixtures/ORM/files/test.txt
%{_datadir}/localbox/src/Libbit/LoxBundle/DataFixtures/ORM/*.php
%{_datadir}/localbox/src/Libbit/LoxBundle/DependencyInjection/*.php
%{_datadir}/localbox/src/Libbit/LoxBundle/Entity/*.php
%{_datadir}/localbox/src/Libbit/LoxBundle/EventListener/*.php
%{_datadir}/localbox/src/Libbit/LoxBundle/Event/*.php
%{_datadir}/localbox/src/Libbit/LoxBundle/Namer/*.php
%{_datadir}/localbox/src/Libbit/LoxBundle/Notification/Type/*.php
%{_datadir}/localbox/src/Libbit/LoxBundle/*.php
%{_datadir}/localbox/src/Libbit/LoxBundle/phpunit.xml.dist
%{_datadir}/localbox/src/Libbit/LoxBundle/README.md
%{_datadir}/localbox/src/Libbit/LoxBundle/Resources/config/*.xml
%{_datadir}/localbox/src/Libbit/LoxBundle/Resources/config/*.yml
%{_datadir}/localbox/src/Libbit/LoxBundle/Resources/public/css/*.css
%{_datadir}/localbox/src/Libbit/LoxBundle/Resources/public/icons/favicon.png
%{_datadir}/localbox/src/Libbit/LoxBundle/Resources/public/icons/files/icons.ai
%{_datadir}/localbox/src/Libbit/LoxBundle/Resources/public/icons/files/icons.png
%{_datadir}/localbox/src/Libbit/LoxBundle/Resources/public/icons/files/icons.pdf
%{_datadir}/localbox/src/Libbit/LoxBundle/Resources/public/icons/files/LICENSE
%{_datadir}/localbox/src/Libbit/LoxBundle/Resources/public/icons/files/README.md
%{_datadir}/localbox/src/Libbit/LoxBundle/Resources/public/icons/files/*/*.png
%{_datadir}/localbox/src/Libbit/LoxBundle/Resources/public/icons/folders/*/*.png
%{_datadir}/localbox/src/Libbit/LoxBundle/Resources/public/icons/folders/ReadMe.rtf
%{_datadir}/localbox/src/Libbit/LoxBundle/Resources/public/js/*/*.js
%{_datadir}/localbox/src/Libbit/LoxBundle/Resources/public/js/*/lang/*.js
%{_datadir}/localbox/src/Libbit/LoxBundle/Resources/public/logo/*png
%{_datadir}/localbox/src/Libbit/LoxBundle/Resources/translations/*.xliff
%{_datadir}/localbox/src/Libbit/LoxBundle/Resources/views/Exception/*.twig
%{_datadir}/localbox/src/Libbit/LoxBundle/Resources/views/*.twig
%{_datadir}/localbox/src/Libbit/LoxBundle/Resources/views/Web/*.twig
%{_datadir}/localbox/src/Libbit/LoxBundle/Tests/autoload.php.dist
%{_datadir}/localbox/src/Libbit/LoxBundle/Tests/Entity/*.php
%{_datadir}/localbox/src/Libbit/LoxBundle/Tests/Functional/Fixtures/*.pdf
%{_datadir}/localbox/src/Libbit/LoxBundle/Tests/Functional/Fixtures/*.pem
%{_datadir}/localbox/src/Libbit/LoxBundle/Tests/Functional/Fixtures/*.txt
%{_datadir}/localbox/src/Libbit/LoxBundle/Tests/Functional/*.php
%{_datadir}/localbox/src/Libbit/LoxBundle/Tests/*.php
%{_datadir}/localbox/web/.htaccess
%{_datadir}/localbox/web/logo/logo_title.png
%{_datadir}/localbox/web/*.php
%{_datadir}/localbox/web/robots.txt
%{_datadir}/localbox/web/uploads/products/logo_title.png
%doc
%{_defaultdocdir}/localbox/README.md
%{_defaultdocdir}/localbox/LICENSE

%files doxygen-refman
#%{_defaultdocdir}/localbox/html/*

%changelog

