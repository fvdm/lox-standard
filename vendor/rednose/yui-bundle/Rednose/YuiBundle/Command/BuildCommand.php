<?php

namespace Rednose\YuiBundle\Command;

use Rednose\YuiBundle\Controller\YuiController;
use Symfony\Bundle\FrameworkBundle\Command\ContainerAwareCommand;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Filesystem\Filesystem;

class BuildCommand extends ContainerAwareCommand
{
    protected function configure()
    {
        $this
            ->setName('rednose:yui:build')
            ->setDescription('Builds the YUI configuration.')
            ->addArgument('baseUrl', InputArgument::REQUIRED, 'The base URL');
        ;
    }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
        $container  = $this->getContainer();
        $controller = new YuiController;

        $controller->setContainer($container);
        $controller->build($input->getArgument('baseUrl'));
    }
}
