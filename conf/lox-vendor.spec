Name:		localbox-vendor
BuildArch: noarch
Version:	1.1.5
Release:	rc4%{?dist}
Summary:	'Vendor' dependencies for Localbox
Group:		Applications/Publishing
License:	EUGPL
URL:		http://www.libbit.eu/nl/producten-nl/localbox
Source0:	vendor.tar.bz2
BuildRoot:  %(mktemp -ud %{_tmppath}/%{name}-%{version}-%{release}-XXXXXX)


Obsoletes: localbox-dependencies
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

%clean
rm -rf ${RPM_BUILD_ROOT}

%install
rm -rf ${RPM_BUILD_ROOT}
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

