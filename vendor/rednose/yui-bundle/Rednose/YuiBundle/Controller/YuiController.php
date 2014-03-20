<?php

namespace Rednose\YuiBundle\Controller;

use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Symfony\Component\Finder\Finder;
use Symfony\Component\Config\FileLocator;
use Symfony\Component\HttpFoundation\File\File;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Config\ConfigCache;
use Symfony\Component\Config\Resource\FileResource;
use Symfony\Component\Config\Resource\DirectoryResource;
use Symfony\Component\Process\Process;
use Symfony\Component\HttpFoundation\Request;

// TODO: Refactor, needs more DRY.

/**
 * Provides a dynamically generated and cached YUI3 config file, containing
 * module metadata and group configuration.
 */
class YuiController extends Controller
{
	const YUI3_JSON_DIR   = 'src/loader/js';
	const YUI3_JSON_FILE  = 'yui3.json';

	const CACHE    = true;
	const GENERATE = true;

	protected $cachePath;

    public function setContainer(ContainerInterface $container = null)
    {
        $this->container = $container;

		$env  = $this->get('kernel')->getEnvironment();
		$base = $this->get('kernel')->getRootDir().'/cache';

        $this->cachePath = $base.'/'.$env.'/rednose_yui';
    }

    /**
     * Returns a YUI3 config JavaScript file.
     *
     * @return Response
     */
    public function configAction()
    {
        /** @var Request $request */
        $request = $this->get('request');
        $baseUrl = str_replace('/app_dev.php', '', $request->getBaseUrl());

    	if (self::CACHE === true) {
	        $cachePath = $this->cachePath.'/config.js';

	        $configCache = new ConfigCache($cachePath, true);

	        if (!$configCache->isFresh()) {
                $this->build($baseUrl);
	        }

	        return new Response(file_get_contents($cachePath), 200, array(
	            'Content-Type' => 'application/javascript'
	        ));
    	}

        return new Response($this->getContent($baseUrl), 200, array(
            'Content-Type' => 'application/javascript'
        ));
    }

    public function build($baseUrl)
    {
        $cachePath = $this->cachePath.'/config.js';

        $configCache = new ConfigCache($cachePath, true);
        $resources = array();

        $config = $this->container->getParameter('rednose_yui.groups');

        foreach ($config as $c) {
            $root = $c['root'];
            $path = $this->get('kernel')->getRootDir().'/../web/'.$root;

            if (self::GENERATE === true) {
                $resources[] = new DirectoryResource($path.'/src', '/\.json$/');
            } else {
                $resources[] = new FileResource($path.'/'.self::YUI3_JSON_DIR.'/'.YUI3_JSON_FILE);
            }
        }

        $configCache->write($this->getContent($baseUrl), $resources);
    }

    /**
     * Returns a YUI3 package containing multiple resolved dependencies.
     *
     * @return Response
     */
    public function packageAction($module)
    {
        /** @var Request $request */
        $request = $this->get('request');
        $baseUrl = str_replace('/app_dev.php', '', $request->getBaseUrl());

        if (self::CACHE === true) {
	        $cachePath = $this->cachePath.'/'.$module.'.js';

	        $configCache = new ConfigCache($cachePath, true);

	        if (!$configCache->isFresh()) {
	            $resources = array();

			   	$config = $this->container->getParameter('rednose_yui.groups');

			   	foreach ($config as $c) {
			   		$root = $c['root'];
	                $path = $this->get('kernel')->getRootDir().'/../web/'.$root;

		            if (self::GENERATE === true) {
			            $resources[] = new DirectoryResource($path.'/src', '/\.json$/');
			        } else {
			            $resources[] = new FileResource($path.'/'.self::YUI3_JSON_DIR.'/'.YUI3_JSON_FILE);
			        }
			   	}

	            $configCache->write($this->getContent($baseUrl, $module), $resources);
	        }

	        return new Response(file_get_contents($cachePath), 200, array(
	            'Content-Type' => 'application/javascript'
	        ));
    	}

        return new Response($this->getContent($baseUrl, $module), 200, array(
            'Content-Type' => 'application/javascript'
        ));
    }

    /**
     * Walks through all configured YUI3 dirs and either loads the yui3.json file
     * or generates the loader metadata.
     *
     * @return Rendered file
     */
    protected function getContent($baseUrl, $module = null)
    {
	   	$config = $this->container->getParameter('rednose_yui.groups');

	   	$groups = array();

	   	foreach ($config as $c) {
   			$name = $c['name'];
   			$root = $c['root'];

            $metadata = null;

            if (self::GENERATE === true) {
                $path = $this->get('kernel')->getRootDir().'/../web/'.$root.'/src';
                $yogi = $this->container->getParameter('rednose_yui.yogi_bin');

				$jsFile    = sys_get_temp_dir().'/'.'yui3.js';
				$jsonFile  = sys_get_temp_dir().'/'.'yui3.json';
				$testsFile = sys_get_temp_dir().'/'.'load-tests.js';

				$process = new Process($yogi.' loader --yes --start '.$path.' -js '.$jsFile.' -json '.$jsonFile.' -tests '.$testsFile);
				$process->run();

				if (!$process->isSuccessful()) {
				    throw new \RuntimeException($process->getErrorOutput());
				}

                $metadata = file_get_contents($jsonFile);

                unlink($jsFile);
                unlink($jsonFile);
                unlink($testsFile);
            } else {
	            // Look for yui3.json loader metadata file.
	            $locator = new FileLocator;

	            try {
	                $path = $locator->locate(self::YUI3_JSON_FILE, $this->get('kernel')->getRootDir().'/../web/'.$root.'/'.self::YUI3_JSON_DIR, true);
	                $metadata = file_get_contents($path);
	            } catch (\Exception $e) {}
            }

	   		$groups[] = array(
				'name'     => $c['name'],
				'root'     => $c['root'],
				'metadata' => $metadata,
   			);
	   	}

	   	if ($module) {
		   	$json = $this->get('templating')->render('RednoseYuiBundle:Yui:config.json.twig', array(
                'groups'  => $groups,
                'local'   => true,
                'base'    => $this->get('kernel')->getRootDir() . '/../web/',
                'baseUrl' => $baseUrl,
            ));

            $loader = $this->container->getParameter('rednose_yui.loader_bin');

			$configFile = sys_get_temp_dir().'/'.'config.json';
			$jsFile     = sys_get_temp_dir().'/'.'module.js';

			file_put_contents($configFile, $json);

			$process = new Process($loader.' loader --out '.$jsFile.' --config '.$configFile.' --module '.$module);
			$process->run();

			if (!$process->isSuccessful()) {
			    throw new \RuntimeException($process->getErrorOutput());
			}

            $js = file_get_contents($jsFile);

            unlink($jsFile);

	        return $js;
	   	}

	   	$json = $this->get('templating')->render('RednoseYuiBundle:Yui:config.json.twig', array(
            'groups'  => $groups,
            'local'   => false,
            'baseUrl' => $baseUrl,
        ));

        return 'YUI_config = '.$json.';';
    }
}
