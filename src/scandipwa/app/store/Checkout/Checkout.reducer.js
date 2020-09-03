/**
 * @category  Koene
 * @package   Koene_AdyenGraphQl
 * @author    Ivans Zuks <info@scandiweb.com>
 * @copyright Copyright (c) 2020 Scandiweb, Inc (https://scandiweb.com)
 * @license   http://opensource.org/licenses/OSL-3.0 The Open Software License 3.0 (OSL-3.0)
 */

import BrowserDatabase from 'Util/BrowserDatabase';
import { PAYMENT_TOTALS } from './Checkout.dispatcher';
import {
    UPDATE_CHECKOUT_STATUS,
    UPDATE_PAYMENT_METHODS,
    UPDATE_PAYMENT_TOTALS,
    UPDATE_SHIPPING_METHODS,
    UPDATE_SHIPPING_ADDRESS,
    UPDATE_CHECKOUT_STATE,
    UPDATE_IS_SAME_AS_SHIPPING
} from './Checkout.action';

export const initialState = {
    isLoading: false,
    isDeliveryOptionsLoading: false,
    isPaymentMethodsLoading: false,
    paymentMethods: [],
    adyenMethods: [],
    totals: BrowserDatabase.getItem(PAYMENT_TOTALS) || {},
    shippingMethods: [],
    shippingAddress: {},
    orderId: '',
    threeDS2: false,
    challengeType: '',
    challengeToken: '',
    redirectUrl: '',
    selectedShippingMethod: {},
    selectedAddressId: 0,
    selectedBillingId: 0,
    selectedPaymentMethod: {},
    isSameAsShipping: true,
    isProcessed: false,
    incrementId: ''
};

const getFormatedState = (state) => {
    const stateKeys = Object.keys(initialState);

    return Object.entries(state).reduce((formatedState, [key, value]) => {
        if (stateKeys.indexOf(key) === -1) {
            return formatedState;
        }

        return {
            ...formatedState,
            [key]: value
        };
    }, {});
};

const CheckoutReducer = (state = initialState, action) => {
    const {
        status,
        state: newState,
        paymentMethods,
        totals,
        shippingMethods,
        shippingAddress,
        isSameAsShipping
    } = action;

    switch (action.type) {
    case UPDATE_CHECKOUT_STATUS:
        return {
            ...state,
            ...status
        };

    case UPDATE_CHECKOUT_STATE:
        return {
            ...state,
            ...getFormatedState(newState)
        };

    case UPDATE_PAYMENT_METHODS:
        return {
            ...state,
            paymentMethods
        };

    case UPDATE_PAYMENT_TOTALS:
        return {
            ...state,
            totals
        };

    case UPDATE_SHIPPING_METHODS:
        return {
            ...state,
            shippingMethods
        };

    case UPDATE_SHIPPING_ADDRESS:
        return {
            ...state,
            shippingAddress
        };

    case UPDATE_IS_SAME_AS_SHIPPING:
        return {
            ...state,
            isSameAsShipping
        };

    default:
        return state;
    }
};

export default CheckoutReducer;
