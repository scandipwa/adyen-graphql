/**
 * @category  Koene
 * @package   Koene_SocialLogin
 * @author    Ivans Zuks <info@scandiweb.com>
 * @copyright Copyright (c) 2020 Scandiweb, Inc (https://scandiweb.com)
 * @license   http://opensource.org/licenses/OSL-3.0 The Open Software License 3.0 (OSL-3.0)
 */

import { CheckoutDispatcher } from '../store/Checkout';

export class CheckoutStatePlugin {
    mapDispatchToProps = (args, callback, instance) => {
        const [dispatch] = args;

        return {
            ...callback.apply(instance, args),
            updateCheckoutState: (payload) => CheckoutDispatcher.updateCheckoutState(dispatch, payload)
        }
    };

    mapStateToProps = (args, callback, instance) => {
        const [state] = args;

        return {
            ...callback.apply(instance, args),
            isProcessed: state.CheckoutReducer.isProcessed,
            incrementId: state.CheckoutReducer.incrementId
        }
    };
}

export const { mapDispatchToProps, mapStateToProps } = new CheckoutStatePlugin();

const config = {
    'Route/Checkout/Container/mapDispatchToProps': {
        function: [
            {
                position: 10,
                implementation: mapDispatchToProps
            }
        ]
    },
    'Route/Checkout/Container/mapStateToProps': {
        function: [
            {
                position: 100,
                implementation: mapStateToProps
            }
        ]
    },
}

export default config;
