Upgrade instructions
====================

## 1.0 to 1.1

### Modules

* Module `rednose-nav-container` has been renamed to `rednose-widget-nav-container`.

* The `NAME` property of module `rednose-app-base` has been renamed from `rednose-app` to `app`, event prefixes should be updated.

* The `NAME` property of module `rednose-view-nav` has been renamed from `nav` to `viewNav`, event prefixes should be updated.

* The `NAME` property of module `rednose-widget-nav-container` (previously `rendose-nav-container`) has been renamed from `nav` to `navContainer`, event prefixes should be updated.

* Module `rednose-dialog` has been refactored and has a complete new API.

### CSS

* CSS now depends on having Bootstrap globally available. The CSS classes `rednose-ui` and `rednose-widget` are deprecated within the Bootstrap skinning context.

* The magic CSS class assignment in module `rednose-view-nav` has changed to dashed formatting, for example from `rednose-fileTableView` to `rednose-file-table-view`.

* Module `rednose-css` has been removed.
