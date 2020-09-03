/**
 * @category  Koene
 * @package   Koene_GraphQl
 * @author    Deniss Dubinins <denissd@scandiweb.com>
 * @copyright Copyright (c) 2020 Scandiweb, Inc (https://scandiweb.com)
 * @license   http://opensource.org/licenses/OSL-3.0 The Open Software License 3.0 (OSL-3.0)
 */

import Adyen from '../component/Adyen';
import CheckoutPayment from "Component/CheckoutPayment/CheckoutPayment.component";

export const ADYEN_CC = 'adyen_cc';

class CheckoutPaymentsPlugin {
    aroundPaymentRenderMap = (originalMember) => {
        return {
            ...originalMember,
            [ADYEN_CC]: this.renderAdyen.bind(this)
        }
    }

    renderAdyen(props) {
        const {
            paymentMethodConfig: config = {},
            setPaymentMethodData
        } = props;

        return (
            <Adyen
                config={ config }
                setPaymentMethodData={ setPaymentMethodData }
            />
        );
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

        if (code === ADYEN_CC && !isAdyenLoaded) {
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
