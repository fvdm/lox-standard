RednoseLoxBundle
==================

## Installation ##

Add this bundle to your `composer.json` file:

    {
        "require": {
            "rednose/lox-bundle": "dev-master"
        }
    }

Register the bundle in `app/AppKernel.php`:

    // app/AppKernel.php
    public function registerBundles()
    {
        return array(
            // ...
            new Rednose\LoxBundle\RednoseLoxBundle(),
        );
    }
