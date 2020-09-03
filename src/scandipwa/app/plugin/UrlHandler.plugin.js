/**
 * @category  Koene
 * @package   Koene_AdyenGraphQl
 * @author    Ivans Zuks <info@scandiweb.com>
 * @copyright Copyright (c) 2020 Scandiweb, Inc (https://scandiweb.com)
 * @license   http://opensource.org/licenses/OSL-3.0 The Open Software License 3.0 (OSL-3.0)
 */

class UrlHandlerPlugin {
    getBypassCacheHosts = (args, callback, instance) => ([
        ...callback.apply(instance, args),
        '(?!^.*/adyen/.*)'
    ])
}

const { getBypassCacheHosts } = new UrlHandlerPlugin();

const config = {
    'SW/Handler/UrlHandler/getBypassCacheHosts': {
        'function': [
            {
                position: 92,
                implementation: getBypassCacheHosts
            }
        ]
    }
}

export default config;
