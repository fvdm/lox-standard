<?php

namespace Rednose\ApiDocBundle;

use Symfony\Component\HttpKernel\Bundle\Bundle;

class RednoseApiDocBundle extends Bundle
{
    public function getParent()
    {
        return 'NelmioApiDocBundle';
    }
}
