<?php

/*
 * This file is part of the RednoseCdnBundle package.
 *
 * (c) RedNose <info@rednose.nl>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace Rednose\CdnBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Response;

use Rednose\CdnBundle\Logger\MinifyLogger;
use Rednose\CdnBundle\Exception\Exception;

/**
 * Controller for the Minifier
 */
class MinifyController extends Controller
{
    protected $errorLogger = true;

    protected $cacheFileLocking = true;

    protected $uploaderHoursBehind = 0;

    /**
     * Minify a request of JavaScript/CSS files
     *
     * @return Response
     */
    public function comboAction()
    {
        $errorLogger = $this->errorLogger;
        $cacheFileLocking = $this->cacheFileLocking;
        $uploaderHoursBehind = $this->uploaderHoursBehind;

        \Minify::$uploaderHoursBehind = $uploaderHoursBehind;
        \Minify::setCache('', $cacheFileLocking);

        if ($errorLogger) {
            $errorLogger = MinifyLogger::getInstance(true);
            \Minify_Logger::setLogger($errorLogger);
        }

        ini_set('zlib.output_compression', '0');

        $serveController = new \Minify_Controller_MinApp();
        $this->rewriteRequest();
        $response = \Minify::serve($serveController, $this->getOptions());

        return new Response($response['content'], $response['statusCode'], $response['headers']);
    }

    protected function rewriteRequest()
    {
        $files = array_keys($this->get('request')->query->all());

        foreach ($files as &$file) {
            $file  = str_replace(array('_js', '_css'), array('.js', '.css'), $file);
        }

        $baseUrl = urldecode($this->get('templating.helper.assets')->getUrl(''));

        $_GET = array();

        if ($baseUrl !== '/') {
            if (isset($_GET['b'])) {
                $_GET['b'] .= trim($baseUrl, '/');
            } else {
                $_GET['b'] = trim($baseUrl, '/');
            }
        }

        $_GET['f'] = implode(',', $files);
    }

    protected function getOptions()
    {
        return array(
            // Output an array of data instead of returning headers/content
            'quiet' => true,

            // Allow all files inside the symfony2 root folder to be accessed
            'minApp' => array('allowDirs' => array(
                __DIR__ . '/../../../../../../',
                $_SERVER['DOCUMENT_ROOT']
            )),

            // Don't minify, the script is already minified.
            'minifiers' => array(
                \Minify::TYPE_CSS => '',
                \Minify::TYPE_JS  => '',
            ),
        );
    }
}
