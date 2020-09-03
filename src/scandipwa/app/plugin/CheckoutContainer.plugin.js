/**
 * @category  Koene
 * @package   Koene_GraphQl
 * @author    Ivans Zuks <denissd@scandiweb.com>
 * @copyright Copyright (c) 2020 Scandiweb, Inc (https://scandiweb.com)
 * @license   http://opensource.org/licenses/OSL-3.0 The Open Software License 3.0 (OSL-3.0)
 */

import { ADYEN_CC } from './CheckoutPayments.plugin';
import { isSignedIn } from 'Util/Auth';
import { fetchMutation } from 'Util/Request';
import CheckoutQuery from 'Query/Checkout.query';
import BrowserDatabase from 'Util/BrowserDatabase';
import { GUEST_QUOTE_ID } from 'Store/Cart';
import { DETAILS_STEP } from 'Route/Checkout/Checkout.component';
import { CART_TAB } from 'Component/NavigationTabs/NavigationTabs.component';
import { PAYMENT_TOTALS } from 'Route/Checkout/Checkout.container';

class CheckoutContainerPlugin {
    aroundComponentDidUpdate = (args, callback = () => {}, instance) => {
        const { isProcessed = false, incrementId } = instance.props;
        const { checkoutStep } = instance.state;

        if (isProcessed && checkoutStep !== DETAILS_STEP) {
            instance.setState({
                isLoading: false,
                paymentTotals: {},
                checkoutStep: DETAILS_STEP,
                orderID: incrementId
            });
        }
    }

    aroundSavePaymentMethodAndPlaceOrder = async (args, callback = () => {}, instance) => {
        const { paymentMethod: { code, additional_data } } = args[0];
        const guest_cart_id = !isSignedIn() ? instance._getGuestCartId() : '';

        try {
            await fetchMutation(CheckoutQuery.getSetPaymentMethodOnCartMutation({
                guest_cart_id,
                payment_method: {
                    code, [( code === ADYEN_CC ? 'additional_data' : code )]: additional_data
                }
            }));

            const orderData = await fetchMutation(CheckoutQuery.getPlaceOrderMutation(guest_cart_id));

            const {
                placeOrder: {
                    order: {
                        id,
                        order_id: increment_id,
                        redirectUrl,
                        threeDS2,
                        type: challengeType,
                        token: challengeToken
                    }
                }
            } = orderData;

            const additionalData = {
                redirectUrl,
                threeDS2,
                challengeType,
                challengeToken
            };

            instance.setDetailsStep(id, additionalData, increment_id);
        } catch (e) {
            instance._handleError(e);
        }
    }

    aroundSetDetailsStep = (args, callback = () => {}, instance) => {
        const { resetCart, setNavigationState, updateCheckoutState } = instance.props;
        const { threeDS2 } = args[1];

        // For some reason not logged in user cart preserves qty in it
        if (!isSignedIn()) {
            BrowserDatabase.deleteItem(GUEST_QUOTE_ID);
        }

        BrowserDatabase.deleteItem(PAYMENT_TOTALS);
        BrowserDatabase.setItem(args[0], 'orderId');

        resetCart();

        const newState = {
            ...args[1],
            orderId: args[0],
            incrementId: args[2]
        }

        updateCheckoutState(newState);

        if (!threeDS2) {
            instance.setState({
                isLoading: false,
                paymentTotals: {},
                checkoutStep: DETAILS_STEP,
                orderID: args[2]
            });
        }

        setNavigationState({
            name: CART_TAB
        });
    }
}

const {
    aroundSavePaymentMethodAndPlaceOrder,
    aroundSetDetailsStep,
    aroundComponentDidUpdate
} = new CheckoutContainerPlugin();

const config = {
    'Route/Checkout/Container': {
        'member-function': {
            'savePaymentMethodAndPlaceOrder':  aroundSavePaymentMethodAndPlaceOrder,
            'setDetailsStep': aroundSetDetailsStep,
            'componentDidUpdate': aroundComponentDidUpdate
        }
    }
};

export default config;
