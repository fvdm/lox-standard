<?php

namespace Rednose\YuiBundle\Driver;

use Symfony\Component\Process\Process;

/**
 * Binary driver for the YUI loader.
 */
class YuiLoaderDriver
{
    /**
     * @var string
     */
    protected $loader;

    /*
     * Constructor.
     *
     * @param string $path
     */
    public function __construct($loader)
    {
        $this->loader = $loader;
    }

    /**
     * @param string $module
     * @param string $config
     *
     * @return string
     *
     * @throws \RuntimeException
     */
    public function getPackage($module, $config)
    {
        $configFile = sys_get_temp_dir().'/'.'config.json';
        $jsFile     = sys_get_temp_dir().'/'.'module.js';

        file_put_contents($configFile, $config);

        $process = new Process($this->loader.' --out '.$jsFile.' --config '.$configFile.' --module '.$module);
        $process->run();

        if (!$process->isSuccessful()) {
            throw new \RuntimeException($process->getErrorOutput());
        }

        $js = file_get_contents($jsFile);

        unlink($jsFile);

        return $js;
    }
}
