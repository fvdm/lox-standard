<?php

namespace Rednose\YuiBundle\Twig\Extension;

use Symfony\Component\Routing\RouterInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\HttpFoundation\Request;
use Rednose\YuiBundle\Builder\ConfigBuilder;

class ConfigExtension extends \Twig_Extension
{
    /**
     * @var ContainerInterface
     */
    protected $container;

    /**
     * Constructor.
     *
     * Use a provider pattern by injecting the container so we don't create any circular references.
     *
     * @param ContainerInterface $container
     */
    public function __construct(ContainerInterface $container)
    {
        $this->container = $container;
    }

    /**
     * {@inheritdoc}
     */
    public function getFunctions()
    {
        return array(
            'rednose_yui_config' => new \Twig_Function_Method($this, 'getConfig', array('is_safe' => array('html'))),
        );
    }

    /**
     * @return string
     */
    public function getConfig()
    {
        $baseUrl = str_replace('/app_dev.php', '', $this->getRequest()->getBaseUrl());

        return $this->getConfigBuilder()->getConfigObject($baseUrl);
    }

    /**
     * {@inheritdoc}
     */
    public function getName()
    {
        return 'rednose_yui_config';
    }

    /**
     * @return RouterInterface
     */
    protected function getRouter()
    {
        return $this->container->get('router');
    }

    /**
     * @return Request
     */
    protected function getRequest()
    {
        return $this->container->get('request');
    }

    /**
     * @return ConfigBuilder
     */
    protected function getConfigBuilder()
    {
        return $this->container->get('rednose_yui.builder.config_builder');
    }
}
