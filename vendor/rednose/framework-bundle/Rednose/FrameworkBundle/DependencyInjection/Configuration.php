<?php

namespace Rednose\FrameworkBundle\DependencyInjection;

use Symfony\Component\Config\Definition\Builder\TreeBuilder;
use Symfony\Component\Config\Definition\Builder\ArrayNodeDefinition;
use Symfony\Component\Config\Definition\ConfigurationInterface;


/**
 * Configuration for this bundle.
 */
class Configuration implements ConfigurationInterface
{
    /**
     * {@inheritdoc}
     */
    public function getConfigTreeBuilder()
    {
        $treeBuilder = new TreeBuilder();
        $rootNode    = $treeBuilder->root('rednose_framework', 'array');

        $this->addOauthSection($rootNode);
        $this->addAclSection($rootNode);
        $this->addAccountSection($rootNode);

        return $treeBuilder;
    }

    private function addOauthSection(ArrayNodeDefinition $node)
    {
        $node
            ->children()
                ->booleanNode('oauth')->defaultFalse()->end()
            ->end();
    }

    private function addAclSection(ArrayNodeDefinition $node)
    {
        $node
            ->children()
                ->booleanNode('acl')->defaultFalse()->end()
            ->end();
    }

    private function addAccountSection(ArrayNodeDefinition $node)
    {
        $node
            ->children()
                ->booleanNode('auto_account_creation')->defaultFalse()->end()
            ->end();
    }
}
