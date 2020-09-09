/**
 * @category  Koene
 * @package   Koene_GraphQl
 * @author    Deniss Dubinins <denissd@scandiweb.com>
 * @copyright Copyright (c) 2020 Scandiweb, Inc (https://scandiweb.com)
 * @license   http://opensource.org/licenses/OSL-3.0 The Open Software License 3.0 (OSL-3.0)
 */

import { fetchQuery } from 'Util/Request';
import AdyenAPI from '../util/Adyen/API';
import { CREDIT_CARD_TYPE } from '../component/AdyenCard/AdyenCard.container';
import { ADYEN_CC, ADYEN_HPP } from './CheckoutPayments.plugin';
import AdyenQuery from '../query/Adyen.query';

class CheckoutPaymentsContainerPlugin {
    state = {
        paymentMethodConfig: {},
        paymentMethodData: {},
        isAdyenLoaded: false
    };

    aroundCollectAdditionalData = (args, callback = () => {}, instance) => {
        const { selectedPaymentCode } = instance.state;
        const additionalDataGetter = instance.dataMap[selectedPaymentCode];

        if (!additionalDataGetter) {
            return {};
        }

        return additionalDataGetter(instance);
    };

    aroundComponentDidMount = (args, callback = () => {}, instance) => {
        this.initializeAdyen().then((result) => {
            this.setPaymentMethodConfig(result, instance)
            instance.setState({ isAdyenLoaded: true });
        });

        callback.apply(instance, args);
    }

    aroundDataMap = (originalMember) => {
        return {
            ...originalMember,
            [ADYEN_CC]: this.getAdyenData.bind(this),
            [ADYEN_HPP]: this.getIdealData.bind(this)
        };
    };

    containerFunctions = (originalMember, instance) => ({
        ...originalMember,
        setPaymentMethodData(data) {
            const { selectedPaymentCode } = instance.state;
            instance.setState(({ paymentMethodData }) => ({
                paymentMethodData: {
                    ...paymentMethodData,
                    [selectedPaymentCode]: data
                }
            }));
        },
        setIdealState(data) {
            instance.setState(() => ({ idealState: data }))
        }
    });

    /**
     * iDEAL payment method pipeline
     * @param {object} instance
     */
    async getIdealData(instance) {
        const { idealState } = instance.state;
        const { adyen } = window;

        const action = await AdyenAPI.makePayment(idealState);
        adyen.createFromAction(action).mount('#AdyenRedirect');
    }

    getAdyenData(instance) {
        const { paymentMethodData: { [ADYEN_CC]: asyncData = {} } } = instance.state;

        return { asyncData };
    }

    setPaymentMethodConfig(paymentMethodConfig, instance) {
        instance.setState({ paymentMethodConfig });
    }

    initializeAdyen = async () => {
        const queries = [
            AdyenQuery.getConfig(),
            AdyenQuery.getPaymentMethods()
        ];

        const { getAdyenConfig, getAdyenPaymentMethods } = await fetchQuery(queries);

        const paymentMethodsResponse = await AdyenAPI.getPaymentMethods();

        const paymentMethod = getAdyenPaymentMethods.find(({ type }) => type === CREDIT_CARD_TYPE) || {};

        const {
            originKey,
            mode: environment,
            locale
        } = getAdyenConfig || {};

        const script = document.createElement('script');
        script.setAttribute('src', `https://checkoutshopper-${ environment }.adyen.com/checkoutshopper/sdk/3.6.1/adyen.js`);
        script.setAttribute('crossorigin', 'anonymous');
        script.addEventListener('load', () => {
            const { AdyenCheckout } = window;

            window.adyen = new AdyenCheckout({
                paymentMethodsResponse,
                locale,
                environment,
                originKey
            });
        });

        const link = document.createElement('link');
        link.setAttribute('rel', 'stylesheet');
        link.setAttribute('href', `https://checkoutshopper-${ environment }.adyen.com/checkoutshopper/sdk/3.6.1/adyen.css`);
        link.setAttribute('crossorigin', 'anonymous');

        document.body.prepend(script);
        document.head.append(link);

        return { paymentMethod };
    }
}

const {
    aroundCollectAdditionalData,
    aroundDataMap,
    aroundComponentDidMount,
    containerFunctions
} = new CheckoutPaymentsContainerPlugin();

const config = {
    'Component/CheckoutPayments/Container': {
        'member-property': {
            'dataMap': aroundDataMap,
            'containerFunctions': containerFunctions
        },
        'member-function': {
            'componentDidMount': aroundComponentDidMount,
            'collectAdditionalData': aroundCollectAdditionalData
        }
    }
};

export default config;
