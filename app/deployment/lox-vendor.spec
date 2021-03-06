Name:		localbox-dependencies
BuildArch: noarch
Version:	1.1.1
Release:	1%{?dist}
Summary:	'Vendor' dependencies for Localbox
Group:		Applications/Publishing
License:	EUGPL
URL:		http://www.libbit.eu/nl/producten-nl/localbox
Source0:	vendor.tar.bz2

#BuildRequires:	
#Requires:	

%description

Een nieuwe ontwikkeling betreft LocalBox; een door de overheid gewenst
Dropbox alternatief, veilig, toepasbaar in private cloud omgevingen en
te gebruiken vanaf verschillende devices (iPad, Android en Windows
desktops). 

%prep
%setup -q -n vendor

%build
#doxygen Doxyfile

%install
mkdir -p ${RPM_BUILD_ROOT}%{_datadir}/localbox/vendor
mv composer.lock ${RPM_BUILD_ROOT}%{_datadir}/localbox
cp -pr * ${RPM_BUILD_ROOT}%{_datadir}/localbox/vendor/

%files
%{_datadir}/localbox/composer.lock
%{_datadir}/localbox/vendor/*

%doc
#%{_defaultdocdir}/localbox/html/*.md5
#%{_defaultdocdir}/localbox/html/*.map
#%{_defaultdocdir}/localbox/html/*.svg
#%{_defaultdocdir}/localbox/html/*.html
#%{_defaultdocdir}/localbox/html/*.js
#%{_defaultdocdir}/localbox/html/*.png
#%{_defaultdocdir}/localbox/html/search/*.html
#%{_defaultdocdir}/localbox/html/search/*.js

%changelog

