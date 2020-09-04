/**
 * @category  Koene
 * @package   Koene_GraphQl
 * @author    Deniss Dubinins <denissd@scandiweb.com>
 * @copyright Copyright (c) 2020 Scandiweb, Inc (https://scandiweb.com)
 * @license   http://opensource.org/licenses/OSL-3.0 The Open Software License 3.0 (OSL-3.0)
 */

import AdyenCard from '../component/AdyenCard';
import AdyenIdeal from '../component/AdyenIdeal';
import CheckoutPayment from "Component/CheckoutPayment/CheckoutPayment.component";

export const ADYEN_CC = 'adyen_cc';
export const ADYEN_HPP = 'adyen_hpp';

class CheckoutPaymentsPlugin {
    aroundPaymentRenderMap = (originalMember) => {
        return {
            ...originalMember,
            [ADYEN_CC]: this.renderAdyenCard.bind(this),
            [ADYEN_HPP]: this.renderAdyenIdeal.bind(this)
        }
    }

    renderAdyenCard(props) {
        const {
            paymentMethodConfig: config = {},
            setPaymentMethodData
        } = props;

        return (
            <AdyenCard
                config={ config }
                setPaymentMethodData={ setPaymentMethodData }
            />
        );
    }

    renderAdyenIdeal(props) {
        const { setIdealState } = props;
        return <AdyenIdeal { ...props } setIdealState={ setIdealState } />
    }

    aroundRenderSelectedPayment = (args, callback = () => {}, instance) => {
        const { selectedPaymentCode } = instance.props;
        const render = instance.paymentRenderMap[selectedPaymentCode];

        if (!render) {
            return null;
        }

        return render(instance.props);
    }

    aroundRenderPayment = (args, callback = () => {}, instance) => {
        const {
            selectPaymentMethod,
            selectedPaymentCode,
            isAdyenLoaded
        } = instance.props;

        const method = args[0];
        const { code } = method;
        const isSelected = selectedPaymentCode === code;

        if ((code === ADYEN_CC || code === ADYEN_HPP) && !isAdyenLoaded) {
            return;
        }

        return (
            <CheckoutPayment
                key={ code }
                isSelected={ isSelected }
                method={ method }
                onClick={ selectPaymentMethod }
            />
        );
    };
}

const {
    aroundPaymentRenderMap,
    aroundRenderPayment,
    aroundRenderSelectedPayment
} = new CheckoutPaymentsPlugin();

const config = {
    'Component/CheckoutPayments/Component': {
        'member-property': {
            'paymentRenderMap': aroundPaymentRenderMap
        },
        'member-function': {
            'renderSelectedPayment': aroundRenderSelectedPayment,
            'renderPayment': aroundRenderPayment
        }
    }
};

export default config;
