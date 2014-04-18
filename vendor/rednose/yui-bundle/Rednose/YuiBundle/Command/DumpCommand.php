<?php

namespace Rednose\YuiBundle\Command;

use Symfony\Bundle\FrameworkBundle\Command\ContainerAwareCommand;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Filesystem\Filesystem;
use Rednose\YuiBundle\Builder\ConfigBuilder;
use Symfony\Component\HttpKernel\Kernel;

class DumpCommand extends ContainerAwareCommand
{
    protected function configure()
    {
        $this
            ->setName('rednose:yui:dump')
            ->setDescription('Dumps the YUI configuration.')
            ->addArgument('baseUrl', InputArgument::OPTIONAL, 'The base URL');
        ;
    }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
        $output->writeln(sprintf('Writing the YUI config for the <info>%s</info> environment', $this->getKernel()->getEnvironment()));

        $this->getConfigBuilder()->cacheConfig($input->getArgument('baseUrl'));
    }

    /**
     * @return Kernel
     */
    protected function getKernel()
    {
        return $this->getContainer()->get('kernel');
    }

    /**
     * @return ConfigBuilder
     */
    protected function getConfigBuilder()
    {
        return $this->getContainer()->get('rednose_yui.builder.config_builder');
    }
}
