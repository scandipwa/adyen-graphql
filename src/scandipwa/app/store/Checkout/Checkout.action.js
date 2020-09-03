/**
 * @category  Koene
 * @package   Koene_AdyenGraphQl
 * @author    Ivans Zuks <info@scandiweb.com>
 * @copyright Copyright (c) 2020 Scandiweb, Inc (https://scandiweb.com)
 * @license   http://opensource.org/licenses/OSL-3.0 The Open Software License 3.0 (OSL-3.0)
 */

export const UPDATE_CHECKOUT_STATUS = 'UPDATE_CHECKOUT_STATUS';
export const UPDATE_CHECKOUT_STATE = 'UPDATE_CHECKOUT_STATE';
export const UPDATE_PAYMENT_METHODS = 'UPDATE_PAYMENT_METHODS';
export const UPDATE_PAYMENT_TOTALS = 'UPDATE_PAYMENT_TOTALS';
export const UPDATE_SHIPPING_METHODS = 'UPDATE_SHIPPING_METHODS';
export const UPDATE_SHIPPING_ADDRESS = 'UPDATE_SHIPPING_ADDRESS';
export const UPDATE_IS_SAME_AS_SHIPPING = 'UPDATE_IS_SAME_AS_SHIPPING';

/**
 * Update checkout loading status
 * @param {Object} status
 */
export const updateCheckoutStatus = status => ({
    type: UPDATE_CHECKOUT_STATUS,
    status
});

/**
 * Update checkout state
 * @param {Object} state
 */
export const updateCheckoutState = state => ({
    type: UPDATE_CHECKOUT_STATE,
    state
});

/**
 * Update checkout payment totals
 * @param {Object} totals
 */
export const updatePaymentTotals = totals => ({
    type: UPDATE_PAYMENT_TOTALS,
    totals
});

/**
 * Update checkout shipping methods
 * @param {Object} shippingMethods
 */
export const updateShippingMethods = shippingMethods => ({
    type: UPDATE_SHIPPING_METHODS,
    shippingMethods
});

/**
 * Update checkout shipping address
 * @param {Object} shippingAddress
 */
export const updateShippingAddress = shippingAddress => ({
    type: UPDATE_SHIPPING_ADDRESS,
    shippingAddress
});

/**
 * Update isSameAsShipping state
 * @param {Boolean} isSameAsShipping
 */
export const updateIsSameAsShipping = isSameAsShipping => ({
    type: UPDATE_IS_SAME_AS_SHIPPING,
    isSameAsShipping
});
