<?php

namespace Rednose\YuiBundle\DependencyInjection;

use Symfony\Component\DependencyInjection\ContainerBuilder;
use Symfony\Component\Config\FileLocator;
use Symfony\Component\HttpKernel\DependencyInjection\Extension;
use Symfony\Component\DependencyInjection\Loader;
use Symfony\Component\DependencyInjection\Loader\XmlFileLoader;
use Symfony\Component\DependencyInjection\Definition;

class RednoseYuiExtension extends Extension
{
    /**
     * {@inheritDoc}
     */
    public function load(array $configs, ContainerBuilder $container)
    {
        $configuration = new Configuration();
        $config = $this->processConfiguration($configuration, $configs);

        // XXX: Load parameters into the container for backwards compatibility.
        foreach ($config as $k => $v) {
            $container->setParameter($this->getAlias().'.'.$k, $v);
        }

        $loader = new XmlFileLoader($container, new FileLocator(__DIR__.'/../Resources/config'));

        $serviceFiles = array('twig', 'services');

        foreach ($serviceFiles as $basename) {
            $loader->load(sprintf('%s.xml', $basename));
        }

        $bundles = $container->getParameter('kernel.bundles');

        if (!empty($config['yogi_bin'])) {
            $this->loadYogi($config['yogi_bin'], $container);
        }

        if (!empty($config['loader_bin'])) {
            $this->loadYuiLoader($config['loader_bin'], $container);
        }

        if (!empty($config['groups'])) {
            $this->loadConfigBuilder($config['groups'], $container);
        }

        if (!empty($config['bundles'])) {
            $this->loadPackageBuilder($config['bundles'], $container);
        }
    }

    /**
     * @param string           $path
     * @param ContainerBuilder $container
     */
    private function loadYogi($path, ContainerBuilder $container)
    {
        $classParam = '%rednose_yui.driver.yogi.class%';

        $definition = new Definition($classParam, array($path));

        $container->setDefinition('rednose_yui.driver.yogi', $definition);
    }

    /**
     * @param string           $path
     * @param ContainerBuilder $container
     */
    private function loadYuiLoader($path, ContainerBuilder $container)
    {
        $classParam = '%rednose_yui.driver.yui_loader.class%';

        $definition = new Definition($classParam, array($path));

        $container->setDefinition('rednose_yui.driver.yui_loader', $definition);
    }

    /**
     * @param array            $config
     * @param ContainerBuilder $container
     */
    private function loadConfigBuilder(array $config, ContainerBuilder $container)
    {
        $groups = array();

        foreach ($config as $group) {
            $groups[$group['name']] = $group['root'];
        }

        $container->getDefinition('rednose_yui.builder.config_builder')->replaceArgument(3, $groups);
    }

    /**
     * @param array            $config
     * @param ContainerBuilder $container
     */
    private function loadPackageBuilder(array $config, ContainerBuilder $container)
    {
        $packages = array();

        foreach ($config as $package) {
            $packages[$package['name']] = $package['modules'];
        }

        $container->getDefinition('rednose_yui.builder.package_builder')->replaceArgument(2, $packages);
    }

    /**
     * {@inheritDoc}
     */
    public function getAlias()
    {
        return 'rednose_yui';
    }
}
