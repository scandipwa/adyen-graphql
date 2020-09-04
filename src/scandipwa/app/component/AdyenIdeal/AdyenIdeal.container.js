/**
 * @category  Koene
 * @package   Koene_GraphQl
 * @author    Deniss Dubinins <denissd@scandiweb.com>
 * @copyright Copyright (c) 2020 Scandiweb, Inc (https://scandiweb.com)
 * @license   http://opensource.org/licenses/OSL-3.0 The Open Software License 3.0 (OSL-3.0)
 */

/* eslint-disable jsx-a11y/label-has-associated-control */
import { createRef } from 'react';
import AdyenIdeal from './AdyenIdeal.component';

export const IDEAL_TYPE = 'ideal';

export class AdyenIdealContainer extends ExtensiblePureComponent {
    fieldRef = createRef();

    handleChange = (state) => {
        const { setIdealState } = this.props;
        setIdealState(state);
    }

    componentDidMount() {
        const { adyen } = window;
        const { current } = this.fieldRef;

        if (adyen) {
            adyen.create(IDEAL_TYPE, {
                onChange: this.handleChange
            }).mount(current);
        }
    }

    render() {
        return (
            <AdyenIdeal
              { ...this.props }
              { ...this.state }
              fieldRef={ this.fieldRef }
            />
        );
    }
}

export default middleware(AdyenIdealContainer, 'Scandipwa/AdyenGraphQl/Component/AdyenIdeal/Component');
