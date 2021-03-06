<?php

/*
 * This file is part of the RednoseFrameworkBundle package.
 *
 * (c) RedNose <http://www.rednose.nl>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace Rednose\FrameworkBundle\Model;

/**
 * Defines an item's properties in the context of a human interface.
 */
interface ContentDefinitionInterface
{
    const TYPE_TEXT         = 'text';
    const TYPE_TEXTAREA     = 'textarea';
    const TYPE_HTML         = 'html';
    const TYPE_DATE         = 'date';
    const TYPE_DATETIME     = 'datetime';
    const TYPE_DROPDOWN     = 'dropdown';
    const TYPE_RADIO        = 'radio';
    const TYPE_CHECKBOX     = 'checkbox';
    const TYPE_AUTOCOMPLETE = 'autocomplete';
    const TYPE_FILE         = 'file';
}
