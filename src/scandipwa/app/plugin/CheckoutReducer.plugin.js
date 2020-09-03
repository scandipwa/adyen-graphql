/**
 * @category  Koene
 * @package   Koene_AdyenGraphQl
 * @author    Ivans Zuks <info@scandiweb.com>
 * @copyright Copyright (c) 2020 Scandiweb, Inc (https://scandiweb.com)
 * @license   http://opensource.org/licenses/OSL-3.0 The Open Software License 3.0 (OSL-3.0)
 */

import { CheckoutReducer } from '../store/Checkout';

class CheckoutReducerPlugin {
    getReducers = (args, callback, instance) => ({
        ...callback.apply(instance, args),
        CheckoutReducer,
    })
}

const { getReducers } = new CheckoutReducerPlugin();

const config = {
    'Store/Index/getReducers': {
        function: [
            {
                position: 20,
                implementation: getReducers
            }
        ]
    },
}

export default config;
