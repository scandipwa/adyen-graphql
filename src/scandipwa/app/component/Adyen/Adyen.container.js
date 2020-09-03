/**
 * @category  Koene
 * @package   Koene_GraphQl
 * @author    Deniss Dubinins <denissd@scandiweb.com>
 * @copyright Copyright (c) 2020 Scandiweb, Inc (https://scandiweb.com)
 * @license   http://opensource.org/licenses/OSL-3.0 The Open Software License 3.0 (OSL-3.0)
 */

import { createRef } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Adyen from './Adyen.component';

export const mapStateToProps = () => ({});
export const mapDispatchToProps = () => ({});

export const CREDIT_CARD_TYPE = 'scheme';

export class AdyenContainer extends ExtensiblePureComponent {
    static propTypes = {
        config: PropTypes.shape({
            paymentMethods: PropTypes.object
        }).isRequired,
        setPaymentMethodData: PropTypes.func.isRequired
    };

    state = {
        details: {}
    };

    checkout = {};

    fieldRef = createRef();

    setPaymentMethodData = this.setPaymentMethodData.bind(this);

    componentDidMount() {
        const { adyen } = window;
        const { config: { paymentMethod = {} } } = this.props;
        const { current } = this.fieldRef;
        const { details = [], brands = [] } = paymentMethod;

        const hasHolderName = details.find(({ key }) => key === 'holderName');
        const holderNameRequired = hasHolderName && !hasHolderName.optional;

        if (adyen) {
            adyen.create(CREDIT_CARD_TYPE, {
                type: CREDIT_CARD_TYPE,
                hasHolderName,
                holderNameRequired,
                brands,
                onChange: this.handleChange.bind(this),
                onBrand: this.handleBrand.bind(this)
            }).mount(current);
        }
    }

    setPaymentMethodData(data) {
        const { setPaymentMethodData } = this.props;

        this.setState(
            ({ details }) => ({ details: { ...details, ...data } }),
            () => {
                const { details } = this.state;
                setPaymentMethodData(details);
            }
        );
    }

    handleChange(state) {
        const {
            data: {
                storePaymentMethod,
                paymentMethod,
                browserInfo
            },
            isValid
        } = state;

        if (!isValid) {
            return;
        }

        const details = {
            storeCc: !!storePaymentMethod,
            ...browserInfo,
            ...paymentMethod
        };

        this.setPaymentMethodData(details);
    }

    handleBrand(state) {
        const { brand: cc_type } = state;

        this.setPaymentMethodData({ cc_type });
    }

    render() {
        return (
            <Adyen
                { ...this.props }
                { ...this.state }
                { ...{ checkout: this.checkout, fieldRef: this.fieldRef } }
            />
        );
    }
}

export default connect(
    middleware(mapStateToProps, 'Scandipwa/AdyenGraphQl/Component/Adyen/Container/mapStateToProps'),
    middleware(mapDispatchToProps, 'Scandipwa/AdyenGraphQl/Component/Adyen/Container/mapDispatchToProps')
)(
    middleware(AdyenContainer, 'Scandipwa/AdyenGraphQl/Component/Adyen/Container')
);
