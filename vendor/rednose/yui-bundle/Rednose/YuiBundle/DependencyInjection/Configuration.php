<?php

namespace Rednose\YuiBundle\DependencyInjection;

use Symfony\Component\Config\Definition\Builder\TreeBuilder;
use Symfony\Component\Config\Definition\ConfigurationInterface;

class Configuration implements ConfigurationInterface
{
    /**
     * {@inheritDoc}
     */
    public function getConfigTreeBuilder()
    {
        $treeBuilder = new TreeBuilder();
        $rootNode = $treeBuilder->root('rednose_yui');

        $rootNode
            ->children()
                ->scalarNode('loader_bin')->defaultValue(__DIR__.'/../Resources/node_modules/.bin/yui-loader')->end()
                ->scalarNode('yogi_bin')->defaultValue(__DIR__.'/../Resources/node_modules/.bin/yogi')->end()
                ->arrayNode('groups')
                    ->prototype('array')
                        ->children()
                            ->scalarNode('name')->isRequired()->end()
                            ->scalarNode('root')->isRequired()->end()
                        ->end()
                    ->end()
                ->end()
                ->arrayNode('bundles')
                    ->prototype('array')
                        ->children()
                            ->scalarNode('name')->isRequired()->end()
                            ->scalarNode('modules')->isRequired()->end()
                        ->end()
                    ->end()
                ->end()
            ->end();

        return $treeBuilder;
    }
}
