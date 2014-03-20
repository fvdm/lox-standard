<?php

namespace Rednose\YuiBundle\DependencyInjection;

use Symfony\Component\DependencyInjection\ContainerBuilder;
use Symfony\Component\Config\FileLocator;
use Symfony\Component\HttpKernel\DependencyInjection\Extension;
use Symfony\Component\DependencyInjection\Loader;

class RednoseYuiExtension extends Extension
{
    /**
     * {@inheritDoc}
     */
    public function load(array $configs, ContainerBuilder $container)
    {
        $configuration = new Configuration();
        $config = $this->processConfiguration($configuration, $configs);

        foreach ($config as $k => $v) {
            $container->setParameter($this->getAlias().'.'.$k, $v);
        }
    }

    /**
     * {@inheritDoc}
     */
    public function getAlias()
    {
        return 'rednose_yui';
    }
}
