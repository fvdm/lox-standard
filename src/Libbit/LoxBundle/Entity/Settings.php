<?php

namespace Libbit\LoxBundle\Entity;

use FOS\UserBundle\Entity\Group as BaseGroup;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\HttpFoundation\File\UploadedFile;

/**
 *  Localbox Settings
 *
 * @ORM\Entity
 * @ORM\Table(name="libbit_lox_settings")
 */
class Settings
{
    /**
     * @ORM\Id
     * @ORM\Column(type="string", nullable=false)
     */
    protected $application_title = "LocalBox";

    /**
     * @ORM\Column(type="string", nullable=false)
     */
    protected $application_logo = "bundles/libbitlox/logo/whitebox.png";

    /**
     * @ORM\Column(type="string", nullable=false)
     */
    protected $app_backcolor = "#1B1B1B";

    /**
     * @ORM\Column(type="string", nullable=false)
     */
    protected $app_fontcolor = "#999999";

    public function __toString()
    {
        return (string) $this->application_title;
    }

    /**
     * Set application_title
     *
     * @param string $applicationTitle
     * @return Settings
     */
    public function setApplicationTitle($applicationTitle)
    {
        $this->application_title = $applicationTitle;

        return $this;
    }

    /**
     * Get application_title
     *
     * @return string
     */
    public function getApplicationTitle()
    {
        return $this->application_title;
    }

    /**
     * Set application_logo
     *
     * @param string $applicationLogo
     * @return Settings
     */
    public function setApplicationLogo($applicationLogo)
    {
        $this->application_logo = $applicationLogo;

        return $this;
    }

    /**
     * Get application_logo
     *
     * @return string
     */
    public function getApplicationLogo()
    {
        return $this->application_logo;
    }

    /**
     * Set app_backcolor
     *
     * @param string $appBackcolor
     * @return Settings
     */
    public function setAppBackcolor($appBackcolor)
    {
        $this->app_backcolor = $appBackcolor;

        return $this;
    }

    /**
     * Get app_backcolor
     *
     * @return string
     */
    public function getAppBackcolor()
    {
        return $this->app_backcolor;
    }

    /**
     * Set app_fontcolor
     *
     * @param string $appFontcolor
     * @return Settings
     */
    public function setAppFontcolor($appFontcolor)
    {
        $this->app_fontcolor = $appFontcolor;

        return $this;
    }

    /**
     * Get app_fontcolor
     *
     * @return string
     */
    public function getAppFontcolor()
    {
        return $this->app_fontcolor;
    }
}
