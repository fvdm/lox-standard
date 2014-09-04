<?php

namespace Libbit\LoxBundle\Admin;

use Sonata\AdminBundle\Admin\Admin;
use Sonata\AdminBundle\Form\FormMapper;
use Sonata\AdminBundle\Datagrid\ListMapper;
use Sonata\AdminBundle\Show\ShowMapper;
use Sonata\AdminBundle\Route\RouteCollection;

class SettingsAdmin extends Admin
{
    protected function configureRoutes(RouteCollection $collection)
    {
        $collection->clearExcept(array('list', 'edit'));
    }

    protected function configureListFields(ListMapper $listMapper)
    {
        $listMapper
            ->addIdentifier('application_title')
            ->addIdentifier('application_logo')
            ->addIdentifier('app_backcolor')
            ->addIdentifier('app_fontcolor')
            ->add('_action', 'actions', array(
                'actions' => array(
                    'edit'   => array(),
                )
            ));
    }

    public function configureShowFields(ShowMapper $showMapper)
    {
        $showMapper
            ->with('General')
                ->add('application_title')
                ->add('application_logo')
                ->add('app_backcolor')
                ->add('app_fontcolor');
    }

    protected function configureFormFields(FormMapper $formMapper)
    {
        $formMapper
            ->with('General')
                ->add('application_title')
                ->add('app_backcolor')
                ->add('app_fontcolor')
                ->add('application_logo')
        ;
    }
}
