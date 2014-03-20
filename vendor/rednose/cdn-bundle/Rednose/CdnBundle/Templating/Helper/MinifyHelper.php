<?php

/*
 * This file is part of the RednoseCdnBundle package.
 *
 * (c) RedNose <info@rednose.nl>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace Rednose\CdnBundle\Templating\Helper;

use Symfony\Component\Templating\Helper\Helper;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Helper class for the Minifier
 */
class MinifyHelper extends Helper
{
    protected $container;

   /**
     * Constructor
     *
     * @param \Symfony\Component\DependencyInjection\ContainerInterface $container Service container
     */
    public function __construct(ContainerInterface $container)
    {
        $this->container = $container;
    }

    /**
     * Returns a formatted URL for the Minifier.
     *
     * @param string|array $paths    One or more paths
     * @param string       $basePath An optional basepath to prepend to all assets
     *
     * @return string A public path
     */
    public function getUrl($paths, $basePath = null)
    {
        $parameters = array();

        if (is_array($paths) === false) {
            $paths = array($paths);
        }

        $minUrl = $this->container->get('router')->generate('rednose_cdn_combo');

        foreach ($paths as &$path) {
            if ($basePath !== null) {
                $path = $basePath . '/' . $path;
            }

            $files[] = $path;
        }

        $files = implode(',', $paths);

        return $minUrl . '?' . $files;
    }

    /**
     * {@inheritdoc}
     */
    public function getName()
    {
        return 'minify';
    }

    protected function getFullUrl($path)
    {
        return trim($this->container->get('templating.helper.assets')->getUrl($path), '/');
    }
}
